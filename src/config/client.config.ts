import { registerAs } from '@nestjs/config';

export default registerAs('client', () => {
  return {
    url: process.env.CLIENT_URL,
    revalidateSecret: process.env.CLIENT_REVALIDATE_SECRET,
  };
});
