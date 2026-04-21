const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); // Para gerar nomes únicos pras imagens

module.exports = {
  // Onde as imagens serão salvas e como vão se chamar
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
      // Gera um nome aleatório (ex: 8f7a9b-tenis.jpg) para não dar conflito
      const hash = crypto.randomBytes(6).toString('hex');
      const fileName = `${hash}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  // Aceitar apenas imagens
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Envie JPG, PNG ou WEBP.'));
    }
  }
};