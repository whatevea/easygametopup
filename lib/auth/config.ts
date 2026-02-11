const ACCESS_TOKEN_COOKIE = "egt_access";
const REFRESH_TOKEN_COOKIE = "egt_refresh";

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export const authConfig = {
  accessTokenCookie: ACCESS_TOKEN_COOKIE,
  refreshTokenCookie: REFRESH_TOKEN_COOKIE,
  accessTokenTtlSeconds: ACCESS_TTL_SECONDS,
  refreshTokenTtlSeconds: REFRESH_TTL_SECONDS,
  jwtIssuer: process.env.APP_NAME ?? "EasyGameTopUp",
  jwtAudience: "easygametopup-users",
  jwtSecret: process.env.JWT_SECRET ?? process.env.SECRET_KEY ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

export function assertAuthEnv(): void {
  if (!authConfig.jwtSecret) {
    throw new Error("Missing JWT_SECRET (or SECRET_KEY) environment variable.");
  }
}
