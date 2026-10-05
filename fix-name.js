const fs = require('fs');
let code = fs.readFileSync('src/components/Parva26/market/merch-overlay.jsx', 'utf8');
code = code.replace("const name = 'Parva Tee (${variant.en})'", "const name = `Parva Tee (${variant.en})`");
fs.writeFileSync('src/components/Parva26/market/merch-overlay.jsx', code, 'utf8');
console.log('Fixed variant name string');
