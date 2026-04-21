module.exports = function CustomerOtpEmailTemplate(storeName, otpCode) {
  // Formata o código para ficar bonito (ex: "482 915" em vez de "482915")
  const formattedOtp = otpCode.toString().replace(/(\d{3})(\d{3})/, '$1 $2');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800;900&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        
        body { 
          margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Montserrat', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;
        }
        
        .wrapper { width: 100%; background-color: #f9fafb; padding: 50px 0; }
        .email-container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #eee; text-align: center; }
        
        /* HEADER */
        .header { padding: 40px 30px 10px; }
        .header h1 { color: #000000; margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
        
        /* CONTEÚDO */
        .body-content { padding: 20px 40px 50px; }
        .title { font-size: 22px; color: #000000; font-weight: 900; margin: 0 0 15px; letter-spacing: -0.5px; text-transform: uppercase; }
        .text { font-size: 14px; color: #666666; margin: 0 0 30px; line-height: 1.6; font-weight: 500; }
        
        /* CAIXA DO CÓDIGO */
        .otp-box { background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 25px 10px; font-size: 40px; font-weight: 900; color: #000000; letter-spacing: 8px; margin-bottom: 25px; }
        
        .small-text { font-size: 12px; color: #999999; font-weight: 500; }

        /* FOOTER */
        .footer { padding: 30px; background-color: #000000; color: #999999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6; }
        .footer span { color: #ffffff; font-weight: 800; }
      </style>
    </head>
    <body>
      <table class="wrapper" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table class="email-container" width="100%" cellpadding="0" cellspacing="0">
              
              <tr>
                <td class="header">
                  <h1>🛍️ ${storeName}</h1>
                </td>
              </tr>
              
              <tr>
                <td class="body-content">
                  <h2 class="title">Seu Código de Acesso</h2>
                  <p class="text">Use a chave de segurança abaixo para acessar seu painel de pedidos. Ela é válida por 15 minutos.</p>
                  
                  <div class="otp-box">
                    ${formattedOtp}
                  </div>
                  
                  <p class="small-text">Se você não solicitou este código, pode ignorar este e-mail.</p>
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p style="margin-bottom: 10px;">Este e-mail foi enviado pela loja ${storeName}</p>
                  <p>Tecnologia por <span>Raffros Tecnologia</span></p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};