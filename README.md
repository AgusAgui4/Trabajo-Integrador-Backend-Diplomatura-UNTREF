1. **Configuración Inicial**
<!-- 
const express = require("express");
const app = express();
const connectDB = require("./src/database");
const port = process.env.PORT ?? 3000;
const morgan = require("morgan");
const product = require("./src/product");
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const usuario = require('./src/users'); 
-->

express: Framework de Node.js para crear aplicaciones web.

app: Instancia de la aplicación Express.

connectDB: Función para conectar con la base de datos MongoDB (definida en ./src/database).

port: Puerto en el que se ejecuta la aplicación, configurable a través de una variable de entorno o por defecto a 3000.

morgan: Middleware para registrar las solicitudes HTTP en la consola.

product: Modelo Mongoose para productos (dispositivos).

jwt: Librería para generar y verificar tokens JWT.

secretKey: Clave secreta para firmar tokens JWT, definida en las variables de entorno.

usuario: Modelo Mongoose para usuarios.

2. **Conexión a la Base de Datos**
<!-- 
connectDB(); 
-->

Esta línea establece una conexión con la base de datos MongoDB utilizando la función connectDB definida en ./src/database.

3. **Middleware**
<!-- 
app.use(express.json());
app.use(morgan("dev"));
 -->

express.json(): Middleware que analiza los cuerpos de las solicitudes JSON.
morgan("dev"): Middleware que muestra información detallada sobre las solicitudes HTTP en la consola.


4. **Middleware de Autenticación JWT**
<!-- 
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
 -->
Este middleware verifica si un token JWT está presente en los encabezados de autorización. Si el token es válido, lo decodifica y añade la información decodificada al objeto req, permitiendo que la solicitud continúe. Si el token no es válido o no está presente, devuelve un error 401 (No autorizado).

5. **RUTAS**
Aquí se definen las rutas para manejar diferentes tipos de solicitudes:


**POST /login:** 
Autenticación de usuario. Verifica las credenciales y devuelve un token JWT si las credenciales son válidas.

<!-- 
app.post('/login', async (req, res) => {
  // Lógica para autenticar al usuario
});
 -->

**POST /register:**
Registro de nuevos usuarios. Verifica si el nombre de usuario ya existe, crea un nuevo usuario y devuelve un token JWT.

<!-- 
app.post('/register', async (req, res) => {
  // Lógica para registrar un nuevo usuario
}); 
-->

**GET /dispositivos:** 
Obtiene todos los dispositivos. Se puede filtrar por categoría a través de un parámetro de consulta.

<!-- 
app.get("/dispositivos", async (req, res) => {
  // Lógica para obtener dispositivos
}); 
-->

**GET /dispositivos/:id:**
Obtiene un dispositivo por su ID. Requiere autenticación JWT.

<!--
app.get("/dispositivos/:id", verifyToken, async (req, res) => {
  // Lógica para obtener un dispositivo por ID
}); 
-->

**GET /dispositivos/codigo/:codigo:**
Obtiene dispositivos por código. Si el código es inválido, devuelve un error.

<!-- 
app.get("/dispositivos/codigo/:codigo", async (req, res) => {
  // Lógica para obtener dispositivos por código
}); 
-->


**GET /dispositivos/nombre/:nombre:**
Busca dispositivos por nombre usando una expresión regular para realizar una búsqueda parcial.

<!-- 
app.get("/dispositivos/nombre/:nombre", async (req, res) => {
  // Lógica para buscar dispositivos por nombre
});
 -->


**POST /dispositivos/agregar/:**
Agrega un nuevo dispositivo. Requiere autenticación JWT.

<!-- 
app.post("/dispositivos/agregar/", verifyToken, async (req, res) => {
  // Lógica para agregar un nuevo dispositivo
}); 
-->



**PATCH /dispositivos/modificar/:codigo:** 
Modifica el precio de un dispositivo buscando por código. Requiere autenticación JWT.

<!-- 
app.patch("/dispositivos/modificar/:codigo", verifyToken, async (req, res) => {
  // Lógica para modificar el precio de un dispositivo
}); 
-->



**DELETE /dispositivos/delete/:codigo:**
Elimina un dispositivo por código. Requiere autenticación JWT.

<!--
 app.delete("/dispositivos/delete/:codigo", verifyToken, async (req, res) => {
  // Lógica para eliminar un dispositivo por código
});
 -->


6. **Manejo de Errores**

app.use((req, res) => {
  res.status(404).json({ error: "Página no encontrada" });
});

Esta ruta maneja todas las solicitudes no coincidentes, devolviendo un error 404 con el mensaje "Página no encontrada".



7. **Iniciar el Servidor**
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

Inicia el servidor en el puerto especificado y muestra un mensaje en la consola indicando que la aplicación está escuchando.




**En resumen, este código configura un servidor Express que maneja la autenticación de usuarios con JWT, proporciona CRUD para dispositivos electrónicos y maneja errores. La estructura modular permite conectar con MongoDB, autenticar usuarios y realizar operaciones CRUD en dispositivos.**
