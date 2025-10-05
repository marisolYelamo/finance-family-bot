require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const { agregarGasto, obtenerGastos, marcarPagado } = require("./sheets");
const loadCredentials = require('./load-credentials.js')

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const CHAT_ID = process.env.CHAT_ID;

// /start
bot.onText(/\/start/, (msg) => {
  console.log("start ok")
  bot.sendMessage(
    msg.chat.id,
    "👋 Hola! Soy tu bot de gastos.\n\nComandos:\n/gasto <concepto> <monto>\n/resumen\n/pagar <número>"
  );
});

// /gasto <concepto> <monto>
bot.onText(/\/gasto (.+) (\d+)/, async (msg, match) => {
  const concepto = match[1];
  const monto = parseFloat(match[2]);
  const usuario = msg.from.username || msg.from.first_name;
console.log("GATOS", concepto, monto, usuario)
  await agregarGasto(concepto, monto, usuario);
  bot.sendMessage(msg.chat.id, `✅ Gasto agregado: ${concepto} - $${monto}`);
});

// /resumen
bot.onText(/\/resumen/, async (msg) => {
  const gastos = await obtenerGastos();
console.log("resumen", gastos)
  if (gastos.length <= 1) {
    bot.sendMessage(msg.chat.id, "📂 No hay gastos cargados todavía.");
    return;
  }

  let total = 0;
  let detalle = gastos
    .slice(1) // saltamos la fila de encabezado
    .map((g, i) => {
      const monto = parseFloat(g[1]) || 0;
      total += monto;
      return `${i + 1}. ${g[0]} - $${monto} (${g[2]})`;
    })
    .join("\n");

  bot.sendMessage(msg.chat.id, `📊 Resumen de gastos:\n${detalle}\n\n💰 Total: $${total}`);
});

// /pagar <número>
bot.onText(/\/pagar (\d+)/, async (msg, match) => {
  const index = parseInt(match[1]);
  const gastos = await obtenerGastos();
  if (index <= 0 || index >= gastos.length) {
    bot.sendMessage(msg.chat.id, "❌ Número inválido.");
    return;
  }
  
  console.log("PAGAR", gastos )
  await marcarPagado(index + 1); // +1 por el header
  bot.sendMessage(msg.chat.id, `✅ Gasto #${index} marcado como pagado.`);
});

// Cron job: día 28
cron.schedule("0 10 28 * *", () => {
  bot.sendMessage(CHAT_ID, "📅 Hoy es 28, pasame los gastos fijos y boletas 🧾");
});

// Cron job: cada 3 días
cron.schedule("0 10 */3 * *", async () => {
  const gastos = await obtenerGastos();
  if (gastos.length > 1) {
    const pendientes = gastos.slice(1).filter((g) => g[2] !== "pagado");
    if (pendientes.length > 0) {
      const totalPendiente = pendientes.reduce((acc, g) => acc + (parseFloat(g[1]) || 0), 0);
      bot.sendMessage(CHAT_ID, `⏰ Recordatorio: falta pagar $${totalPendiente}. Usa /resumen para detalle.`);
    }
  }
});
