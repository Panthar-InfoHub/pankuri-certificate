import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// 1. Wrap 'auth' to inject custom logic
export const proxy = auth(async (req) => {
    const session = await auth().catch(() => null);
    const isLoggedIn = !!session?.user;
    const { pathname } = req.nextUrl
    console.log("Middleware auth check ==> ", { isLoggedIn, pathname })

    // 2. Define your protected routes here
    const protectedRoutes = ["/video-upload", "/dcf"]
    const isProtected = protectedRoutes.find((route) => pathname.startsWith(route))

    // 3. Logic: If protected & no token, redirect. Otherwise, forward.
    if (isProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    ],
}
