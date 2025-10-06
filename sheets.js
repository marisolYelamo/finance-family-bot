const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
import fetch from "node-fetch";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsClient() {
  const credentialsUrl = process.env.CREDENTIALS_URL;
  if (!credentialsUrl) throw new Error("Falta la variable CREDENTIALS_URL en Railway");

  // Descargar el JSON de credenciales desde GCS
  const res = await fetch(credentialsUrl);
  if (!res.ok) {
    throw new Error(`No se pudo descargar las credenciales: ${res.statusText}`);
  }

  const credentials = await res.json();

  // Crear el auth con las credenciales descargadas
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}
const SPREADSHEET_ID = process.env.SHEET_ID;

async function agregarGasto(concepto, monto) {
  const values = [[concepto, monto, "pendiente", new Date().toISOString()]];
  const sheets = await getSheetsClient()
  console.log("values", values)
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "'Hoja 2'!A1:E1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

async function obtenerGastos() {
  const sheets = await getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'Hoja 2'!A:D",
  });
  return res.data.values || [];
}

async function marcarPagado(fila) {
  const sheets = await getSheetsClient()
  const range = `'Hoja 2'!C${fila}:C${fila}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["pagado"]] },
  });
}

module.exports = { agregarGasto, obtenerGastos, marcarPagado };
