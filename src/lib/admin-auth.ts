const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded =
    base64 +
    '='.repeat(
      (4 - (base64.length % 4)) % 4
    );

  return atob(padded);
}

async function sign(
  payload: string,
  secret: string
) {
  const key =
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

  const signature =
    await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

  return toBase64Url(
    new Uint8Array(signature)
  );
}

export async function createAdminSession() {
  const username =
    process.env.ADMIN_USERNAME;

  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (!username || !secret) {
    throw new Error(
      'Admin auth environment variables are missing'
    );
  }

  const expiresAt =
    Date.now() +
    8 * 60 * 60 * 1000;

  const payload =
    `${username}:${expiresAt}`;

  const encoded =
    toBase64Url(
      encoder.encode(payload)
    );

  const signature =
    await sign(
      encoded,
      secret
    );

  return `${encoded}.${signature}`;
}

export async function verifyAdminSession(
  token: string | undefined
) {
  if (!token) return false;

  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (!secret) return false;

  const parts = token.split('.');

  if (parts.length !== 2) {
    return false;
  }

  const [
    encodedPayload,
    providedSignature,
  ] = parts;

  const expectedSignature =
    await sign(
      encodedPayload,
      secret
    );

  if (
    expectedSignature !==
    providedSignature
  ) {
    return false;
  }

  try {
    const decoded =
      fromBase64Url(
        encodedPayload
      );

    const separator =
      decoded.lastIndexOf(':');

    if (separator === -1) {
      return false;
    }

    const expiresAt = Number(
      decoded.slice(separator + 1)
    );

    return (
      Number.isFinite(expiresAt) &&
      Date.now() < expiresAt
    );
  } catch {
    return false;
  }
}