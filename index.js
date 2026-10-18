
const prefix = "!";

function responder(mensaje) {
  const texto = mensaje.toLowerCase().trim();

  if (texto === "!ping") {
    return "Pong! 🦇 Oshino Ougi está aquí.";
  }

  if (texto === "!menu") {
    return `
╭━━━〔 🦇 OSHINO OUGI 〕
┃
┃ !ping — Ver si funciona
┃ !menu — Mostrar comandos
┃ !hola — Saludar al bot
┃
╰━━━━━━━━━━━━━━
    `;
  }

  if (texto === "!hola") {
    return "Hola 🦇 Soy Oshino Ougi.";
  }

  return null;
}

console.log("Oshino Ougi preparado.");
console.log("Prefijo:", prefix);
