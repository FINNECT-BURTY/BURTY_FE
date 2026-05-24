import { AuthCallbackClient } from "@/app/auth/callback/AuthCallbackClient";

type CallbackSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: CallbackSearchParams;
}>) {
  const params = await searchParams;

  return (
    <AuthCallbackClient
      code={getSearchParamValue(params.code)}
      error={getSearchParamValue(params.error)}
      newUser={getSearchParamValue(params.newUser)}
      profileComplete={getSearchParamValue(params.profileComplete)}
    />
  );
}
