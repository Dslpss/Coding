const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function checkSettings() {
  try {
    console.log("Verificando documento de configurações...");
    const doc = await db.collection("system").doc("settings").get();
    console.log("Documento existe:", doc.exists);

    if (doc.exists) {
      const data = doc.data();
      console.log("Dados do documento:");
      console.log(JSON.stringify(data, null, 2));
      console.log("\nallowRegistration:", data.allowRegistration);
    } else {
      console.log("Documento não encontrado no Firestore");
    }
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
  }

  process.exit(0);
}

checkSettings();
