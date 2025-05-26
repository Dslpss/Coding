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

async function checkAdmins() {
  try {
    console.log("🔍 Verificando administradores no Firestore...\n");

    await initAdmin();
    const db = admin.firestore();

    // Listar todos os documentos da coleção admins
    const adminsSnapshot = await db.collection("admins").get();

    if (adminsSnapshot.empty) {
      console.log("❌ Nenhum administrador encontrado na coleção admins");
      return;
    }

    console.log(`✅ ${adminsSnapshot.size} administrador(es) encontrado(s):\n`);

    adminsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Documento ID: ${doc.id}`);
      console.log(`   Email: ${data.email || "N/A"}`);
      console.log(`   Ativo: ${data.active || false}`);
      console.log(`   Role: ${data.role || "N/A"}`);
      console.log(`   Permissions: ${JSON.stringify(data.permissions || [])}`);
      console.log(`   Criado em: ${data.createdAt?.toDate() || "N/A"}`);
      console.log(`   Último login: ${data.lastLogin?.toDate() || "Nunca"}`);
      console.log("");
    });

    // Verificar especificamente o admin dennisemannuel93@gmail.com
    const targetEmail = "dennisemannuel93@gmail.com";
    const adminId = targetEmail.replace(/\./g, "_").replace("@", "_");

    console.log(`🎯 Verificando especificamente o admin: ${adminId}`);
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      console.log("✅ Admin encontrado!");
      console.log(`   Ativo: ${adminData.active}`);
      console.log(`   Role: ${adminData.role}`);
      console.log(`   Permissions: ${JSON.stringify(adminData.permissions)}`);
    } else {
      console.log("❌ Admin específico não encontrado!"); // Criar o documento admin se não existir
      console.log("🔧 Criando documento admin...");
      await db
        .collection("admins")
        .doc(adminId)
        .set({
          email: targetEmail,
          active: true,
          role: "super_admin",
          permissions: {
            manage_users: true,
            manage_courses: true,
            manage_blog: true,
            manage_admins: true,
            manage_matriculas: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      console.log("✅ Documento admin criado com sucesso!");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar admins:", error);
  }
}

checkAdmins();
