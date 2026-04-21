const db = require('../database');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/emailService');

module.exports = {
  // ==========================================
  // 1. SOLICITAR CÓDIGO (Envia o e-mail OTP)
  // ==========================================
  async requestOtp(req, res) {
    const { email, store_slug } = req.body;

    try {
      // Descobre qual é a loja
      const store = await db('stores').where({ slug: store_slug }).first();
      if (!store) return res.status(404).json({ error: 'Loja não encontrada.' });

      // Procura o cliente DENTRO dessa loja específica
      const customer = await db('customers').where({ store_id: store.id, email }).first();
      
      if (!customer) {
        return res.status(404).json({ error: 'Nenhum pedido encontrado com este e-mail nesta loja.' });
      }

      // Gera um código de 6 dígitos aleatório
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Define a validade do código para 15 minutos
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Salva no banco de dados
      await db('customers').where({ id: customer.id }).update({
        otp_code: otpCode,
        otp_expires_at: expiresAt
      });

      // DISPARA O E-MAIL PREMIUM PARA O CLIENTE
      await EmailService.sendCustomerOtp(email, store.name, otpCode);

      return res.json({ message: 'Código enviado para o seu e-mail!' });

    } catch (error) {
      console.error('Erro no Request OTP:', error);
      return res.status(500).json({ error: 'Erro interno ao gerar código.' });
    }
  },

  // ==========================================
  // 2. VALIDAR CÓDIGO E ENTRAR
  // ==========================================
  async verifyOtp(req, res) {
    const { email, otp_code, store_slug } = req.body;

    try {
      const store = await db('stores').where({ slug: store_slug }).first();
      if (!store) return res.status(404).json({ error: 'Loja não encontrada.' });

      const customer = await db('customers').where({ store_id: store.id, email }).first();
      if (!customer) return res.status(404).json({ error: 'Cliente não encontrado.' });

      // Verifica se o código bate e se não expirou
      const now = new Date();
      if (customer.otp_code !== otp_code || new Date(customer.otp_expires_at) < now) {
        return res.status(401).json({ error: 'Código inválido ou expirado.' });
      }

      // Sucesso! Limpa o código do banco por segurança
      await db('customers').where({ id: customer.id }).update({ otp_code: null, otp_expires_at: null });

      // Gera o "Crachá" (Token) do Cliente Final
      const token = jwt.sign(
        { id: customer.id, store_id: store.id, role: 'customer' }, 
        process.env.JWT_SECRET || 'fallback_secret_key', 
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        customer: { id: customer.id, name: customer.name, email: customer.email }
      });

    } catch (error) {
      console.error('Erro no Verify OTP:', error);
      return res.status(500).json({ error: 'Erro interno ao validar código.' });
    }
  }
};