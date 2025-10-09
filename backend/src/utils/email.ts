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

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: to, // list of receivers
    subject: 'Código de Verificación para Share Musician', // Subject line
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p><p>Por favor, introduce este código en la aplicación para verificar tu cuenta.</p>`, // html body
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Restablecimiento de contraseña - Share Musician',
    html: `<p>Tu código para restablecer la contraseña es: <strong>${token}</strong></p><p>Si no solicitaste este cambio, ignora este correo.</p>`,
  };

  await transporter.sendMail(mailOptions);
};