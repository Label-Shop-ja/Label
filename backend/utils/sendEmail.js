import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Crear un transportador (el servicio que enviará el correo, ej: Gmail, SendGrid)
  //    Necesitarás configurar tus variables de entorno con las credenciales de tu proveedor.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Para servicios como Gmail, puede que necesites activar la opción "less secure app" o usar una "App Password".
  });

  // 2. Definir las opciones del correo
  const mailOptions = {
    from: 'Label App <no-reply@labelapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // Puedes añadir una versión HTML más rica si quieres
  };

  // 3. Enviar el correo
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
