// Teste de configuração do Firebase Admin SDK
const { initAdmin } = require("./src/lib/firebase-admin.ts");

async function testFirebaseConfig() {
  try {
    console.log("🧪 Testando configuração do Firebase Admin SDK...\n");

    // Tentar inicializar o Firebase Admin
    const app = initAdmin();

    if (app) {
      console.log("✅ Firebase Admin inicializado com sucesso!");
      console.log("📋 App Name:", app.name);
      console.log(
        "📋 Project ID:",
        app.options?.credential?.projectId || "N/A"
      );

      // Tentar acessar algumas funções básicas
      const auth = require("firebase-admin/auth");
      const adminAuth = auth.getAuth(app);

      console.log("🔑 Auth service accessible:", !!adminAuth);

      return true;
    } else {
      console.log("❌ Falha ao inicializar Firebase Admin");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
    return false;
  }
}

// Executar teste
testFirebaseConfig()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Teste concluído com sucesso!");
      process.exit(0);
    } else {
      console.log("\n💥 Teste falhou!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Erro inesperado:", error);
    process.exit(1);
  });
