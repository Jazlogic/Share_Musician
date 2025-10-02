import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // generated ethereal user
    pass: process.env.EMAIL_PASS, // generated ethereal password
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: to, // list of receivers
    subject: 'Verificación de cuenta Share Musician', // Subject line
    html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta: <a href="${verificationLink}">${verificationLink}</a></p>`, // html body
  };

  await transporter.sendMail(mailOptions);
};