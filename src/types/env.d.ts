declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL : string;
      readonly ORIGIN : string;
      readonly PORT : number;
      readonly SENTRY_KEY : string;
      readonly REDIS_URL : string;
      readonly SENTRY_AUTH_TOKEN : string;
      readonly ACTIVATION_TOKEN : string;
      readonly ACCESS_TOKEN : string;
      readonly REFRESH_TOKEN : string;
      readonly ACCESS_TOKEN_EXPIRE : string;
      readonly REFRESH_TOKEN_EXPIRE : string;
      readonly SMTP_HOST : string;
      readonly SMTP_PORT : number;
      readonly SMTP_SERVICE : string;
      readonly SMTP_MAIL : string;
      readonly SMTP_PASSWORD : string;
      readonly TIMEOUT_SEC : string;
    }
  }
}

export {}
