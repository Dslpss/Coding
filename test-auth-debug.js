const fetch = require("node-fetch");

async function testAuth() {
  console.log("🔍 Debug da autenticação...\n");
  const credentials = {
    email: "dennisemannuel93@gmail.com",
    password: "AdminPassword123!",
  };

  try {
    const response = await fetch("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("Response:", data);

    // Testar também diretamente a API do Firebase
    console.log("\n🔥 Testando API direta do Firebase...");

    const firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyATDE21wBLKPqLcAXKzIQti9vvYAT3gZPM`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          returnSecureToken: true,
        }),
      }
    );

    console.log("Firebase Status:", firebaseResponse.status);
    const firebaseData = await firebaseResponse.json();
    console.log("Firebase Response:", firebaseData);
  } catch (error) {
    console.error("Erro:", error);
  }
}

testAuth();
