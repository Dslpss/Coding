// Script para verificar a configuração do Firebase Admin SDK
// Execute com: node scripts/check-admin-sdk.js

require("dotenv").config();
const admin = require("firebase-admin");

console.log("Verificando configuração do Firebase Admin SDK...");

// Verificar variáveis de ambiente
console.log("Variáveis de ambiente:");
console.log(
  "- FIREBASE_PROJECT_ID:",
  process.env.FIREBASE_PROJECT_ID ? "✓" : "✗"
);
console.log(
  "- FIREBASE_CLIENT_EMAIL:",
  process.env.FIREBASE_CLIENT_EMAIL ? "✓" : "✗"
);
console.log(
  "- FIREBASE_PRIVATE_KEY:",
  process.env.FIREBASE_PRIVATE_KEY ? "✓" : "✗"
);

try {
  // Inicializar o SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✓ Firebase Admin SDK inicializado com sucesso");
  }

  // Testar conexão com Firestore
  const testAsync = async () => {
    try {
      const db = admin.firestore();
      const adminsColl = await db.collection("admins").limit(1).get();
      console.log(
        `✓ Firestore conectado. Documentos na coleção 'admins': ${adminsColl.size}`
      );

      // Mostrar documentos de admin
      if (adminsColl.size > 0) {
        console.log("\nAdmins encontrados:");
        adminsColl.forEach((doc) => {
          console.log(`- ${doc.id}: ${JSON.stringify(doc.data())}`);
        });
      } else {
        console.log(
          "\nNenhum admin encontrado. Execute o script create-admin.js para criar um admin."
        );
      }
    } catch (error) {
      console.error("✗ Erro ao conectar com o Firestore:", error);
    }
  };

  testAsync();
} catch (error) {
  console.error("✗ Erro ao inicializar Firebase Admin SDK:", error);
}
