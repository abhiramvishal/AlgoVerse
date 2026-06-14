import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}
function bits(stepNumber: number, description: string, lines: number[], number: number, activeBits: number[], label: string, result: number, vars: Record<string,unknown>): AnimationStep {
  const b = number.toString(2).padStart(8,"0").split("").map(Number);
  return { stepNumber, description, highlightLines: lines, visualState: { type: "bits", number, bits: b, activeBits, label, result }, variables: vars };
}

// ─── XOR Cipher ──────────────────────────────────────────────────────────────
export const xorCipherModule: VisualizationModule<{plaintext:string,key:string}> = {
  id: "xor-cipher", slug: "xor-cipher", title: "XOR Cipher",
  category: ["cryptography"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Encrypts each plaintext byte by XOR-ing with a repeating key byte.",
  relatedTopics: [],
  pythonCode: `def xor_cipher(plaintext: str, key: str) -> bytes:
    key_bytes = key.encode()
    result = []
    for i, ch in enumerate(plaintext.encode()):
        result.append(ch ^ key_bytes[i % len(key_bytes)])
    return bytes(result)

def xor_decrypt(ciphertext: bytes, key: str) -> str:
    # XOR is its own inverse!
    return xor_cipher(ciphertext.decode('latin-1'), key).decode()

# Example
pt = "HELLO"
key = "KEY"
ct = xor_cipher(pt, key)
print([hex(b) for b in ct])
pt2 = xor_decrypt(ct.decode('latin-1'), key)`,
  codeSteps: [
    { stepNumber: 1, highlightLines: [1] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 8, highlightLines: [8] },
  ],
  defaultInput: {plaintext: "HELLO", key: "KEY"},
  generateSteps({plaintext, key}) {
    const steps: AnimationStep[] = [];
    const p = plaintext.slice(0,5).split("");
    const k = key.split("");
    steps.push(arr(1,"Plaintext and key bytes",[1,2],p.map(c=>({val:c,state:"active"})),"Plaintext",{}));
    steps.push(arr(2,"Key bytes (cyclic)",[3],p.map((_,i)=>({val:k[i%k.length],state:"computed"})),"Key (cyclic)",{}));
    const ct = p.map((c,i)=>(c.charCodeAt(0)^k[i%k.length].charCodeAt(0)));
    steps.push(arr(3,"XOR each character with key byte",[4],ct.map(v=>({val:`0x${v.toString(16).toUpperCase()}`,state:"highlighted"})),"Ciphertext (hex)",{op:"XOR"}));
    steps.push(arr(4,"Decrypt: XOR ciphertext with same key",[8],p.map(c=>({val:c,state:"highlighted"})),"Decrypted",{selfInverse:true}));
    return steps;
  }
};

// ─── Stream Cipher ────────────────────────────────────────────────────────────
export const streamCipherModule: VisualizationModule<{key:number,nonce:number}> = {
  id: "stream-cipher", slug: "stream-cipher", title: "Stream Cipher (ChaCha20)",
  category: ["cryptography"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "Generates a pseudorandom keystream from key+nonce, XOR-ed with plaintext.",
  relatedTopics: [],
  pythonCode: `def quarter_round(a, b, c, d):
    a = (a + b) & 0xFFFFFFFF; d ^= a; d = rotate(d, 16)
    c = (c + d) & 0xFFFFFFFF; b ^= c; b = rotate(b, 12)
    a = (a + b) & 0xFFFFFFFF; d ^= a; d = rotate(d,  8)
    c = (c + d) & 0xFFFFFFFF; b ^= c; b = rotate(b,  7)
    return a, b, c, d

def chacha20_block(key, nonce, counter):
    state = constants + key + [counter, nonce]
    working = list(state)
    for _ in range(10):  # 20 rounds = 10 double-rounds
        # Column rounds
        working = quarter_round(*working[0,4,8,12])
        # Diagonal rounds
        working = quarter_round(*working[1,5,9,13])
    return [(s + w) & 0xFFFFFFFF for s, w in zip(state, working)]`,
  codeSteps: [
    { stepNumber: 1, highlightLines: [1] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: {key: 0xAB, nonce: 0x01},
  generateSteps({key, nonce}) {
    const steps: AnimationStep[] = [];
    const hex = (n: number) => `0x${(n >>> 0).toString(16).toUpperCase().padStart(2, "0").slice(-2)}`;
    const rotl = (v: number, c: number) => ((v << c) | (v >>> (8 - c))) & 0xff;

    // Build a 16-word state from constants + key + counter + nonce, derived
    // from the actual key/nonce input (8-bit simplified for visualization).
    const consts = [0x61, 0x6e, 0x64, 0x32]; // "and2" — ChaCha "expand 32-byte k" stand-in
    const k = (key >>> 0) & 0xff;
    const no = (nonce >>> 0) & 0xff;
    let state = [
      ...consts,
      k, (k + 1) & 0xff, (k ^ 0x55) & 0xff, (k + 0x10) & 0xff,
      (k ^ 0x0f) & 0xff, (k + 0x20) & 0xff, (k ^ 0xaa) & 0xff, (k + 0x30) & 0xff,
      0x00, no, (no ^ 0x33) & 0xff, (no + 0x40) & 0xff,
    ];
    const cells = (s: number[], states: string[]) => s.map((v, i) => ({ val: hex(v), state: states[i] || "default" }));

    steps.push(arr(1, `Initialize 4×4 state from key=${hex(k)}, nonce=${hex(no)}.`, [8,9],
      cells(state, state.map((_,i)=> i<4 ? "computed" : i>=12 ? "highlighted" : "active")),
      "State (consts | key | counter | nonce)", { key: hex(k), nonce: hex(no) }));

    // One ChaCha quarter-round on a column (indices 0,4,8,12), derived from state
    const qr = (s: number[], a:number,b:number,c:number,d:number) => {
      s[a]=(s[a]+s[b])&0xff; s[d]=rotl(s[d]^s[a],4);
      s[c]=(s[c]+s[d])&0xff; s[b]=rotl(s[b]^s[c],3);
      s[a]=(s[a]+s[b])&0xff; s[d]=rotl(s[d]^s[a],2);
      s[c]=(s[c]+s[d])&0xff; s[b]=rotl(s[b]^s[c],1);
      return s;
    };

    state = qr([...state], 0,4,8,12);
    steps.push(arr(2, "Column round: quarter_round(0,4,8,12) mixes the first column.", [11,12,13,14,15],
      cells(state, state.map((_,i)=> [0,4,8,12].includes(i) ? "active" : "default")),
      "After column round", { round: 1 }));

    state = qr([...state], 0,5,10,15);
    steps.push(arr(3, "Diagonal round: quarter_round(0,5,10,15) mixes a diagonal.", [12],
      cells(state, state.map((_,i)=> [0,5,10,15].includes(i) ? "active" : "default")),
      "After diagonal round", { round: 2 }));

    // Many rounds (apply a few more mixes) then mark complete
    for (let r = 0; r < 4; r++) { state = qr(state, 1,5,9,13); state = qr(state, 2,6,10,14); }
    steps.push(arr(4, "After 20 rounds (10 double-rounds): keystream block ready.", [10],
      cells(state, state.map(()=> "computed")), "Keystream block", { rounds: 20 }));

    // Keystream = first 8 bytes; show they depend on key/nonce
    const ks = state.slice(0, 8);
    steps.push(arr(5, "XOR keystream bytes with plaintext → ciphertext.", [16],
      cells(ks, ks.map(()=> "highlighted")), "Keystream (first 8 bytes)",
      { keystream: ks.map(hex).join(" "), op: "XOR" }));
    return steps;
  }
};

// ─── AES ─────────────────────────────────────────────────────────────────────
export const aesModule: VisualizationModule<string> = {
  id: "aes", slug: "aes", title: "AES Encryption",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "AES-128: 10 rounds of SubBytes, ShiftRows, MixColumns, AddRoundKey.",
  relatedTopics: [],
  pythonCode: `from Crypto.Cipher import AES
import os

def aes_encrypt(plaintext: bytes, key: bytes) -> bytes:
    # Pad to block size (16 bytes)
    pad_len = 16 - len(plaintext) % 16
    plaintext += bytes([pad_len] * pad_len)   # PKCS7 padding
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return iv + cipher.encrypt(plaintext)

# AES round function steps:
def aes_round(state, round_key):
    state = sub_bytes(state)      # S-box substitution
    state = shift_rows(state)     # Row rotation
    state = mix_columns(state)    # GF(2^8) mixing
    state = add_round_key(state, round_key)
    return state`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 15, highlightLines: [15] },
  ],
  defaultInput: "HELLO WORLD!!!!",
  generateSteps(pt) {
    const steps: AnimationStep[] = [];
    const block = pt.padEnd(16,"_").slice(0,16).split("").map(c=>({val:c,state:"default" as string}));
    steps.push(arr(1,"Plaintext block (16 bytes) + AddRoundKey with key0",[6,7,8],block,"Plaintext Block",{bytes:16}));
    steps.push(arr(2,"SubBytes: S-box substitution (non-linear)",[12],block.map(c=>({val:`${c.val.charCodeAt(0)^0x63}`,state:"computed" as string})),"After SubBytes",{sbox:true}));
    steps.push(arr(3,"ShiftRows: rotate each row left",[13],block.map((c,i)=>({val:block[(i+Math.floor(i/4))%16].val,state:"active" as string})),"After ShiftRows",{}));
    steps.push(arr(4,"MixColumns: multiply in GF(2^8)",[14],block.map(c=>({val:`?`,state:"computed" as string})),"After MixColumns",{gf:"2^8"}));
    steps.push(arr(5,"AddRoundKey: XOR with round subkey",[15],block.map(c=>({val:`${(c.val.charCodeAt(0)^0xAB)&0xFF}`,state:"highlighted" as string})),"After AddRoundKey",{round:1,totalRounds:10}));
    return steps;
  }
};

// ─── DES ─────────────────────────────────────────────────────────────────────
export const desModule: VisualizationModule<string> = {
  id: "des", slug: "des", title: "DES Encryption",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "Data Encryption Standard: 16 Feistel rounds with 56-bit key (now insecure).",
  relatedTopics: [],
  pythonCode: `def des_round(L, R, subkey):
    # Feistel structure
    new_L = R
    new_R = L ^ f_function(R, subkey)
    return new_L, new_R

def f_function(R, subkey):
    expanded = expand(R)           # 32 → 48 bits
    mixed = expanded ^ subkey      # XOR with subkey
    substituted = s_boxes(mixed)   # S-box (48 → 32)
    return permute(substituted)    # P-permutation

def des_encrypt(plaintext, key):
    L, R = initial_permutation(plaintext)
    subkeys = key_schedule(key)    # 16 subkeys
    for subkey in subkeys:
        L, R = des_round(L, R, subkey)
    return final_permutation(R + L)`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: "MYSECRET",
  generateSteps(pt) {
    const steps: AnimationStep[] = [];
    const half = Math.ceil(pt.length/2);
    let L = pt.slice(0,half).split("").map(c=>({val:c,state:"active" as string}));
    let R = pt.slice(half).padEnd(half,"_").split("").map(c=>({val:c,state:"default" as string}));
    steps.push(arr(1,"Initial permutation → split into L and R",[13,14],[...L,...R],"L|R (halves)",{}));
    for (let r = 1; r <= 3; r++) {
      const newL = [...R];
      const newR = L.map((c,i)=>({val:String.fromCharCode(c.val.charCodeAt(0)^(R[i%R.length].val.charCodeAt(0)^(r*17))),state:"computed" as string}));
      steps.push(arr(r+1,`Round ${r}: new_L=R, new_R=L⊕f(R,K${r})`,[1,2,3,4],[...newL.map(c=>({...c,state:"highlighted" as string})),...newR],"Feistel Round "+r,{round:r}));
      L = newL; R = newR;
    }
    steps.push(arr(5,"After 16 rounds: final permutation (R|L)",[17],[...R,...L],"Ciphertext",{rounds:16,secure:false,note:"DES broken — use AES"}));
    return steps;
  }
};

// ─── RSA ─────────────────────────────────────────────────────────────────────
export const rsaModule: VisualizationModule<{p:number,q:number,e:number}> = {
  id: "rsa", slug: "rsa", title: "RSA",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(log²n) per op", spaceComplexity: "O(log n)",
  description: "Asymmetric encryption based on difficulty of factoring large integers.",
  relatedTopics: [],
  pythonCode: `from math import gcd

def modinv(a, m):
    # Extended Euclidean algorithm
    g, x = extended_gcd(a, m)
    return x % m

def rsa_keygen(p, q, e):
    n = p * q                    # modulus
    phi = (p - 1) * (q - 1)     # Euler's totient
    # Verify e is coprime with phi
    assert gcd(e, phi) == 1
    d = modinv(e, phi)           # private key
    return (e, n), (d, n)        # (public, private)

def rsa_encrypt(m, e, n): return pow(m, e, n)
def rsa_decrypt(c, d, n): return pow(c, d, n)

# Example: p=61, q=53, e=17
pub, priv = rsa_keygen(61, 53, 17)
ct = rsa_encrypt(65, *pub)
pt = rsa_decrypt(ct, *priv)`,
  codeSteps: [
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: {p:61, q:53, e:17},
  generateSteps({p, q, e}) {
    const n = p*q, phi=(p-1)*(q-1);
    // simple modinv for small numbers
    let d = 1; while((e*d)%phi!==1)d++;
    const m = 65;
    const c = Number(BigInt(m)**BigInt(e)%BigInt(n));
    const dec = Number(BigInt(c)**BigInt(d)%BigInt(n));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Choose primes p=${p}, q=${q}`,[8],[{val:`p=${p}`,state:"active"},{val:`q=${q}`,state:"active"}],"Primes",{p,q}));
    steps.push(arr(2,`n=${n}, φ(n)=${phi}`,[8,9],[{val:`n=${n}`,state:"computed"},{val:`φ=${phi}`,state:"computed"}],"n and φ(n)",{n,phi}));
    steps.push(arr(3,`e=${e} (public), d=${d} (private, secret!)`,[12],[{val:`e=${e}`,state:"active"},{val:`d=${d}`,state:"highlighted"}],"Key pair",{pub:`(${e},${n})`,priv:`(${d},${n})`}));
    steps.push(arr(4,`Encrypt m=${m}: c=${m}^${e} mod ${n} = ${c}`,[15],[{val:`m=${m}`,state:"active"},{val:`c=${c}`,state:"highlighted"}],"Encrypt",{c}));
    steps.push(arr(5,`Decrypt c=${c}: m=${c}^${d} mod ${n} = ${dec}`,[16],[{val:`c=${c}`,state:"active"},{val:`m=${dec}`,state:"highlighted"}],"Decrypt",{recovered:dec,correct:dec===m}));
    return steps;
  }
};

// ─── Diffie-Hellman ───────────────────────────────────────────────────────────
export const diffieHellmanModule: VisualizationModule<{p:number,g:number}> = {
  id: "diffie-hellman", slug: "diffie-hellman", title: "Diffie-Hellman Key Exchange",
  category: ["cryptography"], difficulty: "intermediate",
  timeComplexity: "O(log p)", spaceComplexity: "O(1)",
  description: "Two parties agree on a shared secret over a public channel using discrete log hardness.",
  relatedTopics: [],
  pythonCode: `# Public parameters
p = 23   # prime modulus
g = 5    # primitive root (generator)

# Alice picks secret a, Bob picks secret b
a = 6    # Alice's private key
b = 15   # Bob's private key

# Public values (exchanged openly)
A = pow(g, a, p)   # Alice sends: A = g^a mod p
B = pow(g, b, p)   # Bob sends:   B = g^b mod p

# Shared secret (neither learns the other's private key)
alice_secret = pow(B, a, p)   # B^a mod p
bob_secret   = pow(A, b, p)   # A^b mod p
# alice_secret == bob_secret  (both = g^(ab) mod p)`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: {p:23, g:5},
  generateSteps({p, g}) {
    const a = 6, b = 15;
    const A = Math.pow(g,a)%p, B = Math.pow(g,b)%p;
    const sharedA = Math.pow(B,a)%p, sharedB = Math.pow(A,b)%p;
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Public: p=${p}, g=${g}`,[2,3],[{val:`p=${p}`,state:"default"},{val:`g=${g}`,state:"default"}],"Public params",{p,g}));
    steps.push(arr(2,"Alice: a=6 (secret), Bob: b=15 (secret)",[6,7],[{val:`a=6`,state:"active"},{val:`b=15`,state:"active"}],"Private keys",{secret:true}));
    steps.push(arr(3,`A=g^a mod p=${A}, B=g^b mod p=${B} (public)`,[9,10],[{val:`A=${A}`,state:"computed"},{val:`B=${B}`,state:"computed"}],"Public values",{A,B}));
    steps.push(arr(4,`Alice: B^a mod p = ${sharedA}`,[13],[{val:`B^a=${sharedA}`,state:"highlighted"}],"Alice's secret",{shared:sharedA}));
    steps.push(arr(5,`Bob: A^b mod p = ${sharedB} ✓ (same!)`,[14],[{val:`A^b=${sharedB}`,state:"highlighted"}],"Bob's secret",{shared:sharedB,match:sharedA===sharedB}));
    return steps;
  }
};

// ─── ECDH ─────────────────────────────────────────────────────────────────────
export const ecdhModule: VisualizationModule<string> = {
  id: "ecdh", slug: "ecdh", title: "ECDH Key Exchange",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(log n) point mult", spaceComplexity: "O(1)",
  description: "Diffie-Hellman over elliptic curves — same security with smaller keys.",
  relatedTopics: [],
  pythonCode: `# Elliptic curve: y² = x³ + ax + b (mod p)
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey

# Alice
alice_private = X25519PrivateKey.generate()
alice_public  = alice_private.public_key()

# Bob
bob_private = X25519PrivateKey.generate()
bob_public  = bob_private.public_key()

# Key exchange
alice_shared = alice_private.exchange(bob_public)
bob_shared   = bob_private.exchange(alice_public)
# alice_shared == bob_shared

# Derive symmetric key from shared secret
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
key = HKDF(SHA256(), 32, None, b"handshake").derive(alice_shared)`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: "curve25519",
  generateSteps(curve) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Curve: ${curve} — y²=x³+ax+b mod p`,[1],[{val:curve,state:"active"},{val:"y²=x³+ax+b",state:"default"}],"Elliptic Curve",{bits:256}));
    steps.push(arr(2,"Alice & Bob each generate random private scalar",[4,5,8,9],[{val:"priv_A",state:"active"},{val:"priv_B",state:"active"}],"Private keys",{secret:true}));
    steps.push(arr(3,"Compute public keys: pub = priv × G",[5,9],[{val:"pub_A=privA·G",state:"computed"},{val:"pub_B=privB·G",state:"computed"}],"Public keys",{G:"generator"}));
    steps.push(arr(4,"Exchange public keys (safe over network)",[11,12],[{val:"pub_A→Bob",state:"highlighted"},{val:"pub_B→Alice",state:"highlighted"}],"Key exchange",{}));
    steps.push(arr(5,"Shared secret: privA·pubB = privB·pubA = privA·privB·G",[11,12,16],[{val:"shared_secret",state:"highlighted"},{val:"HKDF→AES_key",state:"computed"}],"Shared secret",{curve,bits:256,secure:true}));
    return steps;
  }
};

// ─── ElGamal ──────────────────────────────────────────────────────────────────
export const elgamalModule: VisualizationModule<{p:number,g:number,m:number}> = {
  id: "elgamal", slug: "elgamal", title: "ElGamal Encryption",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(log p)", spaceComplexity: "O(1)",
  description: "Asymmetric encryption based on discrete log; produces probabilistic ciphertexts.",
  relatedTopics: [],
  pythonCode: `import random

def elgamal_keygen(p, g):
    x = random.randint(2, p-2)   # private key
    h = pow(g, x, p)              # public key component
    return (p, g, h), x

def elgamal_encrypt(p, g, h, m):
    y = random.randint(2, p-2)    # ephemeral key
    c1 = pow(g, y, p)
    c2 = (m * pow(h, y, p)) % p
    return c1, c2

def elgamal_decrypt(p, x, c1, c2):
    s = pow(c1, x, p)             # shared secret
    s_inv = pow(s, p-2, p)        # modular inverse (Fermat)
    return (c2 * s_inv) % p`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: {p:23,g:5,m:10},
  generateSteps({p,g,m}) {
    const x=6, h=Math.pow(g,x)%p, y=8;
    const c1=Math.pow(g,y)%p, c2=(m*Math.pow(h,y)%p)%p;
    const s=Math.pow(c1,x)%p;
    // Fermat's little theorem for inverse
    const sInv=Math.pow(s,p-2)%p;
    const dec=(c2*sInv)%p;
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Keygen: x=${x} (private), h=g^x mod p=${h}`,[3,4],[{val:`x=${x}`,state:"active"},{val:`h=${h}`,state:"computed"}],"Keys",{pub:`(${p},${g},${h})`,priv:x}));
    steps.push(arr(2,`Encrypt m=${m} with y=${y}: c1=${c1}, c2=${c2}`,[8,9,10],[{val:`c1=${c1}`,state:"highlighted"},{val:`c2=${c2}`,state:"highlighted"}],"Ciphertext",{c1,c2}));
    steps.push(arr(3,`Decrypt: s=c1^x mod p=${s}`,[14],[{val:`s=${s}`,state:"active"}],"Shared secret",{s}));
    steps.push(arr(4,`s_inv=${sInv} (Fermat's little theorem)`,[15],[{val:`s_inv=${sInv}`,state:"computed"}],"Modular inverse",{}));
    steps.push(arr(5,`m = c2·s_inv mod p = ${dec} ✓`,[16],[{val:`m=${dec}`,state:"highlighted"}],"Decrypted",{correct:dec===m}));
    return steps;
  }
};

// ─── SHA-256 ─────────────────────────────────────────────────────────────────
export const sha256Module: VisualizationModule<string> = {
  id: "sha-256", slug: "sha-256", title: "SHA-256",
  category: ["cryptography"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "Cryptographic hash: 64 rounds of compression producing a 256-bit digest.",
  relatedTopics: [],
  pythonCode: `import struct, hashlib

# SHA-256 constants (first 32 bits of cube roots of first 64 primes)
K = [0x428a2f98, 0x71374491, ...]  # 64 constants

def sha256_compress(chunk, h0, h1, h2, h3, h4, h5, h6, h7):
    w = list(struct.unpack('>16I', chunk))
    # Message schedule
    for i in range(16, 64):
        s0 = rotr(w[i-15], 7) ^ rotr(w[i-15], 18) ^ (w[i-15] >> 3)
        s1 = rotr(w[i-2], 17) ^ rotr(w[i-2], 19)  ^ (w[i-2] >> 10)
        w.append((w[i-16] + s0 + w[i-7] + s1) & 0xFFFFFFFF)
    # 64 rounds
    a,b,c,d,e,f,g,h = h0,h1,h2,h3,h4,h5,h6,h7
    for i in range(64):
        S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25)
        ch = (e & f) ^ (~e & g)
        T1 = (h + S1 + ch + K[i] + w[i]) & 0xFFFFFFFF
        S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22)
        maj = (a & b) ^ (a & c) ^ (b & c)
        T2 = (S0 + maj) & 0xFFFFFFFF
        h,g,f,e,d,c,b,a = g,f,e,(d+T1)&M,c,b,a,(T1+T2)&M
    return (h0+a)&M, ...`,
  codeSteps: [
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 17, highlightLines: [17] },
    { stepNumber: 20, highlightLines: [20] },
  ],
  defaultInput: "hello",
  generateSteps(msg) {
    const steps: AnimationStep[] = [];
    const padded = msg + "\x80" + "…pad…";
    steps.push(arr(1,`Pad "${msg}" to 512-bit block`,[5,6],padded.slice(0,8).split("").map(c=>({val:c,state:"default" as string})),"Padded block",{bits:512}));
    steps.push(arr(2,"Message schedule: extend 16→64 words",[8,9,10,11],Array.from({length:8},(_,i)=>({val:`W${i}`,state:"computed" as string})),"Schedule W[0..63]",{}));
    steps.push(arr(3,"Init working vars a..h from hash state",[13],[..."abcdefgh".split("").map(c=>({val:c,state:"active" as string}))],"Working vars",{}));
    steps.push(arr(4,"Round 0: compute T1=h+Σ1+Ch+K+W, T2=Σ0+Maj",[15,16,17,18,19,20],[{val:"T1",state:"computed"},{val:"T2",state:"computed"}],"Round 0",{round:0}));
    steps.push(arr(5,"After 64 rounds: add compressed to H0..H7",[21],Array.from({length:8},(_,i)=>({val:`H${i}'`,state:"highlighted" as string})),"New hash state",{rounds:64,digest:"256 bits"}));
    return steps;
  }
};

// ─── Merkle Tree (Crypto) ────────────────────────────────────────────────────
export const merkleCryptoModule: VisualizationModule<string[]> = {
  id: "merkle-tree-crypto", slug: "merkle-tree-crypto", title: "Merkle Tree",
  category: ["cryptography"], difficulty: "intermediate",
  timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
  description: "Binary hash tree enabling efficient and secure verification of large data.",
  relatedTopics: [],
  pythonCode: `import hashlib

def sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()[:8]

def build_merkle_tree(leaves: list[str]) -> list[list[str]]:
    level = [sha256(leaf) for leaf in leaves]
    tree = [level]
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])   # duplicate last if odd
        level = [sha256(level[i] + level[i+1]) for i in range(0, len(level), 2)]
        tree.append(level)
    return tree  # tree[-1][0] is the Merkle root

def merkle_proof(tree, index):
    proof = []
    for level in tree[:-1]:
        sibling = index ^ 1  # XOR to get sibling index
        proof.append(level[sibling])
        index //= 2
    return proof`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: ["Tx1","Tx2","Tx3","Tx4"],
  generateSteps(leaves) {
    const steps: AnimationStep[] = [];
    const h = (s:string) => s.slice(0,4)+"…";
    const l0 = leaves.map(l=>({val:l,state:"active" as string}));
    steps.push(arr(1,"Leaf nodes (transactions/data blocks)",[6],l0,"Leaves",{n:leaves.length}));
    const l1 = leaves.map(l=>({val:`H(${l})`,state:"computed" as string}));
    steps.push(arr(2,"Hash each leaf: SHA-256(data)",[6],l1,"Level 0 (hashes)",{}));
    const l2 = [{val:`H(${h(leaves[0])}+${h(leaves[1])})`,state:"computed"},{val:`H(${h(leaves[2])}+${h(leaves[3])})`,state:"computed"}];
    steps.push(arr(3,"Pair and hash: H(L0||L1), H(L2||L3)",[9,10,11],l2,"Level 1",{}));
    const root = [{val:`H(${l2[0].val.slice(0,6)}+${l2[1].val.slice(0,6)})`,state:"highlighted" as string}];
    steps.push(arr(4,"Merkle root: hash of level-1 nodes",[12],root,"Merkle Root",{root:"single hash"}));
    steps.push(arr(5,"Proof for Tx1: [H(Tx2), H(Tx3||Tx4)]",[16,17,18,19],[{val:"H(Tx2)",state:"active"},{val:"H(Tx3||Tx4)",state:"active"}],"Merkle Proof",{size:"O(log n)"}));
    return steps;
  }
};

// ─── HMAC ─────────────────────────────────────────────────────────────────────
export const hmacModule: VisualizationModule<{message:string,key:string}> = {
  id: "hmac", slug: "hmac", title: "HMAC",
  category: ["cryptography"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "Hash-based Message Authentication Code: authenticates message integrity and origin.",
  relatedTopics: [],
  pythonCode: `import hashlib, hmac

def hmac_sha256(key: bytes, message: bytes) -> bytes:
    block_size = 64
    # Pad or hash key to block size
    if len(key) > block_size:
        key = hashlib.sha256(key).digest()
    key = key.ljust(block_size, b'\\x00')
    # Inner and outer padding
    ipad = bytes(k ^ 0x36 for k in key)
    opad = bytes(k ^ 0x5C for k in key)
    # HMAC = H(opad || H(ipad || message))
    inner = hashlib.sha256(ipad + message).digest()
    return hashlib.sha256(opad + inner).digest()

# Verify
expected = hmac_sha256(b"secret", b"hello")
received = hmac_sha256(b"secret", b"hello")
assert hmac.compare_digest(expected, received)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: {message: "hello", key: "secret"},
  generateSteps({message, key}) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Key="${key}", message="${message}"`,[3,5,6,7],key.split("").map(c=>({val:c,state:"active" as string})),"Key (padded)",{keyLen:key.length}));
    steps.push(arr(2,"ipad = key XOR 0x36",[9],key.split("").map(c=>({val:`${(c.charCodeAt(0)^0x36)&0xFF}`,state:"computed" as string})),"ipad",{xor:"0x36"}));
    steps.push(arr(3,"opad = key XOR 0x5C",[10],key.split("").map(c=>({val:`${(c.charCodeAt(0)^0x5C)&0xFF}`,state:"computed" as string})),"opad",{xor:"0x5C"}));
    steps.push(arr(4,"inner = H(ipad || message)",[12],[{val:"H(ipad+msg)",state:"highlighted"},{val:"32 bytes",state:"computed"}],"Inner hash",{}));
    steps.push(arr(5,"HMAC = H(opad || inner)",[13],[{val:"HMAC",state:"highlighted"},{val:"32 bytes",state:"computed"}],"HMAC output",{auth:true,tamperProof:true}));
    return steps;
  }
};

// ─── bcrypt ───────────────────────────────────────────────────────────────────
export const bcryptModule: VisualizationModule<{password:string,cost:number}> = {
  id: "bcrypt", slug: "bcrypt", title: "bcrypt Password Hashing",
  category: ["cryptography"], difficulty: "intermediate",
  timeComplexity: "O(2^cost)", spaceComplexity: "O(1)",
  description: "Adaptive password hashing: slow by design with salt to prevent brute force.",
  relatedTopics: [],
  pythonCode: `import bcrypt

def hash_password(password: str, cost: int = 12) -> str:
    salt = bcrypt.gensalt(rounds=cost)  # random 128-bit salt
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# bcrypt output format:
# $2b$12$<22-char salt><31-char hash>
# $2b$ = version, 12 = cost factor

# Internals: Blowfish-based with key setup (EksBlowfishSetup)
# 1. Expand key+salt into Blowfish state (2^cost iterations)
# 2. Encrypt OrpheanBeholderScryDoubt 64 times
# 3. Output: salt + ciphertext`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 15, highlightLines: [15] },
  ],
  defaultInput: {password: "hunter2", cost: 12},
  generateSteps({password, cost}) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Password="${password}", cost factor=${cost}`,[3],[{val:password,state:"active"},{val:`cost=${cost}`,state:"default"}],"Input",{iterations:Math.pow(2,cost)}));
    steps.push(arr(2,"Generate random 128-bit salt",[3],[{val:"$2b$12$",state:"computed"},{val:"<22-char-salt>",state:"highlighted"}],"Salt generated",{bits:128}));
    steps.push(arr(3,`EksBlowfishSetup: ${Math.pow(2,cost)} key expansion iterations`,[14],[{val:`iter=0`,state:"active"},{val:`iter=${Math.pow(2,cost)}`,state:"default"}],"Key expansion",{cost,iterations:Math.pow(2,cost)}));
    steps.push(arr(4,"Encrypt 'OrpheanBeholderScryDoubt' 64 times",[15],[{val:"OrpheanB…",state:"computed"},{val:"×64",state:"active"}],"Encryption",{rounds:64}));
    steps.push(arr(5,"Output: $2b$12$<salt><hash> (60 chars)",[5,6],[{val:"$2b$12$…hash…",state:"highlighted"}],"bcrypt hash",{verify:"constant-time compare"}));
    return steps;
  }
};

// ─── TLS Protocol ─────────────────────────────────────────────────────────────
export const tlsProtocolModule: VisualizationModule<string> = {
  id: "tls-protocol", slug: "tls-protocol", title: "TLS 1.3 Handshake",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(1) RTT", spaceComplexity: "O(1)",
  description: "TLS 1.3: 1-RTT handshake with ECDHE key exchange and forward secrecy.",
  relatedTopics: [],
  pythonCode: `# TLS 1.3 Handshake (simplified)
# Client                          Server
# ─────────────────────────────────────
# ClientHello + key_share  ────►
#                          ◄──── ServerHello + key_share
#                          ◄──── {EncryptedExtensions}
#                          ◄──── {Certificate}
#                          ◄──── {CertificateVerify}
#                          ◄──── {Finished}
# {Certificate}            ────►
# {CertificateVerify}      ────►
# {Finished}               ────►
# [Application Data]       ◄───►

# Key derivation (HKDF):
# early_secret     = HKDF-Extract(0, PSK)
# handshake_secret = HKDF-Extract(ECDHE_output, early_secret)
# master_secret    = HKDF-Extract(0, handshake_secret)`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: "TLS_AES_256_GCM_SHA384",
  generateSteps(cipher) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Client: send ClientHello + ECDHE key_share",[4],[{val:"ClientHello",state:"active"},{val:cipher,state:"default"},{val:"key_share_C",state:"computed"}],"ClientHello",{cipher}));
    steps.push(arr(2,"Server: send ServerHello + server key_share",[5],[{val:"ServerHello",state:"active"},{val:"key_share_S",state:"computed"}],"ServerHello",{}));
    steps.push(arr(3,"Both compute ECDHE shared secret → derive keys",[14,15,16],[{val:"ECDHE_secret",state:"highlighted"},{val:"HKDF→keys",state:"computed"}],"Key derivation",{forward_secrecy:true}));
    steps.push(arr(4,"Server: send encrypted {Cert, CertVerify, Finished}",[6,7,8,9],[{val:"{Cert}",state:"active"},{val:"{CertVerify}",state:"active"},{val:"{Finished}",state:"highlighted"}],"Server auth",{encrypted:true}));
    steps.push(arr(5,"Client: send {Finished} → Application Data",[10,11],[{val:"{Finished}",state:"computed"},{val:"[AppData]",state:"highlighted"}],"Established",{rtt:1,cipher}));
    return steps;
  }
};

// ─── PGP ─────────────────────────────────────────────────────────────────────
export const pgpModule: VisualizationModule<string> = {
  id: "pgp", slug: "pgp", title: "PGP Encryption",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Pretty Good Privacy: hybrid encryption with RSA key encapsulation and AES data encryption.",
  relatedTopics: [],
  pythonCode: `import gnupg

def pgp_encrypt(plaintext: str, recipient_fingerprint: str) -> str:
    gpg = gnupg.GPG()
    # 1. Generate random session key (symmetric)
    # 2. Encrypt session key with recipient's RSA public key
    # 3. Encrypt plaintext with AES using session key
    # 4. Output: encrypted_session_key || encrypted_data
    result = gpg.encrypt(plaintext, recipient_fingerprint)
    return str(result)

def pgp_decrypt(ciphertext: str, passphrase: str) -> str:
    gpg = gnupg.GPG()
    # 1. Decrypt session key with RSA private key (passphrase-protected)
    # 2. Decrypt data with AES session key
    result = gpg.decrypt(ciphertext, passphrase=passphrase)
    return str(result)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: "Hello, secure world!",
  generateSteps(msg) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Message: "${msg.slice(0,16)}…"`,[3],[{val:msg.slice(0,8),state:"active"}],"Plaintext",{len:msg.length}));
    steps.push(arr(2,"Generate random AES-256 session key",[5],[{val:"session_key",state:"highlighted"},{val:"256 bits",state:"computed"}],"Session key",{random:true}));
    steps.push(arr(3,"RSA-encrypt session key with recipient's public key",[6],[{val:"RSA(session_key)",state:"computed"},{val:"→ enc_key",state:"highlighted"}],"Encrypted key",{alg:"RSA-OAEP"}));
    steps.push(arr(4,"AES-256-CFB encrypt message with session key",[7],[{val:"AES(msg)",state:"computed"},{val:"→ ciphertext",state:"highlighted"}],"Ciphertext",{alg:"AES-256"}));
    steps.push(arr(5,"PGP block: [enc_key || ciphertext]",[8],[{val:"enc_key",state:"active"},{val:"ciphertext",state:"active"}],"PGP output",{armor:true}));
    return steps;
  }
};

// ─── Kerberos ─────────────────────────────────────────────────────────────────
export const kerberosModule: VisualizationModule<string> = {
  id: "kerberos", slug: "kerberos", title: "Kerberos Authentication",
  category: ["cryptography"], difficulty: "advanced",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Ticket-based authentication protocol using symmetric cryptography and trusted KDC.",
  relatedTopics: [],
  pythonCode: `# Kerberos V5 authentication flow
# Parties: Client (C), Auth Server (AS), Ticket Granting Server (TGS), Service (S)

# Step 1: AS exchange (get TGT)
# C → AS: {username, TGS_name, timestamp}
# AS → C: {TGT encrypted with TGS key} + {session_key_C_TGS encrypted with C key}

# Step 2: TGS exchange (get service ticket)
# C → TGS: {TGT} + {Authenticator: C_name, timestamp, encrypted with session_key_C_TGS}
# TGS → C: {service_ticket encrypted with service key} + {session_key_C_S}

# Step 3: Service exchange
# C → S: {service_ticket} + {Authenticator}
# S → C: {timestamp + 1} encrypted with session_key_C_S  (mutual auth)

# Key property: no password ever sent over network
# Tickets are time-limited (default 8 hours)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: "alice@REALM",
  generateSteps(principal) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Client ${principal} requests TGT from AS`,[5],[{val:"C→AS",state:"active"},{val:principal,state:"default"},{val:"timestamp",state:"computed"}],"AS Request",{step:1}));
    steps.push(arr(2,"AS returns TGT + session key (encrypted)",[6],[{val:"TGT (enc)",state:"highlighted"},{val:"SK_c-tgs (enc)",state:"computed"}],"TGT obtained",{encrypted:true}));
    steps.push(arr(3,"Client→TGS: send TGT + Authenticator",[9],[{val:"TGT",state:"active"},{val:"Authenticator",state:"computed"}],"TGS Request",{step:2}));
    steps.push(arr(4,"TGS returns service ticket",[10],[{val:"SvcTicket (enc)",state:"highlighted"},{val:"SK_c-s",state:"computed"}],"Service ticket",{}));
    steps.push(arr(5,"Client presents ticket to service → mutual auth",[11,12],[{val:"SvcTicket",state:"active"},{val:"ts+1 (verify)",state:"highlighted"}],"Authenticated",{mutual:true,noPassword:true}));
    return steps;
  }
};

export const cryptographyModules = [
  xorCipherModule, streamCipherModule, aesModule, desModule,
  rsaModule, diffieHellmanModule, ecdhModule, elgamalModule,
  sha256Module, merkleCryptoModule, hmacModule, bcryptModule,
  tlsProtocolModule, pgpModule, kerberosModule,
];
