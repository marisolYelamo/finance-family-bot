const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "my-project-mari-462322-6cccf42ef4cd.json"), // tu JSON de service account
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SHEET_ID;

async function agregarGasto(concepto, monto) {
  const values = [[concepto, monto, "pendiente", new Date().toISOString()]];
  console.log("values", values)
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "'Hoja 2'!A1:E1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

async function obtenerGastos() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'Hoja 2'!A:D",
  });
  return res.data.values || [];
}

async function marcarPagado(fila) {
  const range = `'Hoja 2'!C${fila}:C${fila}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["pagado"]] },
  });
}

module.exports = { agregarGasto, obtenerGastos, marcarPagado };
