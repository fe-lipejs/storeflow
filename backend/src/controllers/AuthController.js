const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const EmailService = require('../services/emailService');

module.exports = {
  // ==========================================
  // 1. REGISTRO (CRIAR A LOJA E O USUÁRIO)
  // ==========================================
  async register(req, res) {
    const { name, email, password, store_name } = req.body;

    try {
      // 1. BARREIRA 1: Verifica se o e-mail já existe na tabela de usuários
      const userExists = await db('users').where({ email }).first();
      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso por outro usuário.' });
      }

      // 2. BARREIRA 2: Verifica se o e-mail já existe na tabela de lojas
      const storeEmailExists = await db('stores').where({ email }).first();
      if (storeEmailExists) {
        return res.status(400).json({ error: 'Já existe uma loja cadastrada com este e-mail.' });
      }

      // 3. Cria o SLUG (a URL da loja baseada no nome)
      const slug = store_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // 4. BARREIRA 3: Verifica se o SLUG já existe
      const storeExists = await db('stores').where({ slug }).first();
      if (storeExists) {
        return res.status(400).json({ error: 'Este nome de loja já está em uso. Tente outro.' });
      }

      // 5. Criptografa a senha para segurança máxima
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inicia uma transação no banco de dados (se der erro no meio, ele cancela tudo)
      const trx = await db.transaction();

      try {
        // Cria a Loja na tabela 'stores' primeiro
        const [storeId] = await trx('stores').insert({
          name: store_name,
          slug: slug,
          email: email,
          subscription_status: 'trial'
        });

        // Cria o Usuário (Dono da loja) e amarra ele ao store_id
        await trx('users').insert({
          store_id: storeId,
          name,
          email,
          password: hashedPassword,
          role: 'admin'
        });

        // Confirma a transação salvando no banco
        await trx.commit();

        // Dispara as boas-vindas reais!
        await EmailService.sendWelcomeLojista(email, name, slug);

        return res.status(201).json({ message: 'Loja criada com sucesso!' });

      } catch (trxError) {
        await trx.rollback();
        console.error('Erro na transação de registro:', trxError);
        return res.status(500).json({ error: 'Erro ao salvar os dados no banco.' });
      }

    } catch (error) {
      console.error('Erro interno no servidor (Register):', error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },

  // ==========================================
  // 2. LOGIN DO LOJISTA
  // ==========================================
  async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await db('users').where({ email }).first();

      if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos' });
      }

      const store = await db('stores').where({ id: user.store_id }).first();

      const token = jwt.sign(
        { id: user.id, store_id: user.store_id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          subscription_status: store.subscription_status, 
          stripe_account_id: store.stripe_account_id      
        },
        token
      });

    } catch (error) {
      console.error('Erro interno no servidor (Login):', error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },

  // ==========================================
  // 3. ESQUECI MINHA SENHA (GERAR E ENVIAR LINK)
  // ==========================================
  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await db('users').where({ email }).first();
      if (!user) return res.json({ message: 'Link enviado se o e-mail existir.' });

      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // CORREÇÃO: Passando o e-mail, o nome (user.name) e o token.
      await EmailService.sendPasswordReset(user.email, user.name, resetToken);

      return res.json({ message: 'Link de recuperação enviado!' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro no servidor' });
    }
  },

  // ==========================================
  // 4. REDEFINIR A SENHA (SALVAR A NOVA)
  // ==========================================
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
      // 1. Verifica se o token é válido e se não expirou (passou de 1h)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

      // 2. Criptografa a senha nova
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 3. Salva no banco de dados do usuário correspondente ao token
      await db('users').where({ id: decoded.id }).update({ password: hashedPassword });

      return res.json({ message: 'Senha alterada com sucesso! Você já pode fazer login.' });

    } catch (error) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite a recuperação novamente.' });
    }
  }
};