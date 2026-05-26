const express = require('express');
const pool = require('./db');
const app = express();
const connectMongoDB = require("./mongoConnection");
const Vehiculo = require("./Vehiculo");


// REQUISITO: Para leer el cuerpo de las peticiones POST (JSON)
app.use(express.json());

// ==========================================
//           RUTAS PARA ALUMNOS
// ==========================================

// GET - Obtener todos los alumnos
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno WHERE isActive = true ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// GET - Obtener un alumno específico por ID (NUEVA RUTA - PARTE 2)
app.get('/alumnos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query('SELECT * FROM alumno WHERE id = $1 AND isActive = true', [id]);

    // Validación Parte 7: Si no existe
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
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

// --- NUEVOS ENDPOINTS PROYECTO FINAL (ALUMNOS) ---

// GET - Buscar alumno por nombre o apellido (LIKE)
app.get('/api/searchAlumno', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "El parámetro de búsqueda es obligatorio" });

    const search = `%${query}%`;
    const sql = `SELECT * FROM alumno WHERE (nombre LIKE $1 OR apellido LIKE $1) AND isActive = true`;
    const result = await pool.query(sql, [search]);
    res.status(200).json({ message: "Búsqueda finalizada", data: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error en búsqueda", error: error.message });
  }
});

// PUT - Modificar alumno
app.put('/api/updateAlumno/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, edad, correo } = req.body;
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const sql = `UPDATE alumno SET nombre = $1, apellido = $2, edad = $3, correo = $4 
                 WHERE id = $5 AND isActive = true RETURNING *`;
    const result = await pool.query(sql, [nombre, apellido, edad, correo, id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Alumno no encontrado" });
    res.status(200).json({ message: "Actualizado", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar" });
  }
});

// DELETE - Eliminar alumno (Lógico)
app.delete('/api/deleteAlumno/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'UPDATE alumno SET isActive = false WHERE id = $1 AND isActive = true RETURNING *';
    const result = await pool.query(sql, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "No encontrado" });
    res.status(200).json({ message: "Alumno desactivado", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
});


// ==========================================
//           RUTAS PARA MATERIAS
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

// GET - Obtener una materia específica por ID
app.get('/materias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ error: 'El id debe ser numérico' });

    const resultado = await pool.query('SELECT * FROM materia WHERE id = $1', [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ error: 'Materia no encontrada' });

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

// ==========================================
//           RUTAS MONGODB (VEHÍCULOS)
// ==========================================

// Llamar a la conexión
connectMongoDB();

app.get("/api/getVehiculos", async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find();
    res.status(200).json({ message: "Vehículos consultados correctamente", data: vehiculos });
  } catch (error) {
    res.status(500).json({ message: "Error al consultar vehículos", error: error.message });
  }
});

app.post("/api/createVehiculo", async (req, res) => {
  try {
    const { marca, modelo, anio, color } = req.body;
    if (!marca || !modelo || !anio || !color) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    const nuevoVehiculo = new Vehiculo({ marca, modelo, anio, color });
    await nuevoVehiculo.save();
    res.status(201).json({ message: "Vehículo creado correctamente", data: nuevoVehiculo });
  } catch (error) {
    res.status(500).json({ message: "Error al crear vehículo", error: error.message });
  }
});

// ==========================================
//       RELACIÓN ALUMNO-MATERIA
// ==========================================

app.post('/api/assignMateriaToAlumno', async (req, res) => {
    try {
        const { alumno_id, materia_id } = req.body;

        // 1. Validar que no vengan vacíos y sean números
        if (!alumno_id || !materia_id || isNaN(alumno_id) || isNaN(materia_id)) {
            return res.status(400).json({ message: "alumno_id y materia_id son obligatorios y deben ser numéricos" });
        }

        // 2. VALIDACIÓN ESCENARIO 2: ¿El alumno existe y está activo?
        const alumnoCheck = await pool.query('SELECT * FROM alumno WHERE id = $1 AND isActive = true', [alumno_id]);
        if (alumnoCheck.rows.length === 0) {
            return res.status(404).json({ message: "El alumno no existe o no está activo" });
        }

        // 3. VALIDACIÓN ESCENARIO 3: ¿La materia existe?
        const materiaCheck = await pool.query('SELECT * FROM materia WHERE id = $1', [materia_id]);
        if (materiaCheck.rows.length === 0) {
            return res.status(404).json({ message: "La materia no existe" });
        }

        // 4. Si todo está bien, insertar la relación
        const sql = 'INSERT INTO alumno_materia (alumno_id, materia_id) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(sql, [alumno_id, materia_id]);

        res.status(201).json({
            message: "Materia asignada correctamente al alumno",
            data: result.rows[0]
        });

    } catch (error) {
        // Manejar duplicados (Escenario 4)
        if (error.code === '23505') {
            return res.status(400).json({ message: "Este alumno ya tiene asignada esa materia" });
        }
        // Si llega aquí, es un error real del servidor
        res.status(500).json({ message: "Error interno", error: error.message });
    }
});

// 2. Consultar materias relacionadas a un alumno
app.get('/api/getMateriasByAlumnoId/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // VALIDACIÓN: Que el id sea numérico
        if (isNaN(id)) {
            return res.status(400).json({ message: "El ID del alumno debe ser numérico" });
        }

        // VALIDACIÓN: Que el alumno exista y esté activo (isActive = true)
        const alumnoCheck = await pool.query(
            'SELECT * FROM alumno WHERE id = $1 AND isActive = true', 
            [id]
        );

        if (alumnoCheck.rows.length === 0) {
            return res.status(404).json({ message: "El alumno no existe o se encuentra inactivo" });
        }

        // CONSULTA: Si pasa las validaciones, traemos las materias con un JOIN
        const sql = `
            SELECT m.id, m.nombre, m.semestre 
            FROM materia m
            JOIN alumno_materia am ON m.id = am.materia_id 
            WHERE am.alumno_id = $1`;
            
        const result = await pool.query(sql, [id]);

        res.status(200).json({ 
            message: "Materias encontradas correctamente",
            data: result.rows 
        });

    } catch (error) {
        res.status(500).json({ message: "Error al consultar las materias del alumno", error: error.message });
    }
});

app.get('/api/getMateriasCountByAlumnoId/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT COUNT(*) as total_materias FROM alumno_materia WHERE alumno_id = $1', [id]);
        res.status(200).json({ total_materias: parseInt(result.rows[0].total_materias) });
    } catch (error) {
        res.status(500).json({ message: "Error al contar" });
    }
});

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});