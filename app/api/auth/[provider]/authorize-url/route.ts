import { handleSocialAuthorizeUrlRequest } from "@/shared/api/socialAuth";

export async function GET(
  request: Request,
  context: RouteContext<"/api/auth/[provider]/authorize-url">,
) {
  const { provider } = await context.params;
  return handleSocialAuthorizeUrlRequest(request, provider);
}
