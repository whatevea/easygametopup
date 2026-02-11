import { authConfig } from "@/lib/auth/config";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncodeString(value: string): string {
  return bytesToBase64(encoder.encode(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecodeString(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return decoder.decode(base64ToBytes(padded));
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

let cachedHmacKey: Promise<CryptoKey> | null = null;

async function getHmacKey(): Promise<CryptoKey> {
  if (!cachedHmacKey) {
    cachedHmacKey = crypto.subtle.importKey(
      "raw",
      encoder.encode(authConfig.jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }

  return cachedHmacKey;
}

async function sign(data: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64(new Uint8Array(signature))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function createAccessToken(user: {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + authConfig.accessTokenTtlSeconds,
    iss: authConfig.jwtIssuer,
    aud: authConfig.jwtAudience,
  };

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const headerSegment = base64UrlEncodeString(JSON.stringify(header));
  const payloadSegment = base64UrlEncodeString(JSON.stringify(payload));
  const signatureSegment = await sign(`${headerSegment}.${payloadSegment}`);

  return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  const segments = token.split(".");
  if (segments.length !== 3) {
    return null;
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const signed = `${headerSegment}.${payloadSegment}`;
  const expectedSignature = await sign(signed);

  try {
    if (!constantTimeEquals(signatureSegment, expectedSignature)) {
      return null;
    }

    const parsedHeader = JSON.parse(base64UrlDecodeString(headerSegment));
    if (parsedHeader.alg !== "HS256" || parsedHeader.typ !== "JWT") {
      return null;
    }

    const payload = JSON.parse(base64UrlDecodeString(payloadSegment)) as AccessTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (
      !payload.sub ||
      !payload.email ||
      !payload.role ||
      payload.aud !== authConfig.jwtAudience ||
      payload.iss !== authConfig.jwtIssuer ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
