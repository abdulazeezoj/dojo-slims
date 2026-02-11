  export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeServer } = await import("./lib/server-init");
    
    await initializeServer();
  }
}
