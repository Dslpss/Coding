import { NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET() {
  try {
    console.log("Buscando configurações do sistema...");

    // Inicializar Firebase Admin
    const app = initAdmin();
    const db = getFirestore(app);

    // Buscar configurações do sistema
    const configDoc = await db.collection("system").doc("settings").get();

    if (configDoc.exists) {
      const settings = configDoc.data();
      console.log("Configurações encontradas:", settings);
      return NextResponse.json({
        allowRegistration: settings?.allowRegistration ?? true,
        maintenanceMode: settings?.maintenanceMode ?? false,
      });
    } else {
      console.log("Documento de configurações não existe, retornando padrões");
      // Configurações padrão se não existir documento
      return NextResponse.json({
        allowRegistration: true,
        maintenanceMode: false,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
