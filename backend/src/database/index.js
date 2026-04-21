const knex = require('knex');
const knexfile = require('../../knexfile');

// Inicia a conexão usando a configuração do knexfile
const db = knex(knexfile);

module.exports = db;