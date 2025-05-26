import { db } from "@/lib/firebase";
import { AdminSession, AdminUser } from "./types/admin";
import { sign, verify } from "jsonwebtoken";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key";
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hora
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 dias

export class SecureAdminAuth {
  private static instance: SecureAdminAuth;

  private constructor() {}

  static getInstance(): SecureAdminAuth {
    if (!SecureAdminAuth.instance) {
      SecureAdminAuth.instance = new SecureAdminAuth();
    }
    return SecureAdminAuth.instance;
  }

  async loginAdmin(email: string, password: string): Promise<boolean> {
    try {
      // Verificar credenciais no Firebase Auth
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Verificar se é admin no Firestore
      const adminId = email.replace(/\./g, "_").replace("@", "_");
      const adminRef = doc(db, "admins", adminId);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        throw new Error("Usuário não é administrador");
      }

      const adminData = adminSnap.data() as AdminUser;

      if (!adminData.active) {
        throw new Error("Conta administrativa desativada");
      }

      // Gerar tokens
      const accessToken = this.generateAccessToken(adminData);
      const refreshToken = this.generateRefreshToken(adminData);

      // Atualizar último login
      await updateDoc(adminRef, {
        lastLogin: new Date(),
        updatedAt: new Date(),
      });

      // Salvar tokens em cookies HttpOnly
      this.setTokenCookies(accessToken, refreshToken);

      return true;
    } catch (error) {
      console.error("Erro no login admin:", error);
      throw error;
    }
  }

  private generateAccessToken(user: AdminUser): string {
    return sign(
      {
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  private generateRefreshToken(user: AdminUser): string {
    return sign({ email: user.email }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  private setTokenCookies(accessToken: string, refreshToken: string) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    cookies().set("admin_access_token", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });

    cookies().set("admin_refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });
  }

  async verifyAdmin(): Promise<boolean> {
    try {
      const accessToken = cookies().get("admin_access_token")?.value;

      if (!accessToken) {
        return false;
      }

      try {
        const decoded = verify(accessToken, JWT_SECRET);
        return true;
      } catch (error) {
        // Token expirado, tentar refresh
        return await this.refreshAccess();
      }
    } catch (error) {
      console.error("Erro na verificação admin:", error);
      return false;
    }
  }

  private async refreshAccess(): Promise<boolean> {
    try {
      const refreshToken = cookies().get("admin_refresh_token")?.value;

      if (!refreshToken) {
        return false;
      }

      const decoded = verify(refreshToken, JWT_SECRET) as { email: string };

      // Verificar admin no Firestore
      const adminId = decoded.email.replace(/\./g, "_").replace("@", "_");
      const adminSnap = await getDoc(doc(db, "admins", adminId));

      if (!adminSnap.exists()) {
        return false;
      }

      const adminData = adminSnap.data() as AdminUser;

      // Gerar novo access token
      const newAccessToken = this.generateAccessToken(adminData);

      // Atualizar cookie
      this.setTokenCookies(newAccessToken, refreshToken);

      return true;
    } catch (error) {
      console.error("Erro no refresh do token:", error);
      return false;
    }
  }

  async checkPermission(permission: string): Promise<boolean> {
    try {
      const accessToken = cookies().get("admin_access_token")?.value;

      if (!accessToken) {
        return false;
      }

      const decoded = verify(accessToken, JWT_SECRET) as {
        permissions: string[];
      };
      return decoded.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  }

  logout() {
    cookies().delete("admin_access_token");
    cookies().delete("admin_refresh_token");
  }
}

export const secureAdminAuth = SecureAdminAuth.getInstance();

// Funções de conveniência
export const loginSecureAdmin = (email: string, password: string) =>
  secureAdminAuth.loginAdmin(email, password);
export const verifySecureAdmin = () => secureAdminAuth.verifyAdmin();
export const checkAdminPermission = (permission: string) =>
  secureAdminAuth.checkPermission(permission);
export const logoutSecureAdmin = () => secureAdminAuth.logout();
