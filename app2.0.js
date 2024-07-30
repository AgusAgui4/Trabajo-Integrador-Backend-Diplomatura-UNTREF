const express = require("express");
const app = express();
const connectDB = require("./src/database");
const morgan = require("morgan");
const jwt = require('jsonwebtoken');
const product = require("./src/product");
const usuario = require('./src/users');

const port = process.env.PORT ?? 3000;
const secretKey = process.env.SECRET_KEY;

// Conectar a MongoDB usando Mongoose
connectDB();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.decoded = decoded;
    next();
  });
};

// Rutas de autenticación
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await usuario.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: '2m' });
    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await usuario.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = new usuario({ username, password });
    await newUser.save();

    const token = jwt.sign({ username: newUser.username }, secretKey, { expiresIn: '2m' });
    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.json("Bienvenido a la API de electronica !");
});

// trae todos los dispositivos o por categoria
app.get("/dispositivos", async (req, res) => {
  const { categoria } = req.query;
  const query = categoria ? { categorias: categoria } : {};

  try {
    const dispositivos = await product.find(query);
    res.json(dispositivos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los dispositivos" });
  }
});

// trae un dispositivo por id
app.get("/dispositivos/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const dispositivo = await product.findById(id);
    if (!dispositivo) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(dispositivo);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// trae un dispositivo por código
app.get("/dispositivos/codigo/:codigo", async (req, res) => {
  const { codigo } = req.params;

  if (isNaN(codigo)) {
    return res.status(400).json({ error: "Código inválido" });
  }

  try {
    const dispositivos = await product.find({ codigo: parseInt(codigo) });
    if (dispositivos.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(dispositivos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los dispositivos" });
  }
});

// trae un dispositivo por nombre
app.get("/dispositivos/nombre/:nombre", async (req, res) => {
  const { nombre } = req.params;

  try {
    const dispositivos = await product.find({ nombre: new RegExp(`^${nombre}`, 'i') });
    res.json(dispositivos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los dispositivos" });
  }
});

// agregar un dispositivo
app.post("/dispositivos/agregar", verifyToken, async (req, res) => {
  try {
    const nuevoDispositivo = new product(req.body);
    const dispositivoGuardado = await nuevoDispositivo.save();
    res.status(201).json(dispositivoGuardado);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el dispositivo" });
  }
});

// modifica precio buscando por código
app.patch("/dispositivos/modificar/:codigo", verifyToken, async (req, res) => {
  const { codigo } = req.params;
  const { precio } = req.body;

  if (isNaN(codigo)) {
    return res.status(400).json({ error: "Código inválido" });
  }

  try {
    const dispositivoActualizado = await product.findOneAndUpdate(
      { codigo: parseInt(codigo) },
      { $set: { precio } },
      { new: true }
    );

    if (!dispositivoActualizado) {
      return res.status(404).json({ message: "Dispositivo no encontrado" });
    }
    res.json(dispositivoActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al modificar el dispositivo" });
  }
});

// elimina un dispositivo por código
app.delete("/dispositivos/delete/:codigo", verifyToken, async (req, res) => {
  const { codigo } = req.params;

  if (isNaN(codigo)) {
    return res.status(400).json({ error: "Código inválido" });
  }

  try {
    const resultado = await product.deleteOne({ codigo: parseInt(codigo) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Página no encontrada" });
});


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
