
/* //=====hacemos las instalaciones 
//npm init -y; npm install express; .gitignore y ponemos node-modules/; npm install --save-dev nodemon; install express-handlebars */

const express = require ("express");
const {engine} = require ("express-handlebars");
const path = require("path");
const app = express( );

/*===hacemos la coneccion */
app.engine("handlebars",
    engine({ 
        defaultLafyout: "main",
        layoutsDir: path.join(__dirname, "views/layout"),
        partialsDir: path.join(__dirname, "views/partial"),
        helpers:{
            eq:(a,b)=> a===b}
        })
   
)
/*===============Segundo paso Seteamos=================== */

app.set("view engine", "handlebars");
app.set("views", path.join (__dirname,"views"))
/* ======================= tercer paso llamamos a la ruta principal============
 creo una base de datos local */

app.get("/", (req, res) =>{
    const datos = {
        titulo: "Estudio Jurídico María Laura Lombardi",
        usuario: {nombre:"Lombardi", rol:"admin"},
        esAdmin: "ture",
        Consulta: 
        [
            {id:1, Consulta:"Familia", Duración: "una hora", valor: 80000},
            {id:2, Consulta:"Seguridad e Higiene", Duración: "una hora", valor: 80000},
            {id:3, Consulta:"Comercial", Duración: "una hora", valor: 80000},

        ],
        hayTurnos:"true",
    }
    /*renderizamos la vista*/
    res.render("home", datos);
})

const PORT = 3000
app.listen(3000, () =>{
/*SI HACEMOS CLICK EN LA TERMINAL DONDE DICE HTTP://localhost:3000 ME LLEva directamente al la pagina */
  console.log(`Servidor express escuchando en HTTP://localhost:${PORT}`)})