export default async function middleware(req: any, ctx: any) {
  try {
    const { edgeAuth } = await import("@acme/auth/edge");
    return await edgeAuth(req, ctx);
  } catch (error: any) {
    console.error("MIDDLEWARE ERROR:", error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        message: "Middleware Error", 
        error: error.message, 
        stack: error.stack 
      }), 
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
