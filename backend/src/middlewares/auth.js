const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Pega o token que vem no cabeçalho (Header) da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido. Acesso negado.' });
  }

  // O token geralmente vem escrito "Bearer asdfghjkl...". Vamos separar só o código.
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do Token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  // Verifica se o token é válido e não expirou
  jwt.verify(token, process.env.JWT_SECRET || 'segredo_padrao_aqui', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Se o token for válido, ele descobre quem é a loja e injeta o ID na requisição
    // Assim, os próximos controladores sabem exatamente qual loja está logada
    req.storeId = decoded.store_id; 
    
    // Deixa a requisição passar para o banco de dados
    return next();
  });
};