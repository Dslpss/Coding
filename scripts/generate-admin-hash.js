// Script para gerar hash de senha admin
const bcrypt = require("bcryptjs");

const senha = process.argv[2];
if (!senha) {
  console.log("Uso: node scripts/generate-admin-hash.js <senha>");
  process.exit(1);
}

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) throw err;
  console.log("Hash gerado para Firestore:");
  console.log(hash);
});
