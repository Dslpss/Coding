// Script para verificar e corrigir as configurações no Firestore
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json.json");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "barbearia-bd25e",
  });
}

const db = admin.firestore();

async function checkAndFixSettings() {
  console.log("🔧 Verificando e corrigindo configurações...\n");

  try {
    // 1. Verificar documento atual
    console.log("1. Verificando documento atual...");
    const settingsRef = db.collection("system").doc("settings");
    const settingsSnap = await settingsRef.get();

    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      console.log("   Configurações atuais:");
      console.log(JSON.stringify(data, null, 2));

      console.log(
        `\n   allowRegistration atual: ${
          data.allowRegistration
        } (tipo: ${typeof data.allowRegistration})`
      );
    } else {
      console.log("   ❌ Documento não existe!");
    }

    // 2. Definir allowRegistration como false explicitamente
    console.log("\n2. Definindo allowRegistration como false...");
    await settingsRef.set(
      {
        allowRegistration: false,
      },
      { merge: true }
    );

    console.log("   ✅ Configuração atualizada!");

    // 3. Verificar novamente
    console.log("\n3. Verificando após atualização...");
    const updatedSnap = await settingsRef.get();
    if (updatedSnap.exists) {
      const updatedData = updatedSnap.data();
      console.log(
        `   allowRegistration: ${
          updatedData.allowRegistration
        } (tipo: ${typeof updatedData.allowRegistration})`
      );
    }

    // 4. Testar a API
    console.log("\n4. Testando API após correção...");
    const fetch = require("node-fetch");
    const response = await fetch("http://localhost:3000/api/auth/settings");
    if (response.ok) {
      const settings = await response.json();
      console.log(`   API retorna: ${JSON.stringify(settings, null, 2)}`);
    } else {
      console.log(`   Erro na API: ${response.status}`);
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

checkAndFixSettings();
