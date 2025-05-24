// Utilitário para autenticação administrativa separada
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Interface para sessão admin
interface AdminSession {
  email: string;
  token: string;
  expiresAt: number;
}

// Classe para gerenciar autenticação administrativa
class AdminAuth {
  private static instance: AdminAuth;
  private adminSession: AdminSession | null = null;

  constructor() {
    // Restaurar sessão admin do localStorage na inicialização
    this.restoreSession();
  }

  static getInstance(): AdminAuth {
    if (!AdminAuth.instance) {
      AdminAuth.instance = new AdminAuth();
    }
    return AdminAuth.instance;
  }

  // Verificar se email é admin
  async checkAdminStatus(email: string): Promise<boolean> {
    try {
      const adminId = email.replace(/\./g, "_").replace("@", "_");
      const adminRef = doc(db, "admins", adminId);
      const adminSnap = await getDoc(adminRef);
      return adminSnap.exists();
    } catch (error) {
      console.error("Erro ao verificar status de admin:", error);
      return false;
    }
  }
  // Login específico para admin (verifica credenciais sem afetar sessão principal)
  async loginAdmin(email: string, password: string): Promise<boolean> {
    try {
      // Criar uma instância Firebase temporária para verificação
      const { initializeApp } = await import("firebase/app");
      const { getAuth, signInWithEmailAndPassword, signOut } = await import(
        "firebase/auth"
      );

      // Configuração do Firebase (mesma configuração)
      const firebaseConfig = {
        apiKey: "AIzaSyATDE21wBLKPqLcAXKzIQti9vvYAT3gZPM",
        authDomain: "barbearia-bd25e.firebaseapp.com",
        projectId: "barbearia-bd25e",
        storageBucket: "barbearia-bd25e.appspot.com",
        messagingSenderId: "1079641275104",
        appId: "1:1079641275104:web:e166f6912943c96bee6e85",
        measurementId: "G-0MM4VLLQJR",
      };

      // Criar uma app temporária para verificação
      const tempApp = initializeApp(
        firebaseConfig,
        `admin-verify-${Date.now()}`
      );
      const tempAuth = getAuth(tempApp);
      // Fazer login temporário para verificar credenciais
      await signInWithEmailAndPassword(tempAuth, email, password);

      // Verificar se é admin
      const isAdmin = await this.checkAdminStatus(email);

      if (!isAdmin) {
        // Fazer logout da instância temporária
        await signOut(tempAuth);
        // Limpar a app temporária
        try {
          const { deleteApp } = await import("firebase/app");
          await deleteApp(tempApp);
        } catch (e) {
          console.warn("Não foi possível deletar app temporária:", e);
        }
        throw new Error("Usuário não é administrador");
      }

      // Fazer logout da instância temporária
      await signOut(tempAuth);
      // Limpar a app temporária
      try {
        const { deleteApp } = await import("firebase/app");
        await deleteApp(tempApp);
      } catch (e) {
        console.warn("Não foi possível deletar app temporária:", e);
      }

      // Criar sessão admin independente
      const token = this.generateAdminToken(email);
      const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 horas

      this.adminSession = {
        email,
        token,
        expiresAt,
      };

      // Salvar no localStorage
      localStorage.setItem("adminSession", JSON.stringify(this.adminSession));

      return true;
    } catch (error) {
      console.error("Erro no login admin:", error);
      throw error;
    }
  }

  // Gerar token simples para sessão admin
  private generateAdminToken(email: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${email}:${timestamp}:${random}`);
  }

  // Verificar se admin está autenticado
  isAdminAuthenticated(): boolean {
    if (!this.adminSession) {
      return false;
    }

    // Verificar se a sessão expirou
    if (Date.now() > this.adminSession.expiresAt) {
      this.logoutAdmin();
      return false;
    }

    return true;
  }

  // Obter dados da sessão admin
  getAdminSession(): AdminSession | null {
    return this.adminSession;
  }

  // Logout admin (apenas remove a sessão administrativa)
  logoutAdmin(): void {
    this.adminSession = null;
    localStorage.removeItem("adminSession");
  }

  // Restaurar sessão do localStorage
  private restoreSession(): void {
    try {
      const stored = localStorage.getItem("adminSession");
      if (stored) {
        const session = JSON.parse(stored) as AdminSession;

        // Verificar se não expirou
        if (Date.now() <= session.expiresAt) {
          this.adminSession = session;
        } else {
          localStorage.removeItem("adminSession");
        }
      }
    } catch (error) {
      console.error("Erro ao restaurar sessão admin:", error);
      localStorage.removeItem("adminSession");
    }
  }

  // Renovar sessão admin
  renewSession(): void {
    if (this.adminSession) {
      this.adminSession.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
      localStorage.setItem("adminSession", JSON.stringify(this.adminSession));
    }
  }
}

// Exportar instância singleton
export const adminAuth = AdminAuth.getInstance();

// Funções de conveniência
export const checkAdminStatus = (email: string) =>
  adminAuth.checkAdminStatus(email);
export const loginAdmin = (email: string, password: string) =>
  adminAuth.loginAdmin(email, password);
export const isAdminAuthenticated = () => adminAuth.isAdminAuthenticated();
export const getAdminSession = () => adminAuth.getAdminSession();
export const logoutAdmin = () => adminAuth.logoutAdmin();
export const renewAdminSession = () => adminAuth.renewSession();
