const fs = require('fs');

let shopData = fs.readFileSync('src/components/Parva26/merch/merch-shop.jsx', 'utf8');
shopData = shopData.replace(/const \[back, setBack\] = useState\(false\)/, 'const [back, setBack] = useState(true)');
fs.writeFileSync('src/components/Parva26/merch/merch-shop.jsx', shopData);
