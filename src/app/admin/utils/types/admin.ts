export interface AdminUser {
  email: string;
  role: "admin" | "super_admin";
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  twoFactorEnabled: boolean;
}

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AdminUser;
}
