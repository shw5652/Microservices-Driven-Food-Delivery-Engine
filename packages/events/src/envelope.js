import { randomUUID } from 'node:crypto';

export function createEvent(type, payload, { correlationId } = {}) {
  return {
    eventId: randomUUID(),
    type,
    version: 1,
    correlationId: correlationId ?? randomUUID(),
    occurredAt: new Date().toISOString(),
    payload,
  };
}