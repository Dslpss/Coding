// Script para criar um usuário no Firebase Authentication
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Carregar credenciais do Firebase Admin
try {
  var serviceAccount = require("../service-account.json.json");
} catch (error) {
  console.error("❌ Arquivo service-account.json.json não encontrado!");
  process.exit(1);
}

// Inicializar Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();

async function createAuthUser(email, password) {
  console.log("🔐 Criando usuário no Firebase Authentication...");

  try {
    // Verificar se usuário já existe
    try {
      const existingUser = await auth.getUserByEmail(email);
      console.log("⚠️ Usuário já existe no Firebase Auth:", existingUser.uid);
      return existingUser;
    } catch (error) {
      // Usuário não existe, podemos criar
      if (error.code === "auth/user-not-found") {
        console.log("📝 Usuário não encontrado, criando novo...");
      } else {
        throw error;
      }
    }

    // Criar novo usuário
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true, // Marcar como verificado para desenvolvimento
      displayName: "Admin User",
    });

    console.log(`✅ Usuário criado com sucesso:`);
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Email verificado: ${userRecord.emailVerified}`);

    return userRecord;
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
    throw error;
  }
}

// Pegar argumentos da linha de comando
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("❌ Por favor, forneça email e senha como argumentos.");
  console.log(
    "📝 Exemplo: node scripts/create-auth-user.js email@exemplo.com senhaSecreta123"
  );
  process.exit(1);
}

console.log("🚀 Iniciando criação de usuário Auth...");
createAuthUser(email, password)
  .then(() => {
    console.log("✨ Script finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro no script:", error);
    process.exit(1);
  });
