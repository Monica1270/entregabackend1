
/* //=====hacemos las instalaciones 
//pnpm init -y; pnpm install express; .gitignore y ponemos node-modules/; pnpm install --save-dev nodemon; pnpm install express-handlebars */

const express = require ("express");
const {engine} = require ("express-handlebars");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

/*===hacemos la coneccion */
app.engine("handlebars",
    engine({ 
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layout"),
        partialsDir: path.join(__dirname, "views/partial"),
        helpers:{
            eq:(a,b)=> a===b}
        })
   
)
/*===============Segundo paso Seteamos=================== */

app.set("view engine", "handlebars");
app.set("views", path.join (__dirname,"views"))

// Servir archivos estáticos (imágenes, CSS, JS) desde views/public
app.use('/public', express.static(path.join(__dirname, 'views', 'public')));

// Servir la app de chat en tiempo real desde chat-realtime/public
app.use('/chat', express.static(path.join(__dirname, 'chat-realtime', 'public')));

/* ======================= tercer paso llamamos a la ruta principal============
 creo una base de datos local */

app.get("/", (req, res) =>{
    const datos = {
        titulo: "Estudio Jurídico María Laura Lombardi",
        usuario: {nombre:"Lombardi", rol:"admin"},
        esAdmin: "ture",
        consulta: 
        [
            {id:1, consulta:"Familia", Duración: "una hora", valor: 80000},
            {id:2, consulta:"Seguridad e Higiene", Duración: "una hora", valor: 80000},
            {id:3, consulta:"Comercial", Duración: "una hora", valor: 80000},

        ],
        hayTurnos:"true",
    }
    /*renderizamos la vista*/
    res.render("home", datos);
})

app.get('/chat', (req, res) => {
    res.redirect('/chat/indexPublic.html');
});

app.get('/contacto', (req, res) => {
    res.redirect('/chat/indexPublic.html');
});

app.get('/ambiental', (req, res) => {
    res.render('page', {
        titulo: 'Ambiental',
        heading: 'Ambiental',
        message: 'Contenido ambiental en construcción.',
    });
});

app.get('/comercial', (req, res) => {
    res.render('page', {
        titulo: 'Comercial',
        heading: 'Comercial',
        message: 'Contenido comercial en construcción.',
    });
});

app.get('/familia', (req, res) => {
    res.render('page', {
        titulo: 'Familia',
        heading: 'Familia',
        message: 'Contenido de familia en construcción.',
    });
});

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`Usuario conectado. Socket ID: ${socket.id}`);

    
    socket.on('message', (payload) => {
        if (payload && typeof payload.usuario === 'string' && typeof payload.texto === 'string') {
            io.emit('message', {
                usuario: payload.usuario,
                texto: payload.texto,
                socketId: socket.id,
                timestamp: new Date().toLocaleTimeString()
            });
        } else {
            console.warn('Payload inválido recibido:', payload);
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', (reason) => {
        console.log(`Usuario desconectado. Socket ID: ${socket.id}. Motivo: ${reason}`);
    });
});

const PORT = 3000;
server.listen(PORT, () =>{
    console.log(`Servidor express escuchando en HTTP://localhost:${PORT}`);
});