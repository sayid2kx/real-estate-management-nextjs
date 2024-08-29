// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define the middleware function
export async function middleware(req) {
  // Retrieve the JWT token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Define the URL paths for different roles
  const sellerPaths = ["/seller/login", "/seller/register"];
  const buyerPaths = ["/buyer/login", "/buyer/register"];

  // Get the current URL path
  const url = req.nextUrl.clone();

  // Check if the user is authenticated
  const isAuthenticated = !!token;

  // Check if the user is trying to access restricted pages
  if (isAuthenticated) {
    const userRole = token.role;

    // Restrict access based on role
    if (userRole === "seller") {
      if (sellerPaths.includes(url.pathname)) {
        // Redirect authenticated sellers away from login/register pages
        return NextResponse.redirect(new URL("/seller/dashboard", req.url));
      }
    } else if (userRole === "buyer") {
      if (buyerPaths.includes(url.pathname)) {
        // Redirect authenticated buyers away from login/register pages
        return NextResponse.redirect(new URL("/buyer/dashboard", req.url));
      }
    }
  } else {
    // Redirect unauthenticated users trying to access protected pages
    if (
      url.pathname.startsWith("/seller") &&
      !sellerPaths.includes(url.pathname)
    ) {
      return NextResponse.redirect(new URL("/seller/login", req.url));
    }
    if (
      url.pathname.startsWith("/buyer") &&
      !buyerPaths.includes(url.pathname)
    ) {
      return NextResponse.redirect(new URL("/buyer/login", req.url));
    }
  }

  return NextResponse.next();
}

// Specify the paths to apply middleware
export const config = {
  matcher: ["/seller/:path*", "/buyer/:path*"],
};
