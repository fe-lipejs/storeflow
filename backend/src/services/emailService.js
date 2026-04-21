const nodemailer = require('nodemailer');
const PasswordResetTemplate = require('../templates/PasswordResetEmail');

// 1. IMPORTAMOS O TEMPLATE DO ARQUIVO EXTERNO
const WelcomeEmailTemplate = require('../templates/WelcomeEmail');
const CustomerOtpTemplate = require('../templates/CustomerOtpEmail');


// 2. CONFIGURAÇÃO DO MOTOR DE ENVIO (Lendo do .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

module.exports = {
  // === E-MAIL DE BOAS-VINDAS ===
  async sendWelcomeLojista(lojistaEmail, lojistaNome, lojaSlug) {
    try {
      // Injetamos os dados no template externo e pegamos o HTML pronto
      const htmlContent = WelcomeEmailTemplate(lojistaNome, lojaSlug);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: lojistaEmail,
        subject: "🚀 Bem-vindo à MEUSAAS! Sua loja está no ar.",
        html: htmlContent
      });
      console.log(`📧 E-mail de Boas-vindas enviado para ${lojistaEmail}`);
    } catch (error) {
      console.error("Erro ao enviar e-mail de boas-vindas:", error);
    }
  },

  // === E-MAIL DE REDEFINIÇÃO DE SENHA ===
  // === E-MAIL DE REDEFINIÇÃO DE SENHA (LOJISTA) ===
  // Recebe: e-mail do lojista, nome do lojista, token criptografado
  async sendPasswordReset(userEmail, userName, resetToken) {
    try {
      // O resetToken DEVE vir aqui para o link não ser 'undefined'
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
      const htmlContent = PasswordResetTemplate(userName, resetLink);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: "🔒 Recuperação de Senha • MEUSAAS",
        html: htmlContent
      });
      console.log(`📧 E-mail de recuperação enviado para: ${userEmail}`);
    } catch (error) {
      console.error("Erro no serviço de e-mail:", error);
    }
  },
  // ESQUECI MINHA SENHA (LOJISTA)
  async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      // 1. Procura o Lojista no banco
      const user = await db('users').where({ email }).first();

      // REGRA DE SEGURANÇA: Se o usuário não existir, devolvemos SUCESSO na cara dura
      // para evitar que robôs descubram quais e-mails são reais.
      if (!user) {
        return res.json({ message: 'Se o e-mail estiver cadastrado, enviamos um link.' });
      }

      // 2. Cria um Token de recuperação válido por apenas 1 hora
      const resetToken = jwt.sign(
        { id: user.id }, 
        process.env.JWT_SECRET || 'fallback_secret_key', 
        { expiresIn: '1h' }
      );

      // 3. Dispara o E-mail Premium!
      await EmailService.sendPasswordReset(user.email, user.name, resetToken);

      // 4. Responde ao Frontend
      return res.json({ message: 'Se o e-mail estiver cadastrado, enviamos um link.' });

    } catch (error) {
      console.error('Erro no Forgot Password:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },
  // === E-MAIL DE CONFIRMAÇÃO DE VENDA (CLIENTE FINAL) ===
  async sendOrderConfirmation(customerEmail, htmlContent) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: customerEmail,
        subject: "✅ Pagamento Confirmado! Seu pedido está a caminho.",
        html: htmlContent
      });
      console.log(`📧 E-mail de venda enviado para ${customerEmail}`);
    } catch (error) {
      console.error("Erro ao enviar e-mail de pedido:", error);
    }
  },

  // === NOVO: ENVIO DO CÓDIGO OTP PARA O CLIENTE ===
  async sendCustomerOtp(customerEmail, storeName, otpCode) {
    try {
      const htmlContent = CustomerOtpTemplate(storeName, otpCode);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: customerEmail,
        subject: `🔑 Seu código de acesso da loja ${storeName}`,
        html: htmlContent
      });
      console.log(`📧 Código OTP enviado para ${customerEmail}`);
    } catch (error) {
      console.error("Erro ao enviar e-mail OTP:", error);
    }
  }
};