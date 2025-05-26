const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

async function initAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(
      process.cwd(),
      "service-account.json.json"
    );

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccountFile = fs.readFileSync(serviceAccountPath, "utf8");
      const serviceAccount = JSON.parse(serviceAccountFile);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else {
      throw new Error("Arquivo de credenciais não encontrado");
    }
  }
}

async function resetAdminPassword() {
  try {
    console.log("🔐 Redefinindo senha do administrador...\n");

    // Inicializar Firebase Admin
    await initAdmin();
    const auth = admin.auth();

    const email = "dennisemannuel93@gmail.com";
    const newPassword = "AdminPassword123!";

    // Buscar usuário por email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Usuário encontrado: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);

    // Atualizar senha
    await auth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    console.log(`✅ Senha atualizada com sucesso!`);
    console.log(`   Nova senha: ${newPassword}`);
    console.log(`   Email: ${email}`);
  } catch (error) {
    console.error("❌ Erro ao redefinir senha:", error);
  }
}

resetAdminPassword();
