const express = require('express');
const pool = require('./db');
const app = express();

// REQUISITO: Para leer el cuerpo de las peticiones POST (JSON)
app.use(express.json());

// --- RUTA GET (Ya la tenías) ---
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// --- NUEVA RUTA POST: Insertar Alumno ---
app.post('/alumnos', async (req, res) => {
  try {
    const { nombre, apellido, edad, correo } = req.body;

    // Validación: Que no falte ningún dato
    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Insertar en la base de datos
    // Usamos $1, $2, etc., por seguridad (evita Inyección SQL)
    const consulta = 'INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *';
    const valores = [nombre, apellido, edad, correo];

    const resultado = await pool.query(consulta, valores);

    res.status(201).json({
      mensaje: 'Alumno insertado correctamente',
      alumno: resultado.rows[0]
    });

  } catch (error) {
    console.error('Error al insertar:', error.message);
    // Manejo de error por correo duplicado (UNIQUE)
    if (error.code === '23505') {
        return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al insertar el alumno' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});