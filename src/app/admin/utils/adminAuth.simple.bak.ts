import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Lista de emails de admin (mais simples para começar)
const ADMIN_EMAILS = [
  "danilospineli@gmail.com", // Seu email principal
  "dennisemannuel93@gmail.com", // Admin encontrado no Firestore
  "admin@exemplo.com"
];

interface AdminSession {
  email: string;
  isAuthenticated: boolean;
  timestamp: number;
}

class SimpleAdminAuth {
  private session: AdminSession | null = null;

  constructor() {
    this.loadSession();
  }
  // Verificar se email é admin
  isAdminEmail(email: string): boolean {
    console.log(`🔍 Verificando se ${email} é um email admin...`);
    console.log(`📋 Lista de emails admin:`, ADMIN_EMAILS);
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    console.log(`🎯 Resultado: ${isAdmin ? 'É admin' : 'Não é admin'}`);
    return isAdmin;
  }

  // Login de admin
  async loginAdmin(email: string, password: string): Promise<void> {
    try {
      console.log("🔐 Fazendo login para:", email);

      // Verificar se é email de admin
      if (!this.isAdminEmail(email)) {
        throw new Error("Usuário não é administrador");
      }      // Fazer login no Firebase
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login Firebase bem-sucedido");

      // Criar sessão admin
      this.session = {
        email: email,
        isAuthenticated: true,
        timestamp: Date.now()
      };

      // Salvar sessão
      this.saveSession();
      console.log("✅ Sessão admin criada");
    } catch (error) {
      console.error("❌ Erro no login admin:", error);
      throw error;
    }
  }
  // Verificar se está autenticado como admin
  isAuthenticated(): boolean {
    console.log(`🔐 Verificando autenticação admin...`);
    
    if (!this.session) {
      console.log(`❌ Sem sessão admin disponível`);
      return false;
    }

    console.log(`👤 Sessão encontrada para:`, this.session.email);
    
    // Verificar se a sessão não expirou (8 horas)
    const now = Date.now();
    const maxAge = 8 * 60 * 60 * 1000; // 8 horas
    const sessionAge = now - this.session.timestamp;
    
    if (sessionAge > maxAge) {
      console.log(`⏰ Sessão expirada (${Math.round(sessionAge / 60000)} minutos), fazendo logout...`);
      this.logout();
      return false;
    }

    console.log(`✅ Sessão válida (criada há ${Math.round(sessionAge / 60000)} minutos)`);
    return this.session.isAuthenticated;
  }

  // Obter dados da sessão
  getSession(): AdminSession | null {
    return this.session;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Fazer logout do Firebase
      await signOut(auth);
      
      // Limpar sessão local
      this.session = null;
      localStorage.removeItem("adminSession");
      
      console.log("✅ Logout admin bem-sucedido");
    } catch (error) {
      console.error("❌ Erro no logout:", error);
    }
  }
  // Salvar sessão no localStorage
  private saveSession(): void {
    if (this.session) {
      console.log(`💾 Salvando sessão admin para:`, this.session.email);
      try {
        localStorage.setItem("adminSession", JSON.stringify(this.session));
        console.log(`✅ Sessão admin salva com sucesso!`);
      } catch (error) {
        console.error(`❌ Erro ao salvar sessão:`, error);
      }
    }
  }

  // Carregar sessão do localStorage  private loadSession(): void {
    // Verificar se estamos no navegador (não no servidor)
    if (typeof window === 'undefined') {
      console.log('⚠️ Executando no servidor, ignorando localStorage');
      return;
    }
    
    try {
      console.log(`🔍 Tentando carregar sessão admin do localStorage...`);
      const stored = localStorage.getItem("adminSession");
      
      if (stored) {
        console.log(`📦 Dados encontrados no localStorage`);
        this.session = JSON.parse(stored);
        console.log(`👤 Sessão admin carregada para:`, this.session?.email);
        
        // Verificar se a sessão não expirou
        const now = Date.now();
        const maxAge = 8 * 60 * 60 * 1000; // 8 horas
        
        if (now - this.session.timestamp > maxAge) {
          console.log(`⏰ Sessão expirada (${Math.round((now - this.session.timestamp) / 60000)} minutos), removendo...`);
          localStorage.removeItem("adminSession");
          this.session = null;
        } else {
          console.log(`✅ Sessão válida (criada há ${Math.round((now - this.session.timestamp) / 60000)} minutos)`);
        }
      } else {
        console.log(`❌ Nenhuma sessão encontrada no localStorage`);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar sessão:`, error);
      localStorage.removeItem("adminSession");
    }
  }
}

// Instância singleton
const simpleAdminAuth = new SimpleAdminAuth();

export { simpleAdminAuth };
export default simpleAdminAuth;
