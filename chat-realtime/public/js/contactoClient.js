// ==========================================
// Demo 02: Cliente de Chat en Tiempo Real
// Archivo: public/js/client.js
//Estoy probando si me va a salir en el nav del navegador que hice en partial header.handlebars, el contactoClient, para conectar con el index.html de chat-realtime
// ==========================================

let socket;
let username = '';

// Elementos del DOM explicado en el cuaderno
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const reconnectCard = document.getElementById('reconnectCard');
const reconnectAttempts = document.getElementById('reconnectAttempts');
const userCard = document.getElementById('userCard');
const myUsername = document.getElementById('myUsername');
const userAvatar = document.getElementById('userAvatar');
const messagesArea = document.getElementById('messagesArea');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const typingUser = document.getElementById('typingUser');


// --- 1. SOLICITUD DE AUTENTICACIÓN CON SWEETALERT2 ---
// Pedimos el nombre al usuario y no lo dejamos chatear hasta que ingrese algo válido.
window.addEventListener('DOMContentLoaded', () => {
  Swal.fire({
    title: '⚡ Bienvenido a Socket.IO Chat',
    input: 'text',
    inputPlaceholder: 'Ingresa tu nombre o apodo...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: true,
    confirmButtonText: 'Entrar al Chat 🚀',
    inputValidator: (value) => {
      if (!value || value.trim().length === 0) {
        return '¡Debes ingresar un nombre para participar!';
      }
      if (value.trim().length > 20) {
        return 'El apodo debe tener máximo 20 caracteres.';
      }
    }
  }).then((result) => {
    // Almacenamos el nombre de usuario y llamamos a la inicialización de la app
    username = result.value.trim();
    inicializarChat();
  });
});

// --- 2. INICIALIZACIÓN DE CONEXIÓN CON SOCKET.IO ---
function inicializarChat() {
  // Mostramos el perfil del usuario en el sidebar
  myUsername.textContent = username;
  userAvatar.textContent = username.charAt(0).toUpperCase();
  userCard.style.visibility = 'visible';

  // Establecemos conexión con el servidor (io() se conecta automáticamente al mismo host)
  socket = io();

  // --- 3. GESTIÓN DE EVENTOS DE CONEXIÓN ---

  // Evento: Conexión exitosa
  socket.on('connect', () => {
    statusDot.className = 'dot connected';
    statusText.textContent = 'Conectado';
    reconnectCard.style.display = 'none';
    console.log(`🔌 Conectado con ID: ${socket.id}`);
    
  });

  // Evento: Desconexión involuntaria
  socket.on('disconnect', (reason) => {
    statusDot.className = 'dot';
    statusText.textContent = 'Desconectado';
    console.warn(`🔌 Conexión perdida. Motivo: ${reason}`);
    
  });

  // Evento: Error de conexión
  socket.on('connect_error', (error) => {
    statusDot.className = 'dot';
    statusText.textContent = 'Error de conexión';
    console.error('⚠️ Error de conexión:', error.message);
  });

  // Evento: Intentando reconectar
  socket.io.on('reconnect_attempt', (attempt) => {
    statusDot.className = 'dot connecting';
    statusText.textContent = 'Reconectando...';
    reconnectCard.style.display = 'block';
    reconnectAttempts.textContent = `Intentos: ${attempt}`;
    console.log(`🔌 Intentando reconectar... Intento número: ${attempt}`);
  });

  // Evento: Reconexión exitosa
  socket.io.on('reconnect', (attemptNumber) => {
    statusDot.className = 'dot connected';
    statusText.textContent = 'Conectado';
    reconnectCard.style.display = 'none';
    console.log(`🔌 Reconectado exitosamente tras ${attemptNumber} intentos.`);
  });

  // --- 4. ENVÍO DE MENSAJES ---
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const texto = messageInput.value.trim();
    if (!texto) return;

    // Estructuramos el payload del mensaje
    const mensaje = { usuario: username, texto: texto };

    // Emitimos el mensaje mediante un evento personalizado llamado 'message'
    socket.emit('message', mensaje);

    // Limpiamos el input y hacemos focus de nuevo
    messageInput.value = '';
    messageInput.focus();
    
    // Notificamos que dejamos de escribir
    notificarEscribiendo(false);
  });

  // --- 5. RECEPCIÓN Y VALIDACIÓN DE MENSAJES ---
  socket.on('message', (payload) => {
    // Validación básica de estructura en el cliente
    if (payload && typeof payload.usuario === 'string' && typeof payload.texto === 'string') {
      agregarMensajePantalla(payload);
    } else {
      console.warn('⚠️ Se recibió un mensaje inválido en el cliente:', payload);
    }
  });

  // --- 6. INDICADOR DE "ESCRIBIENDO..." ---
  let typingTimeout;

  messageInput.addEventListener('input', () => {
    notificarEscribiendo(true);

    // Si dejamos de escribir por 1.5 segundos, avisamos al servidor que paramos
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      notificarEscribiendo(false);
    }, 1500);
  });

  function notificarEscribiendo(estaEscribiendo) {
    if (socket.connected) {
      socket.emit('typing', { usuario: username, escribiendo: estaEscribiendo });
    }
  }

  // Escuchamos a otros usuarios escribiendo
  socket.on('typing', (data) => {
    if (data.escribiendo) {
      typingUser.textContent = data.usuario;
      typingIndicator.style.visibility = 'visible';
    } else {
      typingIndicator.style.visibility = 'hidden';
    }
  });
}

// --- 7. UTILERÍAS DE INTERFAZ ---
function agregarMensajePantalla(payload) {
  const isMe = payload.usuario === username;

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${isMe ? 'outgoing' : 'incoming'}`;

  // Creamos la estructura interna del globo
  msgDiv.innerHTML = `
    <div class="message-meta">
      <span class="message-sender">${isMe ? 'Tú' : payload.usuario}</span>
      <span class="message-time">${payload.timestamp || new Date().toLocaleTimeString()}</span>
    </div>
    <div class="message-text">${escaparHTML(payload.texto)}</div>
  `;

  messagesArea.appendChild(msgDiv);
  
  // Hacemos scroll automático al final
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Escapa caracteres especiales para evitar ataques XSS simples al renderizar texto
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.innerText = texto;
  return div.innerHTML;
}