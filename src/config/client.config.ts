import { registerAs } from '@nestjs/config';

export default registerAs('client', () => {
  return {
    thisURL: process.env.CURRENT_URL,
    url: process.env.CLIENT_URL,
    revalidateSecret: process.env.CLIENT_REVALIDATE_SECRET,
  };
});
