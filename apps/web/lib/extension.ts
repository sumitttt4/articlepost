type ExtensionReply = { substackConnected?: boolean; mediumConnected?: boolean; error?: string; success?: boolean };
type Runtime = { sendMessage: (id: string, message: unknown, callback: (reply?: ExtensionReply) => void) => void; lastError?: { message?: string } };
export async function checkExtension(): Promise<ExtensionReply> {
 const runtime = (window as unknown as { chrome?: { runtime?: Runtime } }).chrome?.runtime;
 const id = process.env.NEXT_PUBLIC_EXTENSION_ID;
 if (!runtime || !id) throw new Error("Load the unpacked extension, then set NEXT_PUBLIC_EXTENSION_ID in apps/web/.env.local.");
 return new Promise((resolve,reject) => {
  const timeout = setTimeout(()=>reject(new Error("Extension did not respond. Check it is enabled.")), 6000);
  runtime.sendMessage(id,{action:"CHECK_CONNECTIONS"},reply=>{ clearTimeout(timeout); if (runtime.lastError) reject(new Error(runtime.lastError.message || "Extension unavailable")); else if (reply?.error) reject(new Error(reply.error)); else if (!reply) reject(new Error("Extension returned no connection status")); else resolve(reply); });
 });
}
