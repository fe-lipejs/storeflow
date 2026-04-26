require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes'); // Importa o mapa de rotas
const StripeController = require('./controllers/StripeController'); // Importado para o Webhook

const app = express();

app.use(cors());

// ==============================================================
// WEBHOOK DO STRIPE (PRECISA SER A PRIMEIRA ROTA!)
// O express.raw garante que a carta do Stripe chegue lacrada.
// ==============================================================
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), StripeController.webhook);
app.post('/api/webhooks/stripe-connect', express.raw({ type: 'application/json' }), StripeController.webhookConnect);

// ==============================================================
// CONFIGURAÇÕES GERAIS PARA O RESTO DO SISTEMA
// ==============================================================
app.use(express.json()); // Transforma o resto das requisições em JSON
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

// Diz para o Express usar o arquivo de rotas para todo o resto
app.use('/api', routes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`###@ API Profissional rodando na porta ${PORT}`);
});