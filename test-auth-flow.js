// Script para testar o fluxo de autenticação admin
const fetch = require("node-fetch");

const baseUrl = "http://localhost:3001";

async function testAuthFlow() {
  console.log("🧪 Iniciando teste do fluxo de autenticação admin...\n");

  try {
    // 1. Testar tentativa de acesso sem autenticação
    console.log("1. Testando acesso direto ao admin (sem auth)...");
    const adminResponse = await fetch(`${baseUrl}/admin`, {
      redirect: "manual",
    });
    console.log(`   Status: ${adminResponse.status}`);
    console.log(
      `   Redirect: ${adminResponse.headers.get("location") || "N/A"}\n`
    );

    // 2. Testar login com credenciais inválidas
    console.log("2. Testando login com credenciais inválidas...");
    const loginResponse = await fetch(`${baseUrl}/api/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "teste@invalido.com",
        password: "senhaerrada",
      }),
    });
    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, loginData);
    console.log(
      `   Tentativas restantes: ${loginData.remainingAttempts || "N/A"}\n`
    );

    // 3. Testar rate limiting
    console.log("3. Testando rate limiting (múltiplas tentativas)...");
    for (let i = 0; i < 6; i++) {
      const rateLimitResponse = await fetch(`${baseUrl}/api/admin/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "teste@spam.com",
          password: "senha123",
        }),
      });
      const rateLimitData = await rateLimitResponse.json();
      console.log(
        `   Tentativa ${i + 1}: Status ${
          rateLimitResponse.status
        }, Restantes: ${rateLimitData.remainingAttempts || "N/A"}`
      );

      if (rateLimitResponse.status === 429) {
        console.log(
          `   🚫 Rate limit ativado! ${rateLimitData.timeToReset || "N/A"}`
        );
        break;
      }
    }
    console.log("");

    // 4. Testar login com credenciais válidas (se existirem)
    console.log("4. Testando login com credenciais válidas...");
    const validLoginResponse = await fetch(`${baseUrl}/api/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "dennisemannuel93@gmail.com",
        password: "password123", // Senha de teste
      }),
    });
    const validLoginData = await validLoginResponse.json();
    console.log(`   Status: ${validLoginResponse.status}`);
    console.log(`   Response:`, validLoginData);

    // Verificar se cookie foi definido
    const setCookieHeader = validLoginResponse.headers.get("set-cookie");
    console.log(`   Cookie definido: ${setCookieHeader ? "Sim" : "Não"}\n`);

    console.log("✅ Teste do fluxo de autenticação concluído!");
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow };
