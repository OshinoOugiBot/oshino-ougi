
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";

const PREFIX = "#";
const chats = {};

function menu() {
  return `╭━━━〔 🦇 OSHINO OUGI 〕
┃ #ping — Comprobar el bot
┃ #hola — Saludar
┃ #menu — Ver comandos
┃
┃ PERSONALIDADES
┃ #normal
┃ #chaos
┃ #random
┃ #personality
┃
┃ MISTERIOS
┃ #riddle
┃ #case
╰━━━━━━━━`;
}

function responder(texto, chatId) {
  const partes = texto.trim().split(/\s+/);
  const comando = partes[0].toLowerCase();
  const argumento = partes.slice(1).join(" ");

  if (!chats[chatId]) {
    chats[chatId] = { personalidad: "normal" };
  }

  const chat = chats[chatId];

  switch (comando) {
    case "#ping":
      return "Pong! 🦇 Oshino Ougi está aquí.";

    case "#hola":
      return chat.personalidad === "chaos"
        ? "¿Me llamaste? Qué curioso. 🎭"
        : "Hola. Soy Oshino Ougi. ¿Qué misterio te trae por aquí?";

    case "#menu":
    case "#help":
      return menu();

    case "#normal":
      chat.personalidad = "normal";
      return "🦇 Personalidad normal activada.";

    case "#chaos":
      chat.personalidad = "chaos";
      return "🎭 Modo Chaos activado.";

    case "#random":
      chat.personalidad =
        Math.random() < 0.5 ? "normal" : "chaos";
      return `Personalidad elegida: ${chat.personalidad}`;

    case "#personality":
      return `Personalidad actual: ${chat.personalidad}`;

    case "#riddle":
      return "🔎 Cuanto más quitás de mí, más grande me vuelvo. ¿Qué soy?";

    case "#answer":
      return argumento.toLowerCase() === "un agujero"
        ? "🧩 Correcto. Buen ojo."
        : "Probá con #answer seguido de tu respuesta.";

    case "#case":
      return "📁 Caso 001: una habitación cerrada, una ventana abierta y agua en el suelo. ¿Qué ocurrió?";

    case "#solve":
      return `🕵️ Tu teoría: ${argumento || "Todavía no hay pistas."}`;

    default:
      return null;
  }
}

async function iniciarBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["Oshino Ougi", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("🦇 Oshino Ougi está conectado.");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        iniciarBot();
      } else {
        console.log("Sesión cerrada. Hay que vincular de nuevo.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const chatId = msg.key.remoteJid;
      const contenido = msg.message;
      const texto =
        contenido.conversation ||
        contenido.extendedTextMessage?.text ||
        contenido.imageMessage?.caption ||
        "";

      if (!texto.startsWith(PREFIX)) continue;

      const respuesta = responder(texto, chatId);
      if (!respuesta) continue;

      await sock.sendMessage(chatId, { text: respuesta }, {
        quoted: msg
      });
    }
  });
}

iniciarBot().catch(console.error);
  
