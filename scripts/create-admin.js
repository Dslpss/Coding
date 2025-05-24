// Script para criar um documento admin no Firestore
// Execute com: node scripts/create-admin.js

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyATDE21wBLKPqLcAXKzIQti9vvYAT3gZPM",
  authDomain: "barbearia-bd25e.firebaseapp.com",
  projectId: "barbearia-bd25e",
  storageBucket: "barbearia-bd25e.appspot.com",
  messagingSenderId: "1079641275104",
  appId: "1:1079641275104:web:e166f6912943c96bee6e85",
  measurementId: "G-0MM4VLLQJR",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin() {
  const adminEmail = "dennisemannuel93@gmail.com"; // Email do usuário atual
  const adminId = adminEmail.replace(/\./g, "_").replace("@", "_");
  console.log("Tentando criar admin com ID:", adminId);
  try {
    await setDoc(doc(db, "admins", adminId), {
      email: adminEmail,
      role: "admin",
      createdAt: new Date(),
    });

    console.log(`Admin criado com sucesso: ${adminEmail} (ID: ${adminId})`);
  } catch (error) {
    console.error("Erro ao criar admin:", error);
  }
}

console.log("Iniciando script...");
createAdmin()
  .then(() => {
    console.log("Script finalizado");
  })
  .catch((error) => {
    console.error("Erro no script:", error);
  });
