module.exports = function PasswordResetEmailTemplate(userName, resetLink) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Montserrat', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f9fafb; padding: 40px 0; }
        .email-container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #eee; text-align: center; }
        .header { padding: 40px 30px 20px; border-bottom: 1px solid #f1f5f9; }
        .header h1 { color: #000000; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
        .body-content { padding: 40px; }
        .icon-box { margin: 0 auto 30px; width: 48px; height: 48px; }
        .title { font-size: 24px; color: #000000; font-weight: 900; margin: 0 0 15px; letter-spacing: -1px; text-transform: uppercase; }
        .text { font-size: 14px; color: #64748b; margin: 0 0 35px; line-height: 1.6; font-weight: 500; }
        .btn { display: inline-block; background-color: #000000; color: #ffffff !important; text-decoration: none; padding: 20px 45px; border-radius: 50px; font-weight: 800; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
        .footer { padding: 30px; text-align: center; background-color: #000000; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .footer span { color: #ffffff; font-weight: 800; }
      </style>
    </head>
    <body>
      <table class="wrapper" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table class="email-container" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header"><h1>MEUSAAS</h1></td>
              </tr>
              <tr>
                <td class="body-content">
                  <div class="icon-box">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11M5 11H19V22H5V11ZM12 15V18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h2 class="title">Recuperar Acesso</h2>
                  <p class="text">Olá, <b>${userName}</b>. Recebemos uma solicitação para redefinir sua senha. Se foi você, clique no botão abaixo. Este link expira em 1 hora.</p>
                  <a href="${resetLink}" class="btn">Redefinir Senha</a>
                </td>
              </tr>
              <tr>
                <td class="footer"><p>Segurança • <span>MEUSAAS</span></p></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};