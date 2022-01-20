declare namespace NodeJS {
  export interface ProcessEnv {
    APP_ENV: string;
    BOT_TOKEN_DEV: string;
    MONGODB_URI_DEV: string;
    BOT_TOKEN_PROD: string;
    MONGODB_URI_PROD: string;
  }
}
