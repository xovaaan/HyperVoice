import { authenticate, toPublicUser } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if ("response" in auth) return auth.response;
  return Response.json({ user: toPublicUser(auth.user) });
}
