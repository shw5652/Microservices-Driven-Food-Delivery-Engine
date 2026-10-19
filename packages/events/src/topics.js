export const TOPICS = Object.freeze({
  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  RESTAURANT_ACCEPTED: 'restaurant.accepted',
  RESTAURANT_REJECTED: 'restaurant.rejected',
  DELIVERY_ASSIGNED: 'delivery.assigned',
});

export const dlqTopic = (topic) => `${topic}.dlq`;