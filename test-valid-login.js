// Script para testar login com credenciais válidas após reset
const fetch = require("node-fetch");

const baseUrl = "http://localhost:3001";

async function testValidLogin() {
  console.log("🧪 Testando login com credenciais válidas...\n");

  try {
    console.log("📋 Tentando login como admin...");

    const loginResponse = await fetch(`${baseUrl}/api/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "dennisemannuel93@gmail.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, loginData);

    // Verificar se cookie foi definido
    const setCookieHeader = loginResponse.headers.get("set-cookie");
    console.log(`   Cookie definido: ${setCookieHeader ? "Sim" : "Não"}`);

    if (setCookieHeader) {
      console.log(`   Cookie: ${setCookieHeader}`);

      // Testar acesso ao admin com cookie
      console.log("\n🔐 Testando acesso ao /admin com cookie...");

      const adminResponse = await fetch(`${baseUrl}/admin`, {
        headers: {
          Cookie: setCookieHeader,
        },
        redirect: "manual",
      });

      console.log(`   Status: ${adminResponse.status}`);
      if (adminResponse.status === 307 || adminResponse.status === 302) {
        console.log(`   Redirect: ${adminResponse.headers.get("location")}`);
      } else {
        console.log("   ✅ Acesso autorizado ao painel admin!");
      }

      // Testar endpoint de verificação
      console.log("\n🔍 Testando endpoint de verificação...");
      const verifyResponse = await fetch(`${baseUrl}/api/admin/auth/verify`, {
        headers: {
          Cookie: setCookieHeader,
        },
      });

      const verifyData = await verifyResponse.json();
      console.log(`   Status: ${verifyResponse.status}`);
      console.log(`   Response:`, verifyData);
    }

    console.log("\n✅ Teste concluído!");
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar teste
testValidLogin();
