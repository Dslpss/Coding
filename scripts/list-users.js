// Script para listar todos os usuários do Firebase Auth e verificar o problema
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

async function listAllUsers() {
  console.log("👥 Listando todos os usuários do Firebase Authentication...\n");

  try {
    // Listar todos os usuários
    const listUsersResult = await auth.listUsers(1000);

    console.log(
      `📊 Total de usuários encontrados: ${listUsersResult.users.length}\n`
    );

    if (listUsersResult.users.length === 0) {
      console.log("⚠️ Nenhum usuário encontrado no Firebase Authentication!");
      console.log("🔧 Isso explica por que o login não está funcionando.");
      return;
    }

    listUsersResult.users.forEach((userRecord, index) => {
      console.log(`👤 Usuário ${index + 1}:`);
      console.log(`   - UID: ${userRecord.uid}`);
      console.log(`   - Email: ${userRecord.email || "N/A"}`);
      console.log(`   - Email verificado: ${userRecord.emailVerified}`);
      console.log(`   - Criado em: ${userRecord.metadata.creationTime}`);
      console.log(
        `   - Último login: ${userRecord.metadata.lastSignInTime || "Nunca"}`
      );
      console.log(`   - Desabilitado: ${userRecord.disabled}`);
      console.log("");
    });

    // Verificar especificamente o usuário que estamos tentando usar
    const targetEmail = "dennisemannuel93@gmail.com";
    console.log(`🔍 Procurando especificamente por: ${targetEmail}`);

    try {
      const targetUser = await auth.getUserByEmail(targetEmail);
      console.log("✅ Usuário encontrado!");
      console.log(`   - UID: ${targetUser.uid}`);
      console.log(`   - Email verificado: ${targetUser.emailVerified}`);
      console.log(`   - Desabilitado: ${targetUser.disabled}`);
    } catch (error) {
      console.log("❌ Usuário não encontrado com esse email!");
      console.log("🔧 Isso confirma o problema - precisamos criar o usuário.");
    }
  } catch (error) {
    console.error("❌ Erro ao listar usuários:", error);
  }
}

// Executar listagem
listAllUsers()
  .then(() => {
    console.log("✨ Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro no script:", error);
    process.exit(1);
  });
