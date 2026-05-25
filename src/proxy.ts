import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/login", "/portal/login", "/portal/signup"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/bootstrap-admin") ||
    pathname.startsWith("/api/seed-demo") ||
    pathname.startsWith("/verificar/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(svg|png|jpg|jpeg|webp|ico|css|js|map)$/i.test(pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userType = token?.type as "LAB" | "CLIENT" | undefined;
  const isPortalRoute = pathname.startsWith("/portal");

  // Não logado tentando rota protegida → manda pro login certo.
  if (!isPublic && !token) {
    const url = req.nextUrl.clone();
    url.pathname = isPortalRoute ? "/portal/login" : "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Logado tentando entrar em tela de login → manda pro dashboard correto.
  if (token) {
    if (pathname === "/login" && userType === "LAB") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (pathname === "/login" && userType === "CLIENT") {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if ((pathname === "/portal/login" || pathname === "/portal/signup") && userType === "CLIENT") {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if ((pathname === "/portal/login" || pathname === "/portal/signup") && userType === "LAB") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Cross-area: LAB tentando /portal/* (que não login) ou CLIENT tentando /app/*.
    if (isPortalRoute && userType === "LAB") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (!isPortalRoute && !isPublic && userType === "CLIENT") {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
