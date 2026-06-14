import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require a signed-in user — the whole explorer portal
const isProtected = createRouteMatcher(["/explore(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return;

  const { userId } = await auth();

  // Logged out → send to our own sign-in page, remembering the destination.
  // This runs on the server, so editing the URL cannot bypass it.
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
