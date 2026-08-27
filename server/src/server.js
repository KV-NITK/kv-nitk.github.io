import "dotenv/config";

import https from "https";
import fs from "fs";
import { execSync } from "child_process";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  app.listen(PORT, () => {
    console.log(`Server running in production HTTP mode on port ${PORT}`);
  });
} else {
  const certKeyPath = "./certs/dev-key.pem";
  const certFilePath = "./certs/dev-cert.pem";
  let useHttps = true;

  // Auto-generate self-signed dev certs if missing
  if (!fs.existsSync(certKeyPath) || !fs.existsSync(certFilePath)) {
    console.log("Generating self-signed dev SSL certificate for kannadavedike.dev.local...");
    fs.mkdirSync("./certs", { recursive: true });
    try {
      execSync(
        'openssl req -x509 -newkey rsa:2048 -keyout ./certs/dev-key.pem -out ./certs/dev-cert.pem -days 365 -nodes -subj "/CN=kannadavedike.dev.local" -addext "subjectAltName=DNS:kannadavedike.dev.local,DNS:localhost,IP:127.0.0.1"',
        { stdio: "ignore" }
      );
    } catch (e) {
      console.warn("Failed to generate SSL certs (openssl might not be installed). Falling back to HTTP mode.");
      useHttps = false;
    }
  }

  if (useHttps && fs.existsSync(certKeyPath) && fs.existsSync(certFilePath)) {
    const httpsOptions = {
      key: fs.readFileSync(certKeyPath),
      cert: fs.readFileSync(certFilePath),
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`Server running at https://kannadavedike.dev.local:${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`Server running in HTTP fallback mode on port ${PORT}`);
    });
  }
}