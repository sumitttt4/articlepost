import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const isProtected = createRouteMatcher(["/api/(.*)"]);
export default process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 ? clerkMiddleware(async (auth, request) => { if (isProtected(request)) await auth.protect(); })
 : function middleware() { return NextResponse.next(); };
export const config = { matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)", "/api/(.*)"] };
