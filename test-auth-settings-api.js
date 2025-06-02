const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOh9sUiYceCkBUlJY8vOV6VJgZdZqUAXI",
  authDomain: "self-coding-app.firebaseapp.com",
  projectId: "self-coding-app",
  storageBucket: "self-coding-app.firebasestorage.app",
  messagingSenderId: "1008036297088",
  appId: "1:1008036297088:web:e83c4de5d70e01cb6cf5c1",
};

async function testAuthSettingsAPI() {
  try {
    console.log("Testando API /api/auth/settings...");

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Buscar configurações diretamente no Firestore
    console.log("Buscando configurações no Firestore...");
    const configRef = doc(db, "system", "settings");
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const settings = configSnap.data();
      console.log("Configurações encontradas:", settings);
      console.log("allowRegistration:", settings.allowRegistration);

      // Simular resposta da API
      const apiResponse = {
        allowRegistration: settings.allowRegistration ?? true,
      };
      console.log("Resposta simulada da API:", apiResponse);
    } else {
      console.log("Documento de configurações não encontrado!");
    }
  } catch (error) {
    console.error("Erro no teste:", error);
  }
}

testAuthSettingsAPI();
