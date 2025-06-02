import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/dashboard", "/auth"],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Para rotas do dashboard e autenticação, verificar modo de manutenção
  if (pathname.startsWith("/dashboard") || pathname === "/auth") {
    try {
      // Verificar se o sistema está em modo de manutenção
      const response = await fetch(new URL("/api/auth/settings", request.url));
      const data = await response.json();

      if (data.maintenanceMode) {
        console.log(
          "Sistema em manutenção, redirecionando para página de manutenção"
        );
        return NextResponse.redirect(
          new URL("/site-em-manutencao", request.url)
        );
      }

      // Se não estiver em manutenção, continuar normalmente
      return NextResponse.next();
    } catch (error) {
      console.error("Erro ao verificar modo de manutenção:", error);
      // Em caso de erro, permitir acesso para não bloquear usuários
      return NextResponse.next();
    }
  }

  // Para rotas de admin, verificar autenticação
  const adminSession = request.cookies.get("admin_session");

  // Se não houver sessão, redirecionar para login
  if (!adminSession?.value) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  try {
    // Verificar se o token é válido chamando a API
    const response = await fetch(
      new URL("/api/admin/auth/verify", request.url),
      {
        headers: {
          Cookie: `admin_session=${adminSession.value}`,
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      const redirectResponse = NextResponse.redirect(
        new URL("/admin-login", request.url)
      );
      redirectResponse.cookies.delete("admin_session");

      // Adicionar mensagem de erro à URL
      const searchParams = new URLSearchParams();

      if (response.status === 440) {
        searchParams.set(
          "error",
          "Sua sessão expirou. Por favor, faça login novamente."
        );
      } else if (data.error) {
        searchParams.set("error", data.error);
      } else {
        searchParams.set("error", "Erro de autenticação.");
      }

      return NextResponse.redirect(
        new URL(`/admin-login?${searchParams.toString()}`, request.url)
      );
    }

    // Token válido, continuar
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-role", data.role || "admin");
    requestHeaders.set(
      "x-admin-permissions",
      JSON.stringify(data.permissions || [])
    );

    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return nextResponse;
  } catch (error) {
    // Erro na verificação, redirecionar para login
    console.error("Erro na verificação do token:", error);
    const redirectResponse = NextResponse.redirect(
      new URL("/admin-login?error=Erro+de+autenticação", request.url)
    );
    redirectResponse.cookies.delete("admin_session");
    return redirectResponse;
  }
}
