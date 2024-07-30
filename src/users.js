const mongoose = require('mongoose')

// Definir el esquema y el modelo de Mongoose
const userSchema = new mongoose.Schema({
  id: Number,
  username: String,
  password: String,
  
})
const user = mongoose.model('users', userSchema)

module.exports = user