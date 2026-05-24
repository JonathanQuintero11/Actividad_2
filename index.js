const express = require('express');
const pool = require('./db');
const app = express();

// REQUISITO: Para leer el cuerpo de las peticiones POST (JSON)
app.use(express.json());

// ==========================================
//          RUTAS PARA ALUMNOS
// ==========================================

// GET - Obtener todos los alumnos
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// GET - Obtener un alumno específico por ID (NUEVA RUTA - PARTE 2)
app.get('/alumnos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validación Parte 4: El ID debe ser numérico
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query('SELECT * FROM alumno WHERE id = $1', [id]);

    // Validación Parte 7: Si no existe
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el alumno' });
  }
});

// POST - Insertar Alumno
app.post('/alumnos', async (req, res) => {
  try {
    const { nombre, apellido, edad, correo } = req.body;
    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const consulta = 'INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *';
    const valores = [nombre, apellido, edad, correo];
    const resultado = await pool.query(consulta, valores);
    res.status(201).json({ mensaje: 'Alumno insertado correctamente', alumno: resultado.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: 'Error al insertar el alumno' });
  }
});

// ==========================================
//          RUTAS PARA MATERIAS
// ==========================================

// GET - Obtener todas las materias
app.get('/materias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materia ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las materias" });
  }
});

// GET - Obtener una materia específica por ID (NUEVA RUTA - PARTE 3)
app.get('/materias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validación Parte 4: El ID debe ser numérico
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query('SELECT * FROM materia WHERE id = $1', [id]);

    // Validación Parte 7: Si no existe
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la materia" });
  }
});

// POST - Crear materia
app.post('/materias', async (req, res) => {
  try {
    const { nombre, semestre, creditos } = req.body;
    if (!nombre || !semestre || !creditos) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const query = 'INSERT INTO materia (nombre, semestre, creditos) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(query, [nombre, semestre, creditos]);
    res.status(201).json({ mensaje: "Materia agregada con éxito", materia: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Error al insertar la materia" });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});