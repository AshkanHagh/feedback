import * as Sentry from '@sentry/bun';

Sentry.init({
    dsn: process.env.SENTRY_KEY,
    integrations: [],
    tracesSampleRate: 1.0,
});