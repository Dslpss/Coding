import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Inicializar Firebase Admin
initAdmin();

// Configurações padrão do sistema
const DEFAULT_SETTINGS = {
  siteName: "Self Coding",
  siteDescription: "Plataforma de ensino de programação",
  maintenanceMode: false,
  allowRegistration: false, // Padrão mais seguro: desabilitado
  maxUploadSize: 5,
  emailNotifications: true,
  adminEmail: "admin@selfcoding.com",
  backupFrequency: "daily",
  sessionTimeout: 30,
  maxLoginAttempts: 3,
  themeColor: "#3B82F6",
  enableAnalytics: true,
};

// Verificar se é admin e retornar dados do admin
async function verifyAdmin(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession?.value) {
      return null;
    }

    // Verificar token com Firebase Admin
    const auth = getAuth();
    const db = getFirestore();

    try {
      const decodedToken = await auth.verifySessionCookie(adminSession.value);

      // Verificar se admin ainda existe e está ativo
      const adminId = decodedToken.email?.replace(/\./g, "_").replace("@", "_");
      if (!adminId) {
        return null;
      }

      const adminDoc = await db.collection("admins").doc(adminId).get();
      if (!adminDoc.exists) {
        return null;
      }

      const adminData = adminDoc.data();
      if (!adminData?.active) {
        return null;
      }

      return {
        email: decodedToken.email,
        role: adminData.role || "admin",
        id: adminId,
      };
    } catch (error: any) {
      console.error("Erro na verificação do token:", error);
      return null;
    }
  } catch (error: any) {
    console.error("Erro ao verificar admin:", error);
    return null;
  }
}

// GET - Buscar configurações
export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdmin(request);

    if (!adminData) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    } // Buscar configurações do Firestore
    const db = getFirestore();
    const configRef = db.collection("system").doc("settings");
    const configSnap = await configRef.get();

    let settings = DEFAULT_SETTINGS;
    if (configSnap.exists) {
      settings = { ...DEFAULT_SETTINGS, ...configSnap.data() };
    } else {
      // Se não existir, criar com configurações padrão
      await configRef.set(settings);
    }

    // Incluir o email real do admin nas configurações
    const configWithAdminEmail = {
      ...settings,
      adminEmail: adminData.email || settings.adminEmail,
    };

    return NextResponse.json({
      success: true,
      data: configWithAdminEmail,
    });
  } catch (error: any) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações
export async function PUT(request: NextRequest) {
  try {
    const adminData = await verifyAdmin(request);

    if (!adminData) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Dados de configuração não fornecidos" },
        { status: 400 }
      );
    }

    // Validar e sanitizar as configurações
    const validatedSettings = {
      siteName: settings.siteName || DEFAULT_SETTINGS.siteName,
      siteDescription:
        settings.siteDescription || DEFAULT_SETTINGS.siteDescription,
      maintenanceMode: Boolean(settings.maintenanceMode),
      allowRegistration: Boolean(settings.allowRegistration),
      maxUploadSize: Math.max(
        1,
        Math.min(100, Number(settings.maxUploadSize) || 5)
      ),
      emailNotifications: Boolean(settings.emailNotifications),
      adminEmail: settings.adminEmail || DEFAULT_SETTINGS.adminEmail,
      backupFrequency: ["daily", "weekly", "monthly", "manual"].includes(
        settings.backupFrequency
      )
        ? settings.backupFrequency
        : DEFAULT_SETTINGS.backupFrequency,
      sessionTimeout: Math.max(
        5,
        Math.min(480, Number(settings.sessionTimeout) || 30)
      ),
      maxLoginAttempts: Math.max(
        1,
        Math.min(10, Number(settings.maxLoginAttempts) || 3)
      ),
      themeColor: /^#[0-9A-F]{6}$/i.test(settings.themeColor)
        ? settings.themeColor
        : DEFAULT_SETTINGS.themeColor,
      enableAnalytics: Boolean(settings.enableAnalytics),
    }; // Atualizar configurações no Firestore
    const db = getFirestore();
    const configRef = db.collection("system").doc("settings");
    await configRef.set(validatedSettings, { merge: true });

    // Log da ação
    console.log("Configurações atualizadas:", {
      timestamp: new Date().toISOString(),
      settings: validatedSettings,
    });

    return NextResponse.json({
      success: true,
      message: "Configurações atualizadas com sucesso",
      data: validatedSettings,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Resetar configurações para padrão
export async function PATCH(request: NextRequest) {
  try {
    const adminData = await verifyAdmin(request);

    if (!adminData) {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    // Resetar configurações no Firestore
    const db = getFirestore();
    const configRef = db.collection("system").doc("settings");
    await configRef.set(DEFAULT_SETTINGS);

    console.log("Configurações resetadas para padrão:", {
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Configurações resetadas para o padrão",
      data: DEFAULT_SETTINGS,
    });
  } catch (error: any) {
    console.error("Erro ao resetar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
