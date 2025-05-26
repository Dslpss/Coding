const fetch = require("node-fetch");

async function testMiddlewareFlow() {
  console.log("🔐 Testando fluxo completo do middleware...\n");

  try {
    // 1. Primeiro fazer login para obter cookie de sessão
    console.log("1. Fazendo login...");
    const loginResponse = await fetch("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "dennisemannuel93@gmail.com",
        password: "AdminPassword123!",
      }),
    });

    console.log("Status login:", loginResponse.status);

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log("❌ Erro no login:", error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log("✅ Login bem-sucedido");

    // Extrair cookie de sessão
    const setCookieHeader = loginResponse.headers.get("set-cookie");
    console.log("Set-Cookie header:", setCookieHeader);

    if (!setCookieHeader) {
      console.log("❌ Nenhum cookie de sessão retornado");
      return;
    }

    // Extrair valor do cookie admin_session
    const sessionCookieMatch = setCookieHeader.match(/admin_session=([^;]+)/);
    if (!sessionCookieMatch) {
      console.log("❌ Cookie admin_session não encontrado");
      return;
    }

    const sessionCookie = sessionCookieMatch[1];
    console.log(
      "Cookie de sessão obtido (primeiros 50 chars):",
      sessionCookie.substring(0, 50) + "..."
    );

    // 2. Testar endpoint de verificação diretamente
    console.log("\n2. Testando endpoint de verificação...");
    const verifyResponse = await fetch(
      "http://localhost:3000/api/admin/auth/verify",
      {
        headers: {
          Cookie: `admin_session=${sessionCookie}`,
        },
      }
    );

    console.log("Status verificação:", verifyResponse.status);
    const verifyData = await verifyResponse.text();
    console.log("Resposta verificação:", verifyData);

    if (!verifyResponse.ok) {
      console.log("❌ Verificação falhou");
      return;
    }

    console.log("✅ Verificação bem-sucedida");

    // 3. Testar acesso a rota protegida
    console.log("\n3. Testando acesso a rota protegida...");
    const adminResponse = await fetch("http://localhost:3000/admin/dashboard", {
      headers: {
        Cookie: `admin_session=${sessionCookie}`,
      },
      redirect: "manual", // Não seguir redirecionamentos automaticamente
    });

    console.log("Status rota protegida:", adminResponse.status);
    console.log("Location header:", adminResponse.headers.get("location"));

    if (adminResponse.status === 302 || adminResponse.status === 307) {
      const redirectLocation = adminResponse.headers.get("location");
      console.log("❌ Redirecionado para:", redirectLocation);

      if (redirectLocation?.includes("admin-login")) {
        console.log(
          "❌ Middleware rejeitou o acesso - redirecionando para login"
        );
      }
    } else {
      console.log("✅ Acesso permitido à rota protegida");
    }
  } catch (error) {
    console.error("❌ Erro durante teste:", error.message);
  }
}

testMiddlewareFlow();
