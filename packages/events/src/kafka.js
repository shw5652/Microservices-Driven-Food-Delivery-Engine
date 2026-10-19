import { Kafka, logLevel } from 'kafkajs';
import { dlqTopic } from './topics.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createKafka(clientId) {
  return new Kafka({
    clientId,
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    logLevel: logLevel.WARN,
    retry: { retries: 8 },
  });
}

export async function ensureTopics(kafka, topics, partitions = 3) {
  const admin = kafka.admin();
  await admin.connect();
  const all = topics.flatMap((t) => [t, dlqTopic(t)]);
  await admin.createTopics({
    waitForLeaders: true,
    topics: all.map((topic) => ({ topic, numPartitions: partitions, replicationFactor: 1 })),
  });
  await admin.disconnect();
}

export async function createProducer(kafka) {
  const producer = kafka.producer({ idempotent: true, maxInFlightRequests: 1 });
  await producer.connect();
  return producer;
}

// key = orderId keeps all events of one order in the same partition (ordering guarantee)
export async function publish(producer, topic, event, key) {
  await producer.send({
    topic,
    acks: -1,
    messages: [
      {
        key: String(key ?? event.correlationId),
        value: JSON.stringify(event),
        headers: { eventType: event.type, correlationId: event.correlationId },
      },
    ],
  });
}

/**
 * Starts a consumer with retries (exponential backoff) and a dead-letter topic.
 * handler(event, { topic, partition }) must be idempotent: Kafka is at-least-once.
 */
export async function runConsumer({
  kafka,
  groupId,
  topics,
  handler,
  producer,
  maxRetries = 3,
  baseDelayMs = 500,
}) {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let event;
      try {
        event = JSON.parse(message.value.toString());
      } catch {
        await sendToDlq(producer, topic, message, 'invalid JSON');
        return;
      }

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          await handler(event, { topic, partition });
          return;
        } catch (err) {
          if (attempt === maxRetries) {
            console.error(`[${groupId}] giving up on ${event.eventId}:`, err.message);
            await sendToDlq(producer, topic, message, err.message);
            return;
          }
          const delay = baseDelayMs * 2 ** attempt;
          console.warn(`[${groupId}] retry ${attempt + 1}/${maxRetries} in ${delay}ms: ${err.message}`);
          await sleep(delay);
        }
      }
    },
  });

  return consumer;
}

async function sendToDlq(producer, topic, message, reason) {
  await producer.send({
    topic: dlqTopic(topic),
    messages: [
      {
        key: message.key,
        value: message.value,
        headers: { ...message.headers, dlqReason: String(reason), originalTopic: topic },
      },
    ],
  });
}