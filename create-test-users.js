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

async function createTestUsers() {
  try {
    console.log("🔄 Criando usuários de teste...\n");

    await initAdmin();
    const db = admin.firestore();

    // Verificar se já existem usuários
    const usersSnapshot = await db.collection("users").limit(1).get();

    if (!usersSnapshot.empty) {
      console.log(
        "✅ Já existem usuários na coleção. Listando os primeiros 5:"
      );

      const existingUsers = await db.collection("users").limit(5).get();
      existingUsers.forEach((doc, index) => {
        const data = doc.data();
        console.log(
          `${index + 1}. ${data.email} - ${data.displayName || "Sem nome"}`
        );
      });

      console.log(`\nTotal de usuários encontrados: ${existingUsers.size}`);
      return;
    }

    // Criar usuários de teste
    const testUsers = [
      {
        id: "user1",
        email: "joao.silva@exemplo.com",
        displayName: "João Silva",
        photoURL: null,
        status: "active",
        matriculas: 2,
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      {
        id: "user2",
        email: "maria.santos@exemplo.com",
        displayName: "Maria Santos",
        photoURL: null,
        status: "active",
        matriculas: 1,
        createdAt: new Date(),
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },
      {
        id: "user3",
        email: "pedro.oliveira@exemplo.com",
        displayName: "Pedro Oliveira",
        photoURL: null,
        status: "inactive",
        matriculas: 0,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      },
      {
        id: "user4",
        email: "ana.costa@exemplo.com",
        displayName: "Ana Costa",
        photoURL: null,
        status: "active",
        matriculas: 3,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
        lastLogin: new Date(),
      },
      {
        id: "user5",
        email: "carlos.ferreira@exemplo.com",
        displayName: "Carlos Ferreira",
        photoURL: null,
        status: "banned",
        matriculas: 1,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
      },
    ];

    console.log("📝 Criando usuários de teste...");

    for (const user of testUsers) {
      await db.collection("users").doc(user.id).set(user);
      console.log(`✅ Usuário criado: ${user.email}`);
    }

    console.log(
      `\n🎉 ${testUsers.length} usuários de teste criados com sucesso!`
    );
    console.log("\n📋 Resumo dos usuários criados:");
    testUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.email} - ${user.displayName} (${user.status})`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao criar usuários de teste:", error);
  }
}

createTestUsers();
