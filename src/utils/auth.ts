import * as Crypto from "expo-crypto";

export async function hashPassword(password: string) {
  // SHA-256 ile güvenli hash üret
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

export async function verifyPassword(password: string, hash: string) {
  const newHash = await hashPassword(password);
  return newHash === hash;
}
