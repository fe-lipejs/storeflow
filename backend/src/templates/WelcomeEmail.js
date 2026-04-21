module.exports = function WelcomeEmailTemplate(lojistaNome, lojaSlug) {
  const urlPainel = "http://localhost:5173/login";
  const urlLoja = `http://localhost:5173/${lojaSlug}`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');
        
        /* Reset básico para e-mails */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body { 
          margin: 0; 
          padding: 0; 
          background-color: #f9fafb; 
          font-family: 'Montserrat', Helvetica, Arial, sans-serif; 
          -webkit-font-smoothing: antialiased;
        }
        
        .wrapper { width: 100%; background-color: #f9fafb; padding: 40px 0; }
        
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 10px 40px rgba(0,0,0,0.05); 
          border: 1px solid #eee; 
        }
        
        /* Cabeçalho Clean (Igual a Landing Page) */
        .header { 
          padding: 30px; 
          text-align: center; 
          border-bottom: 1px solid #eee;
        }
        .header h1 { 
          color: #000000; 
          margin: 0; 
          font-size: 20px; 
          font-weight: 900; 
          letter-spacing: 1px; 
          text-transform: uppercase; 
        }
        
        /* Corpo do E-mail */
        .body-content { padding: 50px 40px; text-align: center; }
        
        .greeting { 
          font-size: 32px; 
          color: #000000; 
          margin: 0 0 20px 0; 
          font-weight: 900; 
          letter-spacing: -1px;
          text-transform: uppercase;
          line-height: 1.2;
        }
        
        .text { 
          font-size: 15px; 
          line-height: 1.6; 
          color: #666666; 
          margin: 0 0 40px 0; 
          font-weight: 500;
        }
        
        /* Card de Destaque (Link da Loja) */
        .highlight-card { 
          background-color: #f8fafc; 
          border: 1px solid #eaeaea; 
          padding: 30px; 
          border-radius: 12px; 
          margin-bottom: 40px; 
        }
        .highlight-label { 
          font-size: 12px; 
          font-weight: 700; 
          color: #999999; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          margin-bottom: 10px; 
          display: block; 
        }
        .highlight-link { 
          font-size: 20px; 
          font-weight: 800; 
          color: #000000; 
          text-decoration: none; 
          word-break: break-all; 
        }
        
        /* Botão Principal (Pílula Negra) */
        .btn-container { margin-bottom: 20px; }
        .btn { 
          display: inline-block; 
          background-color: #000000; 
          color: #ffffff !important; 
          text-decoration: none; 
          padding: 20px 45px; 
          border-radius: 50px; 
          font-weight: 800; 
          font-size: 14px; 
          letter-spacing: 1px; 
          text-transform: uppercase;
        }
        
        /* Rodapé Dark */
        .footer { 
          padding: 40px 30px; 
          text-align: center; 
          background-color: #000000; 
        }
        .footer p { 
          margin: 0; 
          font-size: 11px; 
          color: #999999; 
          text-transform: uppercase;
          letter-spacing: 1px;
          line-height: 1.6; 
        }
        .footer span { color: #ffffff; font-weight: 800; }
      </style>
    </head>
    <body>
      <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="email-container" width="100%" cellpadding="0" cellspacing="0" role="presentation">
              
              <tr>
                <td class="header">
                  <h1>🛍️ MEUSAAS</h1>
                </td>
              </tr>
              
              <tr>
                <td class="body-content">
                  <h2 class="greeting">Sua loja está no ar.</h2>
                  <p class="text">Olá, <b>${lojistaNome}</b>. A arquitetura da sua nova vitrine foi gerada com sucesso. Você acaba de dar o primeiro passo para parar de perder vendas no WhatsApp.</p>
                  
                  <div class="highlight-card">
                    <span class="highlight-label">O link oficial da sua vitrine</span>
                    <a href="${urlLoja}" class="highlight-link">meusaas.com/${lojaSlug}</a>
                  </div>
                  
                  <div class="btn-container">
                    <a href="${urlPainel}" class="btn">Acessar Meu Painel</a>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p style="margin-bottom: 10px;">&copy; 2026 MEUSAAS. Todos os direitos reservados.</p>
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