import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => {
  return {
    bucketS3: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_S3_REGION,
    key: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
  };
});
