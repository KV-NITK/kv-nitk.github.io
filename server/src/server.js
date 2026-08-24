import "dotenv/config";

import https from "https";
import fs from "fs";
import { execSync } from "child_process";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const certKeyPath = "./certs/dev-key.pem";
const certFilePath = "./certs/dev-cert.pem";

// Auto-generate self-signed dev certs if missing
if (!fs.existsSync(certKeyPath) || !fs.existsSync(certFilePath)) {
  console.log("Generating self-signed dev SSL certificate for kannadavedike.dev.local...");
  fs.mkdirSync("./certs", { recursive: true });
  execSync(
    'openssl req -x509 -newkey rsa:2048 -keyout ./certs/dev-key.pem -out ./certs/dev-cert.pem -days 365 -nodes -subj "/CN=kannadavedike.dev.local" -addext "subjectAltName=DNS:kannadavedike.dev.local,DNS:localhost,IP:127.0.0.1"',
    { stdio: "inherit" }
  );
}

const httpsOptions = {
  key: fs.readFileSync(certKeyPath),
  cert: fs.readFileSync(certFilePath),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Server running at https://kannadavedike.dev.local:${PORT}`);
});