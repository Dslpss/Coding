// Script para limpar rate limit durante desenvolvimento
const fetch = require("node-fetch");

async function clearRateLimit() {
  console.log("🧹 Limpando rate limit para desenvolvimento...\n");

  try {
    // Fazer uma requisição válida para resetar o contador
    const response = await fetch("http://localhost:3001/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1-clear", // IP diferente para resetar
      },
      body: JSON.stringify({
        email: "test@clear.com",
        password: "dummy",
      }),
    });

    const data = await response.json();
    console.log("Resposta da limpeza:", data);

    // Aguardar um pouco
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Agora testar login válido
    console.log("\n🔐 Testando login com credenciais válidas...");
    const loginResponse = await fetch("http://localhost:3001/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1-test", // IP diferente
      },
      body: JSON.stringify({
        email: "dennisemannuel93@gmail.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log("Response:", loginData);

    const setCookieHeader = loginResponse.headers.get("set-cookie");
    console.log(`Cookie definido: ${setCookieHeader ? "Sim" : "Não"}`);

    if (setCookieHeader) {
      console.log("✅ Login funcionando corretamente!");
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

clearRateLimit();
