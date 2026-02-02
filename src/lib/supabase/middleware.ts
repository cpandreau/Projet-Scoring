import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/produit',
  '/tarifs',
  '/dirigeants',
  '/experts-comptables',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/mentions-legales',
  '/cgu',
  '/confidentialite',
  // Legacy routes (will redirect)
  '/signup',
  '/login',
]

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/enterprise']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || (route !== '/' && pathname.startsWith(route))
  )

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Redirect to connexion if not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages to dashboard
  const authPages = ['/login', '/signup', '/connexion', '/inscription', '/mot-de-passe-oublie']
  if (user && authPages.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
