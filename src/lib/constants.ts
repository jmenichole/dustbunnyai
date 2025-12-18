// Shared constants for the application

// Authentication
export const MIN_PASSWORD_LENGTH = 8;

// Subscription defaults
export const DEFAULT_CURRENCY = "USD";

// Subscription frequencies
export const SUBSCRIPTION_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export type SubscriptionFrequency = typeof SUBSCRIPTION_FREQUENCIES[number];
