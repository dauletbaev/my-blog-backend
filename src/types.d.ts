declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'provision';
      PORT: string;

      CURRENT_URL: string;
      CLIENT_URL: string;
      CLIENT_REVALIDATE_SECRET: string;

      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;

      MY_EMAIL: string;
      MAIL_HOST: string;
      MAIL_USER: string;
      MAIL_PASSWORD: string;
      MAIL_FROM: string;

      AWS_S3_BUCKET: string;
      AWS_S3_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
    }
  }

  namespace Storage {
    interface MultipartFile {
      toBuffer: () => Promise<Buffer>;
      file: NodeJS.ReadableStream;
      filepath: string;
      fieldname: string;
      filename: string;
      encoding: string;
      mimetype: string;
      fields: import('@fastify/multipart').MultipartFields;
    }
  }
}

// declare module 'fastify' {
//   interface FastifyRequest {
//     incomingFile: Storage.MultipartFile;
//   }
// }

export {};
