import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Define protected paths
  const isProtectedPath = path.startsWith("/dashboard") || path.startsWith("/interview");
  // Define auth paths
  const isAuthPath = path === "/login" || path === "/register";

  if (isProtectedPath && !token) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL("/login", request.url);
    // Remember original destination
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && token) {
    // Redirect logged-in users to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Matching Paths config
export const config = {
  matcher: ["/dashboard/:path*", "/interview/:path*", "/login", "/register"],
};
