const mongoose = require('mongoose')

// Definir el esquema y el modelo de Mongoose
const dispoSchema = new mongoose.Schema({
  codigo: Number,
  nombre: String,
  precio: Number,
  categorias: [String],
  
})
const dispositivos = mongoose.model('dispositivos', dispoSchema)

module.exports = dispositivos
