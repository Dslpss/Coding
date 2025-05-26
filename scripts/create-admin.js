// Script para criar um documento admin no Firestore
// Execute com: node scripts/create-admin.js

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Carregar credenciais do Firebase Admin
try {
  var serviceAccount = require("../service-account.json");
} catch (error) {
  console.error("❌ Arquivo service-account.json não encontrado!");
  console.log("📝 Você precisa:");
  console.log("1. Ir ao Console do Firebase");
  console.log("2. Configurações do Projeto > Contas de serviço");
  console.log("3. Gerar nova chave privada");
  console.log(
    '4. Salvar o arquivo como "service-account.json" na raiz do projeto'
  );
  process.exit(1);
}

// Inicializar Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function createAdmin(email) {
  if (!email) {
    console.error("❌ Email não fornecido!");
    return;
  }

  const adminId = email.replace(/\./g, "_").replace("@", "_");
  console.log("🔍 Verificando admin:", email);

  try {
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (adminDoc.exists) {
      console.log("⚠️ Admin já existe! Atualizando permissões...");
    }

    await db
      .collection("admins")
      .doc(adminId)
      .set(
        {
          email: email,
          role: "super_admin",
          permissions: {
            manage_admins: true,
            manage_courses: true,
            manage_blog: true,
            manage_users: true,
            manage_matriculas: true,
          },
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
          twoFactorEnabled: false,
        },
        { merge: true }
      );

    console.log(`✅ Admin criado com sucesso: ${email} (ID: ${adminId})`);
  } catch (error) {
    console.error("Erro ao criar admin:", error);
  }
}

// Pegar email dos argumentos da linha de comando
const adminEmail = process.argv[2];

if (!adminEmail) {
  console.error("❌ Por favor, forneça um email como argumento.");
  console.log("📝 Exemplo: node scripts/create-admin.js seu.email@exemplo.com");
  process.exit(1);
}

console.log("🚀 Iniciando criação de admin...");
createAdmin(adminEmail)
  .then(() => {
    console.log("✨ Script finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro no script:", error);
    process.exit(1);
  });
