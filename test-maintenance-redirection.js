const admin = require("firebase-admin");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./service-account.json.json")),
  });
}

const db = admin.firestore();

async function toggleMaintenanceMode(enableMaintenance = true) {
  try {
    console.log(
      `${enableMaintenance ? "🔒" : "🔓"} ${
        enableMaintenance ? "Ativando" : "Desativando"
      } modo de manutenção...`
    );

    const configRef = db.collection("system").doc("settings");
    await configRef.set(
      { maintenanceMode: enableMaintenance },
      { merge: true }
    );

    console.log(
      `✅ Modo de manutenção ${
        enableMaintenance ? "ATIVADO" : "DESATIVADO"
      } com sucesso!`
    );
    console.log(
      `ℹ️ Status atual: ${
        enableMaintenance ? "Sistema em manutenção" : "Sistema operacional"
      }`
    );

    if (enableMaintenance) {
      console.log(`
🔔 Instruções:
1. Acesse http://localhost:3000/dashboard em seu navegador
2. O sistema deve redirecionar para a página de manutenção
3. Rode este script novamente com o argumento 'desativar' para voltar ao normal
4. Execute: node test-maintenance-redirection.js desativar
      `);
    } else {
      console.log(`
🔔 Instruções:
1. Acesse http://localhost:3000/dashboard em seu navegador
2. O sistema deve funcionar normalmente
3. Para testar novamente o modo de manutenção, execute: node test-maintenance-redirection.js
      `);
    }
  } catch (error) {
    console.error("❌ Erro ao alternar modo de manutenção:", error);
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const shouldDisable = args[0] === "desativar";

toggleMaintenanceMode(!shouldDisable);
