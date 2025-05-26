import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";
import globalRateLimiter from "@/lib/rate-limiter";

const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hora

// Inicializar Firebase Admin
initAdmin();

export async function POST(req: NextRequest) {
  console.log("=== ENDPOINT CHAMADO ===");

  // Obter IP do cliente para rate limiting
  const clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  console.log("IP do cliente:", clientIp);

  // Verificar rate limit
  if (globalRateLimiter.isRateLimited(clientIp)) {
    console.log("❌ Rate limit atingido para IP:", clientIp);
    const timeToReset = Math.ceil(
      globalRateLimiter.getTimeToReset(clientIp) / 1000 / 60
    );
    return NextResponse.json(
      {
        error: "Muitas tentativas de login. Tente novamente mais tarde.",
        timeToReset: `${timeToReset} minutos`,
      },
      { status: 429 }
    );
  }
  try {
    const { email, password } = await req.json();

    console.log("=== INÍCIO DA AUTENTICAÇÃO ===");
    console.log("Email recebido:", email);
    console.log("IP do cliente:", clientIp);

    if (!email || !password) {
      console.log("❌ Email ou senha não fornecidos");
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar credenciais e admin status
    const auth = getAuth();
    const db = getFirestore();

    try {
      // Primeiro verificar se usuário existe e é admin
      console.log("🔍 Verificando usuário no Firebase Auth...");
      const userRecord = await auth.getUserByEmail(email);
      console.log("✅ Usuário encontrado no Firebase Auth:", userRecord.uid);

      // Verificar se é admin no Firestore
      const adminId = email.replace(/\./g, "_").replace("@", "_");
      console.log("🔍 Buscando documento admin:", adminId);
      const adminDoc = await db.collection("admins").doc(adminId).get();

      if (!adminDoc.exists) {
        console.log("❌ Documento admin não encontrado");
        globalRateLimiter.isRateLimited(clientIp); // Incrementa tentativas falhas
        return NextResponse.json(
          {
            error: "Usuário não é administrador",
            remainingAttempts: globalRateLimiter.getRemainingAttempts(clientIp),
          },
          { status: 403 }
        );
      }

      const adminData = adminDoc.data();
      console.log("✅ Documento admin encontrado:", {
        active: adminData?.active,
        role: adminData?.role,
      });

      if (!adminData?.active) {
        console.log("❌ Conta administrativa desativada");
        globalRateLimiter.isRateLimited(clientIp); // Incrementa tentativas falhas
        return NextResponse.json(
          {
            error: "Conta administrativa desativada",
            remainingAttempts: globalRateLimiter.getRemainingAttempts(clientIp),
          },
          { status: 403 }
        );
      }

      // Verificar senha usando REST API do Firebase Auth
      let idToken: string;
      try {
        const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!firebaseApiKey) {
          console.error("Firebase API Key não configurada");
          throw new Error("Firebase API Key não configurada");
        }

        console.log(
          "Tentando autenticar com Firebase API Key:",
          firebaseApiKey.substring(0, 20) + "..."
        );

        const authResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              password: password,
              returnSecureToken: true,
            }),
          }
        );
        console.log("Firebase Auth Response Status:", authResponse.status);

        if (!authResponse.ok) {
          const errorData = await authResponse.json();
          console.error("Firebase Auth Error:", errorData);
          throw new Error(errorData.error?.message || "Authentication failed");
        }

        const authData = await authResponse.json();
        console.log("Authentication successful for:", email);
        // Usar o idToken da resposta para criar o session cookie
        idToken = authData.idToken;
      } catch (authError) {
        console.error("Erro na verificação de senha:", authError);
        globalRateLimiter.isRateLimited(clientIp);
        return NextResponse.json(
          {
            error: "Credenciais inválidas",
            remainingAttempts: globalRateLimiter.getRemainingAttempts(clientIp),
          },
          { status: 401 }
        );
      } // Criar um session cookie usando o idToken da autenticação
      const accessToken = await auth.createSessionCookie(idToken, {
        expiresIn: ACCESS_TOKEN_EXPIRY * 1000, // Converter para milissegundos
      });

      // Atualizar último login
      await adminDoc.ref.update({
        lastLogin: new Date(),
        updatedAt: new Date(),
        lastLoginIp: clientIp,
      });

      // Resetar rate limit após login bem-sucedido
      globalRateLimiter.reset(clientIp);

      // Criar resposta com cookie seguro
      const response = NextResponse.json({
        success: true,
        role: adminData.role,
        permissions: adminData.permissions || [],
      });

      // Definir cookie httpOnly seguro
      response.cookies.set("admin_session", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: ACCESS_TOKEN_EXPIRY,
        path: "/",
      });

      return response;
    } catch (error: unknown) {
      console.error("Erro na autenticação:", error);
      globalRateLimiter.isRateLimited(clientIp); // Incrementa tentativas falhas

      // Detectar tipo de erro
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "auth/user-not-found"
      ) {
        return NextResponse.json(
          {
            error: "Usuário não encontrado",
            remainingAttempts: globalRateLimiter.getRemainingAttempts(clientIp),
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: "Credenciais inválidas",
          remainingAttempts: globalRateLimiter.getRemainingAttempts(clientIp),
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
