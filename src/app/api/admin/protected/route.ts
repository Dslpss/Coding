import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Inicialização segura do Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "barbearia-bd25e",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin SDK inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar Firebase Admin SDK:", error);
    // Você pode adicionar um fallback aqui se necessário
  }
}

// Função utilitária para verificar se o usuário é admin
async function isAdmin(email: string) {
  try {
    // Aqui você pode usar o Firestore Admin SDK para buscar na coleção admins
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    const adminId = email.replace(/\./g, "_").replace("@", "_");
    console.log(`Verificando se ${email} (ID: ${adminId}) é admin`);
    const adminDoc = await db.collection("admins").doc(adminId).get();
    console.log(`Admin existe: ${adminDoc.exists}`);
    return adminDoc.exists;
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }
  const idToken = authHeader.split(" ")[1];
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const email = decoded.email;
    if (!email || !(await isAdmin(email))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    // Aqui vai a lógica protegida para admins
    return NextResponse.json({ message: "Acesso admin autorizado!" });
  } catch (e) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
