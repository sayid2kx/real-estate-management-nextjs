import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const sellerPaths = ['/seller/login', '/seller/register']
  const buyerPaths = ['/buyer/login', '/buyer/register']

  const url = req.nextUrl.clone()
  const isLoggingOut = url.searchParams.get('loggingOut') === 'true'

  const isAuthenticated = !!token

  if (isAuthenticated) {
    const userRole = token.role

    if (userRole === 'seller') {
      if (sellerPaths.includes(url.pathname)) {
        return NextResponse.redirect(new URL('/seller/dashboard', req.url))
      }
    } else if (userRole === 'buyer') {
      if (buyerPaths.includes(url.pathname)) {
        return NextResponse.redirect(new URL('/buyer/dashboard', req.url))
      }
    }
  } else {
    if (
      isLoggingOut &&
      (url.pathname.startsWith('/seller') || url.pathname.startsWith('/buyer'))
    ) {
      return NextResponse.next()
    }

    if (
      url.pathname.startsWith('/seller') &&
      !sellerPaths.includes(url.pathname)
    ) {
      return NextResponse.redirect(new URL('/seller/login', req.url))
    }
    if (
      url.pathname.startsWith('/buyer') &&
      !buyerPaths.includes(url.pathname)
    ) {
      return NextResponse.redirect(new URL('/buyer/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/seller/:path*', '/buyer/:path*'],
}
