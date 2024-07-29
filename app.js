const express = require("express");
const app = express();
const connectDB = require("./src/database");
const port = process.env.PORT ?? 3000;
const morgan = require("morgan");
const product = require("./src/product");
const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY
const usuario = require('./src/users')



// Conectar a MongoDB usando Mongoose
connectDB();

//Middleware
app.use(express.json());
app.use(morgan("dev"));
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.decoded = decoded;
    
    next();
    
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


app.post('/login', (req, res) => {
  const { username, password } = req.body
  console.log(`Datos recibidos: usuario: ${username}, password: ${password}`)
  // Autenticacion del usuario
  const user = usuario.find(
     { username: { $eq: username } , password: { $eq: password }}  
  )
  if (!user) {
    return res.status(401).send({ error: 'Credenciales invalidas' })
  } else {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '2m' })
    return res.json({ token })
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await usuario.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Crear un nuevo usuario
    const newUser = new usuario({
      username,
      password,
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Generar un token JWT con una expiración de 2 minutos
    const token = jwt.sign({ username: newUser.username }, 'your_secret_key', { expiresIn: '2m' });

    // Devolver una respuesta exitosa con el token
    res.json({ token }); 

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Ruta principal
app.get("/", (req, res) => {
  res.json("Bienvenido a la API de electronica !");
});

//trae todos los dispositivos y le podes especificar una categoria
app.get("/dispositivos", (req, res) => {
  const { categoria } = req.query;
  const query = !categoria ? {} : { categorias: { $eq: categoria } };
  product
    .find(query)
    .then((dispositivos) => {
      res.json(dispositivos);
    })
    .catch((error) => {
      console.error("Error al obtener dispositivos: ", error);
      res.status(500).send("Error al obtener las dispositivos: ");
    });
});


//obtiene producto por id
app.get("/dispositivos/:id",verifyToken, (req, res) => {
  const { id } = req.params;
  product
    .findById(id)
    .then((dispositivos) => {
      if (dispositivos) {
        res.json(dispositivos);
      } else {
        res.status(404).json({ message: "producto no encontrado" });
      }
    })
    .catch((error) => {
      console.error("Error al obtener el producto: ", error);
      res.status(500).send("Error al obtener el producto");
    });
});


//obtiene producto por codigo
app.get("/dispositivos/codigo/:codigo", (req, res) => {
  const { codigo } = req.params;

  if (Number(codigo)) {
    const parse = parseInt(codigo);
    const query = !codigo ? {} : { codigo: { $eq: parse } };

    product
      .find(query)
      .then((dispositivos) => {
        console.log(dispositivos);
        console.log(query);
        if (dispositivos.length) {
          res.json(dispositivos);
        } else {
          res.status(404).send("Error, objeto no identificado");
        }
      })
      .catch((error) => {
        console.error("Error al obtener dispositivos: ", error);
        res.status(500).send("Error al obtener los dispositivos: ");
      });
  } else {
    res.status(400).send("Error, tipo de parametro invalido");
  }
});



//busca por nombre
app.get("/dispositivos/nombre/:nombre", (req, res) => {
  const { nombre } = req.params;
  const query = { nombre: { $regex: "^" + nombre , $options: "i" } };
  product
    .find(query)
    .then((respuesta) => {
      res.status(200).json(respuesta);
    })
    .catch((error) => {
      res.status(500).send("Error al obtener los dispositivos: ");
    });
});



//agregar producto
app.post("/dispositivos/agregar/",verifyToken, (req, res) => {

  const dispositivos = new product (req.body)
  dispositivos
    .save()
    .then((dispositivoguardado) => {
      res.status(201).json(dispositivoguardado)
    })
    .catch((error) => {
      console.error('Error al agregar la pelicula: ', error)
      res.status(500).send('Error al agregar la pelicula')
    })
})


//modifica precio buscando por codigo
app.patch("/dispositivos/modificar/:codigo",verifyToken, (req, res) => {
  const  {codigo}  = req.params;
  const  modificacion  = req.body.precio;

  if (Number(codigo)) {
    const parse = parseInt(codigo);
    const query = {codigo: { $eq: parse } };  
  product
    .findOneAndUpdate(query,{$set:{precio:modificacion}}, { new: true })

    .then((dispositivoActualizado) => {
      if (!dispositivoActualizado) {
        return res.status(404).send('Dispositivo no encontrado');
      }
      res.status(200).json(dispositivoActualizado); 
    })
    .catch((error) => {
      res.status(500).send("Error al obtener los dispositivos: ");
    })}
  else {
    res.status(400).send("Error, tipo de parametro invalido");
  }
});


//elimina por codigo
app.delete("/dispositivos/delete/:codigo",verifyToken, (req, res) => {
  const { codigo } = req.params;

  if (Number(codigo)) {
    const parse = parseInt(codigo);
    const query = { codigo: { $eq: parse } };

    product.deleteOne ( query ).then((dispositivos) => {
        if (dispositivos.deletedCount > 0 ) {
          res.status(200).send ("Producto eliminado")
        } else {
          res.status(404).send("Error, objeto no identificado");
        }
      })
      .catch(() => {
        res.status(500).send("Error al obtener los dispositivos: ");
      });
  } else {
    res.status(400).send("Error, tipo de parametro invalido");
  }
});



app.use ( (req, res) => {
  res.status(404).send("Página no encontrada");
});


app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});






