import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// const protectedRoutes = ['/chat'];
// const publicRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
//   const currentUser = request.cookies.get('auth-storage')?.value; // To check again
//   const path = request.nextUrl.pathname;

//   console.log('currentUser', currentUser);

//   const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
//   const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
    
//   if (isProtectedRoute && !currentUser) {
//     console.log('No session token, redirecting to login.');
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   if (isPublicRoute && currentUser) {
//     return NextResponse.redirect(new URL('/chat', request.url));
//   }

//   if (path === '/') {
//     if (!currentUser) {
//       return NextResponse.redirect(new URL('/login', request.url));
//     } else {
//       return NextResponse.redirect(new URL('/chat', request.url));
//     }
//   }

  return NextResponse.next();
}

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// }; 