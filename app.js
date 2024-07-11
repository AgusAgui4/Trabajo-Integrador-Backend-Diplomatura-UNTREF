const express = require("express");
const app = express();
const connectDB = require("./src/database");
const port = process.env.PORT ?? 3000;
const morgan = require("morgan");
const product = require("./src/product");

// Conectar a MongoDB usando Mongoose
connectDB();

//Middleware
app.use(express.json());
app.use(morgan("dev"));

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
app.get("/dispositivos/:id", (req, res) => {
  const { id } = req.params;
  product
    .findById(id)
    .then((dispositivos) => {
      if (dispositivos) {
        res.json(dispositivos);
      } else {
        res.status(404).json({ message: "Peli no encontrada" });
      }
    })
    .catch((error) => {
      console.error("Error al obtener la pelicula: ", error);
      res.status(500).send("Error al obtener la pelicula");
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




app.get("/dispositivos/nombre/:nombre", (req, res) => {
  const { nombre } = req.params;
  const query = { nombre: { $regex: "^" + nombre , "$options": "i" } };
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
app.post("/dispositivos/agregar/", (req, res) => {

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



app.patch("/dispositivos/modificar/:codigo", (req, res) => {
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

app.delete("/dispositivos/delete/:codigo", (req, res) => {
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





/* app.get("/dispositivos/codigo/:codigo", (req, res) => {
  try {
    const { codigo } = req.params;

    if (!Number(codigo)) {
      throw new Error("parametro invalido")
    }

    const parse = parseInt(codigo);
    console.log(codigo);
    const query = !codigo ? {} : { codigo: { $eq: parse } };

    product
      .find(query)
      .then((dispositivos) => {
        
        if (!dispositivos.length) {
          throw new Error("objeto no encontrado")
        }
        
        res.json(dispositivos);
       
      })
    
  } catch (error) {
    res.status(400).send(error.message);
  }
  
});
 */
//Inicializamos el servidor