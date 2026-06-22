//============Vamos a aprender a recibir archivos (imagen, pdfs)desde el frontend
//===antes instalar pnpm install multer
//copie y pegue las const  
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
// 🤓 Crear una carpeta uploads si no existe
if (!fs.existsSync("uploads")) {
    //mkdirsync significa crear directorio
    fs.mkdirSync("uploads");
}

// Servir archivos estáticos desde /uploads para poder acceder a las imágenes vía URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1.- Configuracion de almacenamiento (Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //uploads es la carpeta donde se van a guardar los archivos jpg y png
        cb(null, "uploads/");
    },
    //con Filename le vamos a cambiar el nombre original de la foto para que no haya coliciones 
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + "-" + Math.round(Math.random() * 1e9);
        //👇👇con esta funcion extraemos la extension original para poder cambiarla asi no coliciona el sistema
        const extension = path.extname(file.originalname);
        cb(null, nombreUnico + extension);
    }
});

// 2.- Filtro de archivos (MIME TYPE)pueden ser=text/plain → texto plano
//text/html → páginas HTML//text/css → hojas de estilo CSS//application/javascript → archivos JavaScript
const filter = (req, file, cb) => {
    //Le estamos diciendo que solo aceptamos jpeg y png. Si no es una imagen 
    //rechazamos el archivo. Si no hacemos esto nos puede ingresar un virus.
    // Los navegadores suelen enviar 'image/jpeg' para JPG
    const permitidos = ["image/jpeg", "image/jpg", "image/png"];
    //hacemos el condicional
    if (permitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Archivo no permitido. Solo se aceptan JPG Y PNG"), false);
    }
};

// 3.- Crear Middlaware de Multer y de esta forma lo llamamos
const upload = multer({
    //viene del punto 1
    storage: storage,
    //fileFilter es fundamental para que nos metan un virus
    fileFilter: filter,
    // 👇le estoy limitando a 5 megas para que no saturen el servidor 
    limits: { fileSize: 5 * 1024 * 1024 }
});

// 4.- Ruta POST con el Middledware
//🤓".single ("avatar") significa que esperamos un archivo que venga en el campo llamado 'avatar'
//upload.single carga un solo archivo
app.post("/subir", upload.single("avatar"), (req, res) => {
    res.json({
        //con message 
        message: "Archivos subido exitosamente",
        //podemos ver la información del achivo subido(nombre, ruta, etc
        archivo: req.file
    });
})

// 5.- Manejo de errores Global para Multer 👈(es un método)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Error de carga: ${err.message}` });
    }
    if (err) {
        return res.status(500).json({ error: `Error interno del servidor: ${err.message}` });
    }
    next();
});


const PORT = 3000
app.listen(3000, () => {
    /*SI HACEMOS CLICK EN LA TERMINAL DONDE DICE HTTP://localhost:3000 ME LLEva directamente al la pagina */
    console.log(`Servidor express escuchando en HTTP://localhost:${PORT}`)
    console.log(    '   Probar con POST /subir-avatar (form-data: llave "avatar" tipo File)',)
})