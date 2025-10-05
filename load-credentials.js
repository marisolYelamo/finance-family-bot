import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

const CREDENTIALS_PATH = path.resolve("my-project-mari-462322-6cccf42ef4cd.json");

async function loadCredentials() {
  const url = process.env.CREDENTIALS_URL;
  if (!url) throw new Error("CREDENTIALS_URL no está definida");

  console.log("🔄 Descargando credenciales desde Cloud Storage...");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al descargar credenciales: ${res.statusText}`);

  const data = await res.text();
  await fs.writeFile(CREDENTIALS_PATH, data);
  console.log("✅ Credenciales guardadas localmente en", CREDENTIALS_PATH);

  return CREDENTIALS_PATH;
}

export default loadCredentials;
