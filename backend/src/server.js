require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // Importa o mapa de rotas
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/api', routes); // Diz para o Express usar o arquivo de rotas

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Profissional rodando na porta ${PORT}`);
});