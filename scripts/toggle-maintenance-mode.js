// Utilitário para testar o modo de manutenção
const admin = require("firebase-admin");
const serviceAccount = require("../service-account.json.json");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  admin.app();
}

const db = admin.firestore();

async function toggleMaintenanceMode() {
  try {
    // Recuperar configurações atuais
    const settingsRef = db.collection("system").doc("settings");
    const doc = await settingsRef.get();
    let settings = {};

    if (doc.exists) {
      settings = doc.data() || {};
    }

    // Inverter o modo de manutenção
    const newMaintenanceMode = !settings.maintenanceMode;

    // Atualizar as configurações
    await settingsRef.set(
      {
        ...settings,
        maintenanceMode: newMaintenanceMode,
      },
      { merge: true }
    );

    console.log(
      `Modo de manutenção ${
        newMaintenanceMode ? "ATIVADO" : "DESATIVADO"
      } com sucesso!`
    );
  } catch (error) {
    console.error("Erro ao alternar modo de manutenção:", error);
  } finally {
    process.exit(0);
  }
}

toggleMaintenanceMode();
