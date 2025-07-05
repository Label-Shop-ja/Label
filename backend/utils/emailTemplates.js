// C:\Respaldo Jhosber\Proyectos\Label\backend\utils\emailTemplates.js

export const getPasswordResetHTML = (code) => {
  const logoUrl = "https://res.cloudinary.com/dnkr9tvtq/image/upload/v1751604992/Gemini_Generated_Image_t1q1t8t1q1t8t1q1_xmbwgc_c_crop_w_600_h_800_c9nu4e.png";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #111827; padding: 30px; text-align: center; }
        .header img { max-width: 80px; }
        .content { padding: 40px 30px; color: #333; line-height: 1.6; }
        .code-box { background-color: #f0f2f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; }
        .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
        .footer a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Label Logo">
        </div>
        <div class="content">
          <h1 style="font-size: 24px; color: #111827; margin-top: 0;">Recuperación de Contraseña</h1>
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Label. Usa el siguiente código para continuar:</p>
          <div class="code-box">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Tu código de verificación es:</p>
            <p class="code">${code}</p>
          </div>
          <p>Este código expirará en <strong>10 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          <p>Gracias,<br>El equipo de Label</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Label. Todos los derechos reservados.</p>
          <p>Si tienes problemas, contacta a nuestro <a href="mailto:soporte@labelapp.com">equipo de soporte</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
