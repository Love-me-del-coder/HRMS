import nodemailer from 'nodemailer';

let initializedTransporter: nodemailer.Transporter | null = null;

export const initEmailService = async () => {
  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
    // Generate a testing account on the fly for development
    const testAccount = await nodemailer.createTestAccount();
    initializedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Ethereal Email Engine Initialized.`);
  } else {
    // Standard SMTP setup for production
    initializedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });
  }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!initializedTransporter) {
    await initEmailService();
  }
  
  const info = await initializedTransporter!.sendMail({
    from: '"HRMS System" <noreply@hrms-saas.com>',
    to,
    subject,
    html,
  });

  console.log(`📩 Email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  return info;
};
