const express = require('express');
const pool = require('./db');
const app = express();

app.get('/', (req, res) => {
  res.send('API funcionando');
});

pool.connect()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL');
  })
  .catch((err) => {
    console.error('Error de conexión', err);
  });

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});