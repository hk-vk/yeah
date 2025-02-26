declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_NGROK_URL: string;
      // ...other env vars...
    }
  }
}

export {}
