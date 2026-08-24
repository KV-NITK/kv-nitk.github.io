import "dotenv/config";

import https from "https";
import fs from "fs";
import app from "./app.js";

const httpsOptions = {
  key: fs.readFileSync("./certs/dev-key.pem"),
  cert: fs.readFileSync("./certs/dev-cert.pem"),
};

https.createServer(httpsOptions, app).listen(5000, () => {
  console.log(
    "Server running at https://kannadavedike.dev.local:5000"
  );
});