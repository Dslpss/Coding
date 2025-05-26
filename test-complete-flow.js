const http = require("http");

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function testCompleteFlow() {
  console.log("🧪 Testando fluxo completo de autenticação...\n");

  try {
    // Passo 1: Fazer login para obter cookie de sessão
    console.log("1️⃣ Fazendo login...");
    const loginData = JSON.stringify({
      email: "dennisemannuel93@gmail.com",
      password: "AdminPassword123!",
    });

    const loginOptions = {
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/auth",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginData),
      },
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`Status: ${loginResponse.statusCode}`);

    if (loginResponse.statusCode !== 200) {
      console.log("❌ Login falhou:", loginResponse.body);
      return;
    }

    // Extrair cookie de sessão
    const setCookieHeader = loginResponse.headers["set-cookie"];
    if (!setCookieHeader) {
      console.log("❌ Nenhum cookie de sessão recebido");
      return;
    }

    const sessionCookie = setCookieHeader.find((cookie) =>
      cookie.includes("session=")
    );
    if (!sessionCookie) {
      console.log("❌ Cookie de sessão não encontrado");
      return;
    }

    const cookieValue = sessionCookie.split(";")[0]; // Pegar apenas session=valor
    console.log(
      "✅ Login bem-sucedido! Cookie obtido:",
      cookieValue.substring(0, 50) + "..."
    );

    // Passo 2: Acessar rota protegida com cookie de sessão
    console.log("\n2️⃣ Acessando rota protegida /admin com sessão...");

    const protectedOptions = {
      hostname: "localhost",
      port: 3000,
      path: "/admin",
      method: "GET",
      headers: {
        Cookie: cookieValue,
      },
    };

    const protectedResponse = await makeRequest(protectedOptions);
    console.log(`Status: ${protectedResponse.statusCode}`);

    if (protectedResponse.statusCode === 200) {
      console.log("✅ Acesso autorizado à rota protegida!");
      console.log("📄 Primeiros 200 caracteres da resposta:");
      console.log(protectedResponse.body.substring(0, 200) + "...");
    } else if (protectedResponse.statusCode === 307) {
      console.log(
        "❌ Ainda redirecionando - sessão pode não estar funcionando"
      );
      console.log("Redirecionando para:", protectedResponse.headers.location);
    } else {
      console.log("❌ Status inesperado:", protectedResponse.statusCode);
      console.log("Response:", protectedResponse.body);
    }

    // Passo 3: Testar outra rota protegida
    console.log("\n3️⃣ Testando rota /admin/dashboard...");

    const dashboardOptions = {
      hostname: "localhost",
      port: 3000,
      path: "/admin/dashboard",
      method: "GET",
      headers: {
        Cookie: cookieValue,
      },
    };

    const dashboardResponse = await makeRequest(dashboardOptions);
    console.log(`Status: ${dashboardResponse.statusCode}`);

    if (dashboardResponse.statusCode === 200) {
      console.log("✅ Acesso autorizado ao dashboard!");
    } else if (dashboardResponse.statusCode === 404) {
      console.log(
        "ℹ️ Rota /admin/dashboard não existe (404) - isso é normal se não foi criada ainda"
      );
    } else if (dashboardResponse.statusCode === 307) {
      console.log("❌ Redirecionando - problema com autenticação");
      console.log("Redirecionando para:", dashboardResponse.headers.location);
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error.message);
  }
}

testCompleteFlow();
