const LOOPBACK_ORIGIN =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export function configuredCorsOrigins(
  value = process.env.CORS_ORIGINS,
): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean),
  );
}

export function isAllowedCorsOrigin(
  origin: string | undefined,
  configuredOrigins = configuredCorsOrigins(),
): boolean {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/$/, '');
  return (
    LOOPBACK_ORIGIN.test(normalizedOrigin) ||
    configuredOrigins.has(normalizedOrigin)
  );
}

export function corsOrigin(
  origin: string | undefined,
  callback: (error: Error | null, allowed?: boolean) => void,
): void {
  if (isAllowedCorsOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
}
