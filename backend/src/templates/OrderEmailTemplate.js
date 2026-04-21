module.exports = (order, customer, store, items) => {
  // Constrói a lista de itens com design super clean
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #eaeaea;">
        <span style="font-size: 14px; font-weight: 800; color: #000000; text-transform: uppercase;">${item.product_name}</span><br>
        <span style="font-size: 12px; font-weight: 600; color: #666666;">Qtd: ${item.quantity}</span>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: 900; color: #000000;">
        R$ ${parseFloat(item.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body { 
          margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Montserrat', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;
        }
        
        .wrapper { width: 100%; background-color: #f9fafb; padding: 40px 0; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #eee; }
        
        /* HEADER - Trazendo a logo se houver, ou texto forte */
        .header { padding: 40px 30px 20px; text-align: center; }
        .header img { max-width: 120px; border-radius: 50%; margin-bottom: 20px; }
        .header h1 { color: #000000; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
        .header p { color: #666666; font-size: 15px; font-weight: 600; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }

        /* BODY CONTENT */
        .body-content { padding: 0 40px 40px; }
        
        .section-title { font-size: 12px; font-weight: 800; color: #999999; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #000000; padding-bottom: 5px; display: inline-block; margin: 30px 0 15px; }
        
        .info-text { font-size: 14px; line-height: 1.6; color: #444444; font-weight: 500; margin: 0; }
        .info-text strong { color: #000000; font-weight: 800; }

        /* TABELA DE PRODUTOS */
        .products-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        
        /* CAIXA DE TOTAL */
        .total-box { background-color: #f8fafc; border: 1px solid #eaeaea; padding: 25px; margin-top: 30px; border-radius: 12px; }
        .total-box table { width: 100%; }
        .total-label { font-size: 14px; color: #666666; font-weight: 700; text-transform: uppercase; }
        .total-value { text-align: right; font-size: 24px; font-weight: 900; color: #000000; }

        /* BOTÃO */
        .btn-container { text-align: center; margin-top: 40px; }
        .btn { display: inline-block; background-color: #000000; color: #ffffff !important; text-decoration: none; padding: 20px 45px; border-radius: 50px; font-weight: 800; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
        
        /* FOOTER */
        .footer { padding: 30px; text-align: center; background-color: #000000; }
        .footer p { margin: 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6; }
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
                  ${store.logo_url ? `<img src="${store.logo_url}" alt="${store.name}">` : ''}
                  <h1>Pagamento Confirmado</h1>
                  <p>Pedido #${order.id}</p>
                </td>
              </tr>
              
              <tr>
                <td class="body-content">
                  <p style="font-size: 16px; font-weight: 600; color: #000000;">Olá, ${customer.name.split(' ')[0]}!</p>
                  <p class="info-text">Recebemos o pagamento do seu pedido na loja <strong>${store.name}</strong>. Já estamos preparando tudo para o envio.</p>

                  <h3 class="section-title">Informações</h3>
                  <p class="info-text">
                    <strong>Pagamento:</strong> ${order.payment_method?.toUpperCase() || 'Cartão de Crédito'}<br><br>
                    <strong>Entrega:</strong><br>
                    ${customer.address}
                  </p>

                  <h3 class="section-title">Resumo do Pedido</h3>
                  <table class="products-table">
                    ${itemsHtml}
                  </table>

                  <div class="total-box">
                    <table>
                      <tr>
                        <td class="total-label">Total Pago:</td>
                        <td class="total-value">R$ ${parseFloat(order.total_amount).toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>

                  <div class="btn-container">
                    <a href="http://localhost:5173/${store.slug}/minha-conta" class="btn">Acompanhar Meu Pedido</a>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p style="margin-bottom: 8px;">Este e-mail foi enviado por ${store.name}</p>
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