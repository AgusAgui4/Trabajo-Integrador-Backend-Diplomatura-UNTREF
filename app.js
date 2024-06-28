const express = require('express')
const app = express()
const connectDB = require('./src/database')
const port = process.env.PORT ?? 3000
const morgan = require('morgan')
const product = require('./src/product')

// Conectar a MongoDB usando Mongoose
connectDB()

//Middleware
app.use(express.json())
app.use(morgan('dev'))

//Ruta principal
app.get('/', (req, res) => {
  res.json('Bienvenido a la API de electronica !')
})


//trae todos los dispositivos y le podes especificar una categoria
app.get('/dispositivos', (req, res) => {
  const {categoria} = req.query
  const query = !categoria ? {} : {categorias: {$eq: categoria }}
  product.find(query)
    .then((dispositivos) => {
      res.json(dispositivos)
    })
    .catch((error) => {
      console.error('Error al obtener dispositivos: ', error)
      res.status(500).send('Error al obtener las dispositivos: ')
    })
})












//Inicializamos el servidor
app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
  })
  