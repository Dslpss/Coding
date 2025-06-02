// Teste das funcionalidades de configuração
const admin = require("firebase-admin");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./service-account.json.json")),
  });
}

const db = admin.firestore();

async function testConfigFunctionality() {
  try {
    console.log("🧪 Testando funcionalidades de configuração...\n");

    // 1. Testar carregamento das configurações atuais
    console.log("📖 1. Carregando configurações atuais...");
    const configRef = db.collection("system").doc("settings");
    const configSnap = await configRef.get();

    if (configSnap.exists()) {
      const currentConfig = configSnap.data();
      console.log("✅ Configurações carregadas com sucesso!");
      console.log(`   📝 Nome do Site: "${currentConfig.siteName}"`);
      console.log(`   📄 Descrição: "${currentConfig.siteDescription}"`);
      console.log(
        `   📧 Notificações por Email: ${
          currentConfig.emailNotifications ? "Ativadas" : "Desativadas"
        }`
      );
      console.log(`   📧 Email do Admin: "${currentConfig.adminEmail}"`);
      console.log("");

      // 2. Testar atualização individual das configurações
      console.log("🔄 2. Testando atualizações individuais...");

      // Teste: Alterar nome do site
      const newSiteName = `Self Coding (Teste ${Date.now()})`;
      await configRef.update({ siteName: newSiteName });
      console.log(`   ✅ Nome do site atualizado para: "${newSiteName}"`);

      // Teste: Alterar descrição
      const newDescription = `Plataforma atualizada em ${new Date().toLocaleString(
        "pt-BR"
      )}`;
      await configRef.update({ siteDescription: newDescription });
      console.log(`   ✅ Descrição atualizada para: "${newDescription}"`);

      // Teste: Alternar notificações por email
      const newEmailNotifications = !currentConfig.emailNotifications;
      await configRef.update({ emailNotifications: newEmailNotifications });
      console.log(
        `   ✅ Notificações por email: ${
          newEmailNotifications ? "Ativadas" : "Desativadas"
        }`
      );

      console.log("");

      // 3. Verificar se as mudanças foram persistidas
      console.log("🔍 3. Verificando persistência das mudanças...");
      const updatedSnap = await configRef.get();
      const updatedConfig = updatedSnap.data();

      console.log("✅ Configurações após atualizações:");
      console.log(`   📝 Nome do Site: "${updatedConfig.siteName}"`);
      console.log(`   📄 Descrição: "${updatedConfig.siteDescription}"`);
      console.log(
        `   📧 Notificações por Email: ${
          updatedConfig.emailNotifications ? "Ativadas" : "Desativadas"
        }`
      );
      console.log("");

      // 4. Restaurar configurações originais
      console.log("🔄 4. Restaurando configurações originais...");
      await configRef.update({
        siteName: currentConfig.siteName,
        siteDescription: currentConfig.siteDescription,
        emailNotifications: currentConfig.emailNotifications,
      });
      console.log("✅ Configurações restauradas!");
    } else {
      console.log("❌ Documento de configurações não encontrado!");

      // Criar configurações padrão
      console.log("🔧 Criando configurações padrão...");
      const defaultConfig = {
        siteName: "Self Coding",
        siteDescription: "Plataforma de ensino de programação",
        maintenanceMode: false,
        allowRegistration: true,
        maxUploadSize: 5,
        emailNotifications: true,
        adminEmail: "admin@exemplo.com",
        backupFrequency: "daily",
        sessionTimeout: 30,
        maxLoginAttempts: 3,
        themeColor: "#3B82F6",
        enableAnalytics: true,
      };

      await configRef.set(defaultConfig);
      console.log("✅ Configurações padrão criadas!");
    }

    console.log("\n🎉 Teste concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

testConfigFunctionality();
