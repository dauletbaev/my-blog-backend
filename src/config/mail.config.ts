import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => {
  const config = {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
  };

  return {
    myEmail: process.env.MY_EMAIL,
    from: process.env.MAIL_FROM,
    transport: `smtp://${config.user}:${config.password}@${config.host}`,
  };
});
