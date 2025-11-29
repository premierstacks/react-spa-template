declare const process: {
  env: {
    // 'development' | 'production'
    NODE_ENV: string;

    // 'development' | 'production'
    WEBPACK_MODE: string;

    // regex: ^\d+\.\d+\.\d+$
    APP_VERSION: string;

    // regex: ^[a-zA-Z0-9-_]+$
    APP_NAME: string;

    // 'local' | 'ci' | 'development' | 'qa' | 'staging' | 'production'
    APP_ENV: string;

    // regex: ^[a-zA-Z0-9]+$
    OTLP_API_KEY: string | null;
  };
};
