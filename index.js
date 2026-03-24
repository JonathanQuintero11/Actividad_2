const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.get('/usuario', (req, res) => {
  const usuario = {
    id: 1,
    nombre: 'Jonathan',
    rol: 'Administrador'
  };

  res.json(usuario);
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});