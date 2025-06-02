// Teste para verificar se as configurações de registro estão funcionando
const fetch = require("node-fetch");

async function testRegistrationSettings() {
  console.log("🧪 Testando configurações de registro...\n");

  try {
    // 1. Verificar configurações atuais via API de auth/settings
    console.log("1. Verificando configurações via /api/auth/settings...");
    const settingsResponse = await fetch(
      "http://localhost:3000/api/auth/settings"
    );
    console.log(`   Status: ${settingsResponse.status}`);

    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      console.log(`   allowRegistration: ${settings.allowRegistration}`);
    } else {
      console.log(`   Erro: ${await settingsResponse.text()}`);
    }

    // 2. Verificar configurações via API de admin/config
    console.log("\n2. Verificando configurações via /api/admin/config...");
    const adminConfigResponse = await fetch(
      "http://localhost:3000/api/admin/config"
    );
    console.log(`   Status: ${adminConfigResponse.status}`);

    if (adminConfigResponse.ok) {
      const adminConfig = await adminConfigResponse.json();
      console.log(`   allowRegistration: ${adminConfig.allowRegistration}`);
      console.log(
        `   Configurações completas:`,
        JSON.stringify(adminConfig, null, 2)
      );
    } else {
      console.log(`   Erro: ${await adminConfigResponse.text()}`);
    }

    // 3. Testar tentativa de registro
    console.log("\n3. Testando tentativa de registro...");
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    console.log(`   Email de teste: ${testEmail}`);

    // Simular o que o AuthForm faz
    const registrationAllowedResponse = await fetch(
      "http://localhost:3000/api/auth/settings"
    );
    if (registrationAllowedResponse.ok) {
      const settings = await registrationAllowedResponse.json();
      console.log(
        `   Configuração lida pelo frontend: allowRegistration = ${settings.allowRegistration}`
      );

      if (!settings.allowRegistration) {
        console.log("   ✅ Registro bloqueado pela configuração!");
      } else {
        console.log(
          "   ❌ Registro permitido pela configuração - problema aqui!"
        );
      }
    }
  } catch (error) {
    console.error("Erro no teste:", error);
  }
}

testRegistrationSettings();
