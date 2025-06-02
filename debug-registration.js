// Teste específico para debugging do problema de registro
const fetch = require("node-fetch");

async function debugRegistrationProblem() {
  console.log("🔍 Debug do problema de registro...\n");

  try {
    // 1. Verificar se o servidor está rodando
    console.log("1. Verificando se o servidor está rodando...");
    try {
      const healthCheck = await fetch(
        "http://localhost:3000/api/auth/settings"
      );
      console.log(`   Status: ${healthCheck.status}`);
      if (healthCheck.ok) {
        const settings = await healthCheck.json();
        console.log(
          `   Configurações atuais: ${JSON.stringify(settings, null, 2)}`
        );
      }
    } catch (error) {
      console.log("   ❌ Servidor não está rodando. Inicie com: npm run dev");
      return;
    }

    // 2. Verificar configurações no Firestore diretamente
    console.log("\n2. Verificando configurações via admin API...");
    const adminConfigResponse = await fetch(
      "http://localhost:3000/api/admin/config"
    );
    console.log(`   Status: ${adminConfigResponse.status}`);

    if (adminConfigResponse.status === 401) {
      console.log("   ⚠️  Não autenticado como admin - isso é esperado");
    } else if (adminConfigResponse.ok) {
      const adminConfig = await adminConfigResponse.json();
      console.log(
        `   Configurações do admin: ${JSON.stringify(adminConfig, null, 2)}`
      );
    }

    // 3. Simular exatamente o que o frontend faz
    console.log("\n3. Simulando verificação do frontend...");

    const frontendCheck = await fetch(
      "http://localhost:3000/api/auth/settings"
    );
    if (frontendCheck.ok) {
      const settings = await frontendCheck.json();
      console.log(`   allowRegistration: ${settings.allowRegistration}`);

      if (settings.allowRegistration === false) {
        console.log("   ✅ Frontend deveria bloquear o registro!");
      } else {
        console.log("   ❌ Frontend não vai bloquear o registro!");
      }
    }

    // 4. Verificar o estado do banco de dados
    console.log("\n4. Fazendo verificação adicional...");
    console.log("   Para verificar o estado do Firestore, acesse:");
    console.log(
      "   https://console.firebase.google.com/project/barbearia-bd25e/firestore/data/system/settings"
    );
  } catch (error) {
    console.error("Erro no debug:", error);
  }
}

debugRegistrationProblem();
