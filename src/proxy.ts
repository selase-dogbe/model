import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_PATHS = ["/dashboard", "/customers", "/orders", "/routes"];
const DRIVER_PATHS = ["/driver"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role === "DRIVER") {
    return NextResponse.redirect(new URL("/driver", req.nextUrl.origin));
  }

  if (DRIVER_PATHS.some((p) => pathname.startsWith(p)) && role !== "DRIVER") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/customers/:path*", "/orders/:path*", "/routes/:path*", "/driver/:path*"],
};
