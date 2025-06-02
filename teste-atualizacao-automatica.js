const fs = require("fs");
const path = require("path");

/**
 * Script para testar o comportamento da página de manutenção
 * quando o modo de manutenção é desativado.
 */

const settingsPath = path.join(__dirname, "public", "api-settings.json");

/**
 * Define o modo de manutenção
 */
function setMaintenanceMode(enabled) {
  try {
    // Verificar se o diretório existe
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Escrever as configurações
    fs.writeFileSync(
      settingsPath,
      JSON.stringify({ maintenanceMode: enabled }, null, 2)
    );

    console.log(`🔧 Modo de manutenção ${enabled ? "ATIVADO" : "DESATIVADO"}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Erro ao ${enabled ? "ativar" : "desativar"} modo de manutenção:`,
      error
    );
    return false;
  }
}

/**
 * Executa o teste completo
 */
async function runTest() {
  console.log("🚀 Teste de Redirecionamento Automático");
  console.log("-----------------------------------------");

  console.log("\n1. Verificando estado atual");
  const currentSettings = fs.existsSync(settingsPath)
    ? JSON.parse(fs.readFileSync(settingsPath, "utf8"))
    : { maintenanceMode: false };
  console.log(
    `   Estado atual: Manutenção ${
      currentSettings.maintenanceMode ? "ATIVADA" : "DESATIVADA"
    }`
  );

  console.log("\n2. Ativando modo de manutenção");
  setMaintenanceMode(true);
  console.log(
    "   ✓ Acesse http://localhost:3000/site-em-manutencao no navegador"
  );
  console.log("   ✓ Para testar o middleware, tente acessar /dashboard");

  console.log("\n3. Aguardando 5 segundos...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\n4. Desativando modo de manutenção");
  setMaintenanceMode(false);
  console.log("   ✓ A página deve detectar a alteração em até 5 segundos");
  console.log(
    "   ✓ Deve aparecer a mensagem 'Manutenção concluída!' com contagem regressiva"
  );

  console.log("\n5. Aguardando mais 10 segundos para contagem regressiva...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("\n✅ Teste concluído!");
  console.log("   Comportamento esperado:");
  console.log(
    "   1. Quando a manutenção é desativada, a página mostra a contagem regressiva"
  );
  console.log(
    "   2. Após a contagem, a página redireciona para /dashboard automaticamente"
  );
  console.log(
    "   3. A página NÃO mostra contagem quando carregada com manutenção já desativada"
  );

  console.log("\n🔍 Se o teste não funcionou, certifique-se que:");
  console.log("   1. O servidor Next.js está rodando (npm run dev)");
  console.log("   2. A página está aberta no navegador durante o teste");
  console.log("   3. A API está funcionando corretamente");
}

runTest().catch(console.error);
