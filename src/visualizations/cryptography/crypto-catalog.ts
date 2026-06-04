import { createPlaceholderModule } from "@/visualizations/placeholder";

// Symmetric Encryption
export const aesModule = createPlaceholderModule(
  "aes", "aes", "AES Encryption",
  ["cryptography", "symmetric"], "advanced",
);
export const desModule = createPlaceholderModule(
  "des", "des", "DES Encryption",
  ["cryptography", "symmetric"], "advanced",
);
export const xorCipherModule = createPlaceholderModule(
  "xor-cipher", "xor-cipher", "XOR Cipher",
  ["cryptography", "symmetric"], "beginner",
);
export const streamCipherModule = createPlaceholderModule(
  "stream-cipher", "stream-cipher", "Stream Cipher",
  ["cryptography", "symmetric"], "intermediate",
);

// Asymmetric Encryption
export const rsaModule = createPlaceholderModule(
  "rsa", "rsa", "RSA",
  ["cryptography", "asymmetric"], "advanced",
);
export const diffieHellmanModule = createPlaceholderModule(
  "diffie-hellman", "diffie-hellman", "Diffie-Hellman Key Exchange",
  ["cryptography", "asymmetric"], "intermediate",
);
export const ecdhModule = createPlaceholderModule(
  "ecdh", "ecdh", "ECDH",
  ["cryptography", "asymmetric"], "advanced",
);
export const elgamalModule = createPlaceholderModule(
  "elgamal", "elgamal", "ElGamal",
  ["cryptography", "asymmetric"], "advanced",
);

// Hash Functions
export const sha256Module = createPlaceholderModule(
  "sha-256", "sha-256", "SHA-256",
  ["cryptography", "hash-functions"], "intermediate",
);
export const merkleCryptoModule = createPlaceholderModule(
  "merkle-tree-crypto", "merkle-tree-crypto", "Merkle Tree",
  ["cryptography", "hash-functions"], "intermediate",
);
export const hmacModule = createPlaceholderModule(
  "hmac", "hmac", "HMAC",
  ["cryptography", "hash-functions"], "intermediate",
);
export const bcryptModule = createPlaceholderModule(
  "bcrypt", "bcrypt", "Bcrypt",
  ["cryptography", "hash-functions"], "intermediate",
);

// Protocols
export const tlsProtocolModule = createPlaceholderModule(
  "tls-protocol", "tls-protocol", "TLS Protocol",
  ["cryptography", "protocols"], "advanced",
);
export const pgpModule = createPlaceholderModule(
  "pgp", "pgp", "PGP",
  ["cryptography", "protocols"], "advanced",
);
export const kerberosModule = createPlaceholderModule(
  "kerberos", "kerberos", "Kerberos",
  ["cryptography", "protocols"], "advanced",
);
