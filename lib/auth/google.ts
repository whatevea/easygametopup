import { authConfig } from "@/lib/auth/config";

export type GoogleIdentity = {
  sub: string;
  email: string;
  email_verified: boolean | string;
  name?: string;
  picture?: string;
  aud: string;
  exp: string;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity | null> {
  const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;

  try {
    const response = await fetch(tokenInfoUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GoogleIdentity;

    if (payload.aud !== authConfig.googleClientId) {
      return null;
    }

    if (!payload.email || !payload.sub) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
