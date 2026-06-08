import { createPlaceholderModule } from "@/visualizations/placeholder";
import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER
═══════════════════════════════════════════════════════════════════════════ */
interface FlowStepDef {
  from: string;
  to: string;
  label: string;
  color?: string;
  description: string;
  lines: number[];
  variables?: Record<string, unknown>;
}

function buildFlowSteps(
  lanes: string[],
  flowStepDefs: FlowStepDef[],
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const completedSteps: number[] = [];

  // Initial state — show empty diagram
  steps.push({
    stepNumber: 1,
    description: `Ready to start. Lanes: ${lanes.join(" ↔ ")}.`,
    highlightLines: [],
    visualState: {
      type: "flowdiagram",
      lanes,
      steps: flowStepDefs.map((s) => ({ from: s.from, to: s.to, label: s.label, color: s.color })),
      activeStep: -1,
      completedSteps: [],
    },
    variables: {},
  });

  for (let i = 0; i < flowStepDefs.length; i++) {
    const def = flowStepDefs[i];

    steps.push({
      stepNumber: steps.length + 1,
      description: def.description,
      highlightLines: def.lines,
      visualState: {
        type: "flowdiagram",
        lanes,
        steps: flowStepDefs.map((s) => ({ from: s.from, to: s.to, label: s.label, color: s.color })),
        activeStep: i,
        completedSteps: [...completedSteps],
      },
      variables: def.variables ?? {},
    });

    completedSteps.push(i);

    steps.push({
      stepNumber: steps.length + 1,
      description: `${def.label} — complete.`,
      highlightLines: def.lines,
      visualState: {
        type: "flowdiagram",
        lanes,
        steps: flowStepDefs.map((s) => ({ from: s.from, to: s.to, label: s.label, color: s.color })),
        activeStep: -1,
        completedSteps: [...completedSteps],
      },
      variables: def.variables ?? {},
    });
  }

  return steps;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TCP 3-WAY HANDSHAKE
═══════════════════════════════════════════════════════════════════════════ */
const tcpCode = `# TCP 3-Way Handshake (simplified)
# Client initiates connection to Server

# Step 1: SYN — synchronize
client → server: TCP SYN (seq=x)
# Server receives SYN

# Step 2: SYN-ACK — server acknowledges
server → client: TCP SYN-ACK (seq=y, ack=x+1)
# Client receives SYN-ACK

# Step 3: ACK — client acknowledges
client → server: TCP ACK (ack=y+1)

# Connection is now ESTABLISHED
# Data transfer can begin`;

export const threeWayHandshakeModule: VisualizationModule<null> = {
  id: "three-way-handshake",
  slug: "three-way-handshake",
  title: "TCP 3-Way Handshake",
  category: ["networks", "tcp-ip"],
  difficulty: "beginner",
  timeComplexity: "3 round trips",
  spaceComplexity: "O(1)",
  description:
    "How TCP establishes a reliable connection using SYN → SYN-ACK → ACK before any data is transmitted.",
  relatedTopics: ["four-way-termination", "tcp-flow-control", "tls-handshake"],
  pythonCode: tcpCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Client", "Server"],
      [
        {
          from: "Client",
          to: "Server",
          label: "SYN (seq=x)",
          color: "#6366f1",
          description:
            "Step 1 — SYN: Client sends TCP segment with SYN flag set (seq=x). Client enters SYN_SENT state.",
          lines: [4, 5],
          variables: { clientState: "SYN_SENT", seq_x: "random", flag: "SYN" },
        },
        {
          from: "Server",
          to: "Client",
          label: "SYN-ACK (seq=y, ack=x+1)",
          color: "#10b981",
          description:
            "Step 2 — SYN-ACK: Server responds with its own SYN and acknowledges client's SYN (ack=x+1). Server enters SYN_RECEIVED.",
          lines: [8, 9],
          variables: { serverState: "SYN_RECEIVED", seq_y: "random", ack: "x+1", flags: "SYN+ACK" },
        },
        {
          from: "Client",
          to: "Server",
          label: "ACK (ack=y+1)",
          color: "#f59e0b",
          description:
            "Step 3 — ACK: Client acknowledges server's SYN (ack=y+1). Both sides are now in ESTABLISHED state. Connection is ready.",
          lines: [11, 12, 13],
          variables: { clientState: "ESTABLISHED", serverState: "ESTABLISHED", ack: "y+1" },
        },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HTTP / HTTPS LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */
const httpCode = `# HTTP Request / Response Lifecycle

# 1. DNS Resolution (client → DNS)
client.resolve("example.com")
# Returns IP address

# 2. TCP Connection
tcp_handshake(client, server)

# 3. HTTP Request
GET /api/data HTTP/1.1
Host: example.com
Accept: application/json

# 4. Server Processing
server.route_request()
server.fetch_data()
server.serialize_response()

# 5. HTTP Response
HTTP/1.1 200 OK
Content-Type: application/json
{"result": "..."}

# 6. Connection close (or reuse with Keep-Alive)`;

export const httpLifecycleModule: VisualizationModule<null> = {
  id: "http-lifecycle",
  slug: "http-lifecycle",
  title: "HTTP / HTTPS Lifecycle",
  category: ["networks", "application-layer"],
  difficulty: "beginner",
  timeComplexity: "DNS + TCP + TTFB + Transfer",
  spaceComplexity: "O(1)",
  description:
    "End-to-end journey of an HTTP request: DNS resolution → TCP connect → send request → server processes → response → close.",
  relatedTopics: ["dns-resolution", "three-way-handshake", "tls-handshake"],
  pythonCode: httpCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Browser", "DNS", "Server"],
      [
        {
          from: "Browser",
          to: "DNS",
          label: "DNS Query (example.com)",
          color: "#f59e0b",
          description: "Browser needs IP for example.com — queries DNS resolver.",
          lines: [3, 4],
          variables: { query: "example.com", type: "A record" },
        },
        {
          from: "DNS",
          to: "Browser",
          label: "DNS Response (93.184.x.x)",
          color: "#f59e0b",
          description: "DNS resolver returns IP address for example.com.",
          lines: [4, 5],
          variables: { ip: "93.184.216.34", ttl: "300s" },
        },
        {
          from: "Browser",
          to: "Server",
          label: "TCP SYN",
          color: "#6366f1",
          description: "Browser initiates TCP connection to server IP on port 443 (HTTPS) or 80 (HTTP).",
          lines: [7, 8],
          variables: { port: 443, protocol: "TCP" },
        },
        {
          from: "Server",
          to: "Browser",
          label: "TCP SYN-ACK",
          color: "#6366f1",
          description: "Server acknowledges TCP connection. 3-way handshake in progress.",
          lines: [8],
          variables: { state: "ESTABLISHED" },
        },
        {
          from: "Browser",
          to: "Server",
          label: "GET /api/data HTTP/1.1",
          color: "#10b981",
          description: "Browser sends HTTP GET request with headers (Host, Accept, Cookie, etc.).",
          lines: [10, 11, 12, 13],
          variables: { method: "GET", path: "/api/data", version: "HTTP/1.1" },
        },
        {
          from: "Server",
          to: "Browser",
          label: "HTTP 200 OK + Body",
          color: "#10b981",
          description: "Server processes request, fetches data, and sends HTTP 200 response with JSON body.",
          lines: [18, 19, 20, 21],
          variables: { status: 200, contentType: "application/json" },
        },
        {
          from: "Browser",
          to: "Server",
          label: "Connection: Keep-Alive / Close",
          color: "#6b7280",
          description: "Connection may be reused (Keep-Alive) for subsequent requests or closed.",
          lines: [23],
          variables: { keepAlive: true },
        },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DNS RESOLUTION
═══════════════════════════════════════════════════════════════════════════ */
const dnsCode = `# DNS Resolution — Recursive vs Iterative

# 1. Browser checks local cache
cache.lookup("www.example.com")
# Cache miss → query local resolver

# 2. Query Local Resolver (ISP / OS)
local_resolver.query("www.example.com")
# Resolver checks its own cache
# Cache miss → query Root DNS

# 3. Root DNS Server
root_dns.query("www.example.com")
# Returns TLD NS: .com → 192.5.6.30

# 4. .com TLD Name Server
tld_ns.query("www.example.com")
# Returns Authoritative NS: ns1.example.com

# 5. Authoritative Name Server
auth_ns.query("www.example.com")
# Returns A record: 93.184.216.34

# 6. Resolver returns answer to client
local_resolver → client: 93.184.216.34`;

export const dnsResolutionModule: VisualizationModule<null> = {
  id: "dns-resolution",
  slug: "dns-resolution",
  title: "DNS Resolution",
  category: ["networks", "application-layer"],
  difficulty: "beginner",
  timeComplexity: "1–4 round trips (with caching)",
  spaceComplexity: "O(1)",
  description:
    "How a domain name is resolved to an IP: Browser cache → Resolver → Root DNS → TLD → Authoritative → IP returned.",
  relatedTopics: ["http-lifecycle", "dhcp", "ip-addressing"],
  pythonCode: dnsCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Browser", "Resolver", "Root DNS", "Auth NS"],
      [
        {
          from: "Browser",
          to: "Resolver",
          label: "Query: www.example.com",
          color: "#6366f1",
          description: "Browser checks OS cache — no entry. Sends recursive query to local DNS resolver (usually the ISP's or 8.8.8.8).",
          lines: [3, 4, 5, 7, 8],
          variables: { query: "www.example.com", type: "A", recursive: true },
        },
        {
          from: "Resolver",
          to: "Root DNS",
          label: "Query: www.example.com",
          color: "#f59e0b",
          description: "Resolver has no cached answer — queries one of 13 Root DNS servers.",
          lines: [9, 10, 11, 12],
          variables: { query: "www.example.com", rootServers: 13 },
        },
        {
          from: "Root DNS",
          to: "Resolver",
          label: "Referral → .com TLD NS",
          color: "#f59e0b",
          description: 'Root DNS doesn\'t know the IP but knows the .com TLD nameservers — returns referral.',
          lines: [12, 13],
          variables: { tld: ".com", ns: "192.5.6.30" },
        },
        {
          from: "Resolver",
          to: "Auth NS",
          label: "Query: www.example.com",
          color: "#10b981",
          description: "Resolver queries .com TLD nameserver → gets referral to example.com authoritative NS → queries it.",
          lines: [15, 16, 17, 18, 19],
          variables: { authNS: "ns1.example.com" },
        },
        {
          from: "Auth NS",
          to: "Resolver",
          label: "A Record: 93.184.216.34",
          color: "#10b981",
          description: "Authoritative nameserver returns the A record (IPv4 address) for www.example.com.",
          lines: [19, 20],
          variables: { record: "A", ip: "93.184.216.34", ttl: "3600" },
        },
        {
          from: "Resolver",
          to: "Browser",
          label: "IP: 93.184.216.34",
          color: "#6366f1",
          description: "Resolver caches the result and returns IP to browser. Browser can now open a TCP connection.",
          lines: [22],
          variables: { ip: "93.184.216.34", cached: true },
        },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   OAUTH 2.0 AUTHORIZATION CODE FLOW
═══════════════════════════════════════════════════════════════════════════ */
const oauthCode = `# OAuth 2.0 — Authorization Code Flow

# 1. User clicks "Login with Google"
app.redirect(
  auth_server,
  client_id=APP_ID,
  redirect_uri="https://app.com/callback",
  scope="email profile",
  state=random_csrf_token,
)

# 2. User logs in and grants consent
auth_server.authenticate_user()
auth_server.show_consent_screen()
user.grants_permission()

# 3. Auth server redirects with code
auth_server → app_callback:
  ?code=AUTHORIZATION_CODE
  &state=random_csrf_token

# 4. App exchanges code for tokens
app → auth_server:
  POST /token
  {code, client_id, client_secret, redirect_uri}

# 5. Auth server returns tokens
auth_server → app:
  {access_token, refresh_token, expires_in}

# 6. App calls API with token
app → api: GET /userinfo
  Authorization: Bearer <access_token>`;

export const oauth2Module: VisualizationModule<null> = {
  id: "oauth2",
  slug: "oauth2",
  title: "OAuth 2.0 Flow",
  category: ["networks", "network-security"],
  difficulty: "intermediate",
  timeComplexity: "3–4 round trips",
  spaceComplexity: "O(1)",
  description:
    "OAuth 2.0 Authorization Code Flow: how apps securely delegate authentication to an identity provider (like Google/GitHub).",
  relatedTopics: ["tls-handshake", "jwt", "http-lifecycle"],
  pythonCode: oauthCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["User/Browser", "App Server", "Auth Server", "API"],
      [
        {
          from: "User/Browser",
          to: "App Server",
          label: "Click: Login with Google",
          color: "#6366f1",
          description: 'User clicks "Login with Google" on the app. App prepares authorization request.',
          lines: [3, 4, 5, 6, 7, 8, 9],
          variables: { action: "login", provider: "Google" },
        },
        {
          from: "App Server",
          to: "Auth Server",
          label: "Redirect: /authorize?client_id=…",
          color: "#6366f1",
          description: "App redirects browser to Google OAuth endpoint with client_id, scope, redirect_uri, and state (CSRF token).",
          lines: [4, 5, 6, 7, 8, 9, 10],
          variables: { client_id: "APP_ID", scope: "email profile", state: "csrf_token" },
        },
        {
          from: "Auth Server",
          to: "User/Browser",
          label: "Show Login + Consent Screen",
          color: "#f59e0b",
          description: "Google shows login page. User authenticates and is shown a consent screen listing requested permissions.",
          lines: [12, 13, 14, 15],
          variables: { screen: "consent", scopes: "email, profile" },
        },
        {
          from: "Auth Server",
          to: "App Server",
          label: "Redirect: /callback?code=AUTH_CODE",
          color: "#10b981",
          description: "User grants consent. Auth server redirects to app's redirect_uri with short-lived authorization code.",
          lines: [17, 18, 19, 20],
          variables: { code: "AUTH_CODE", expires: "60 seconds" },
        },
        {
          from: "App Server",
          to: "Auth Server",
          label: "POST /token {code + secret}",
          color: "#10b981",
          description: "App exchanges authorization code for tokens — POST to /token with code, client_id, client_secret (server-side).",
          lines: [22, 23, 24, 25],
          variables: { grant_type: "authorization_code", client_secret: "hidden" },
        },
        {
          from: "Auth Server",
          to: "App Server",
          label: "{ access_token, refresh_token }",
          color: "#10b981",
          description: "Auth server validates code + secret and returns access token, refresh token, and expiry.",
          lines: [27, 28, 29],
          variables: { access_token: "JWT...", expires_in: 3600 },
        },
        {
          from: "App Server",
          to: "API",
          label: "GET /userinfo (Bearer token)",
          color: "#ec4899",
          description: "App calls resource API with Bearer token in Authorization header to get user profile.",
          lines: [31, 32, 33],
          variables: { endpoint: "/userinfo", auth: "Bearer <token>" },
        },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   TCP 4-WAY TERMINATION
═══════════════════════════════════════════════════════════════════════════ */
export const fourWayTerminationModule: VisualizationModule<null> = {
  id: "four-way-termination", slug: "four-way-termination", title: "TCP 4-Way Termination",
  category: ["networks", "tcp-ip"], difficulty: "beginner",
  timeComplexity: "4 messages", spaceComplexity: "O(1)",
  description: "TCP connection teardown: FIN → ACK → FIN → ACK. Each side independently closes its half of the connection.",
  relatedTopics: ["three-way-handshake"],
  pythonCode: `# TCP 4-Way Termination
# Either side can initiate (here: Client initiates)

# Step 1: Client sends FIN
client → server: FIN (seq=u)   # client enters FIN_WAIT_1

# Step 2: Server ACKs FIN
server → client: ACK (ack=u+1) # server enters CLOSE_WAIT, client enters FIN_WAIT_2

# Step 3: Server sends its own FIN
server → client: FIN (seq=v)   # server enters LAST_ACK

# Step 4: Client ACKs
client → server: ACK (ack=v+1) # client enters TIME_WAIT (waits 2*MSL)
# Server receives ACK → CLOSED
# Client waits TIME_WAIT → CLOSED`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["Client", "Server"], [
    { from: "Client", to: "Server", label: "FIN (seq=u)", color: "#ef4444",
      description: "Step 1 — FIN: Client has no more data to send. Sends FIN segment. Client → FIN_WAIT_1.",
      lines: [4, 5], variables: { clientState: "FIN_WAIT_1", flag: "FIN" } },
    { from: "Server", to: "Client", label: "ACK (ack=u+1)", color: "#f59e0b",
      description: "Step 2 — ACK: Server acknowledges client FIN. Server → CLOSE_WAIT. Client → FIN_WAIT_2. Server may still send data.",
      lines: [8, 9], variables: { serverState: "CLOSE_WAIT", clientState: "FIN_WAIT_2" } },
    { from: "Server", to: "Client", label: "FIN (seq=v)", color: "#ef4444",
      description: "Step 3 — FIN: Server finishes sending data and sends its own FIN. Server → LAST_ACK.",
      lines: [12, 13], variables: { serverState: "LAST_ACK", flag: "FIN" } },
    { from: "Client", to: "Server", label: "ACK (ack=v+1)", color: "#10b981",
      description: "Step 4 — ACK: Client acknowledges server FIN. Client → TIME_WAIT (waits 2×MSL ≈ 60s). Server → CLOSED.",
      lines: [16, 17, 18], variables: { clientState: "TIME_WAIT→CLOSED", serverState: "CLOSED", wait: "2×MSL" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   TCP CONGESTION CONTROL
═══════════════════════════════════════════════════════════════════════════ */
export const tcpCongestionModule: VisualizationModule<null> = {
  id: "tcp-congestion", slug: "tcp-congestion", title: "TCP Congestion Control",
  category: ["networks", "tcp-ip"], difficulty: "intermediate",
  timeComplexity: "Adaptive", spaceComplexity: "O(1)",
  description: "TCP Reno: Slow Start → Congestion Avoidance → Fast Retransmit → Fast Recovery. cwnd grows exponentially then linearly.",
  relatedTopics: ["tcp-flow-control", "three-way-handshake"],
  pythonCode: `# TCP Congestion Control (TCP Reno)

# Phase 1: Slow Start
cwnd = 1  # start with 1 MSS
ssthresh = 64
while cwnd < ssthresh:
    cwnd *= 2   # double each RTT (exponential)

# Phase 2: Congestion Avoidance
while no_loss:
    cwnd += 1/cwnd  # +1 MSS per RTT (linear)

# Phase 3: On packet loss (timeout)
ssthresh = cwnd / 2
cwnd = 1  # restart Slow Start

# Phase 4: On triple duplicate ACK (Fast Retransmit)
ssthresh = cwnd / 2
cwnd = ssthresh + 3  # Fast Recovery`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const phases = [
      { rtt: 1, cwnd: 1, phase: "Slow Start" }, { rtt: 2, cwnd: 2, phase: "Slow Start" },
      { rtt: 3, cwnd: 4, phase: "Slow Start" }, { rtt: 4, cwnd: 8, phase: "Slow Start" },
      { rtt: 5, cwnd: 16, phase: "Congestion Avoidance" }, { rtt: 6, cwnd: 17, phase: "Congestion Avoidance" },
      { rtt: 7, cwnd: 18, phase: "Congestion Avoidance" }, { rtt: 8, cwnd: 9, phase: "Fast Recovery (loss!)" },
      { rtt: 9, cwnd: 10, phase: "Congestion Avoidance" }, { rtt: 10, cwnd: 11, phase: "Congestion Avoidance" },
    ];
    const ssthresh = 16;

    steps.push({
      stepNumber: 1,
      description: "TCP Congestion Control: cwnd controls how much data can be in-flight. Slow Start doubles cwnd each RTT until ssthresh.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: [{ val: `cwnd=1`, state: "active" as const }, { val: `ssthresh=${ssthresh}`, state: "default" as const }],
        label: "Congestion Window",
      },
      variables: { cwnd: 1, ssthresh, phase: "Slow Start" },
    });

    for (const p of phases) {
      const isLoss = p.phase.includes("loss");
      steps.push({
        stepNumber: steps.length + 1,
        description: `RTT ${p.rtt}: ${p.phase}. cwnd=${p.cwnd}${isLoss ? " (ssthresh halved, restart)" : ""}.`,
        highlightLines: p.phase === "Slow Start" ? [5, 6, 7] : isLoss ? [13, 14, 15] : [9, 10, 11],
        visualState: {
          type: "array1d",
          cells: [
            { val: `RTT${p.rtt}`, state: "default" as const },
            { val: `cwnd=${p.cwnd}`, state: isLoss ? "highlighted" as const : p.cwnd < ssthresh ? "active" as const : "computed" as const },
            { val: `ssthresh=${isLoss ? Math.floor(p.cwnd / 2) : ssthresh}`, state: "default" as const },
            { val: p.phase, state: "default" as const },
          ],
          label: "TCP Reno Congestion Window",
        },
        variables: { rtt: p.rtt, cwnd: p.cwnd, phase: p.phase },
      });
    }

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   TCP FLOW CONTROL
═══════════════════════════════════════════════════════════════════════════ */
export const tcpFlowControlModule: VisualizationModule<null> = {
  id: "tcp-flow-control", slug: "tcp-flow-control", title: "TCP Flow Control",
  category: ["networks", "tcp-ip"], difficulty: "intermediate",
  timeComplexity: "Adaptive", spaceComplexity: "O(buffer)",
  description: "Receiver advertises window size (rwnd) to prevent sender from overwhelming its buffer. Sender respects rwnd.",
  relatedTopics: ["tcp-congestion", "three-way-handshake"],
  pythonCode: `# TCP Flow Control — Sliding Window

# Receiver has a buffer (e.g. 65535 bytes)
recv_buffer = 65535
rwnd = recv_buffer  # advertised to sender

# Sender can only send up to rwnd unacknowledged bytes
send_base = 0
next_seq = 0

def send_data(data):
    global next_seq
    while next_seq - send_base < rwnd:
        send(data[next_seq])
        next_seq += 1

# When receiver acks, it updates rwnd
def on_ack(ack_num, new_rwnd):
    global send_base, rwnd
    send_base = ack_num
    rwnd = new_rwnd   # receiver tells sender its free buffer`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const bufferSize = 8;
    const events = [
      { send: 3, consumed: 0, desc: "Sender sends 3 segments. Receiver buffer used: 3/8. rwnd=5." },
      { send: 2, consumed: 0, desc: "Sender sends 2 more. Buffer used: 5/8. rwnd=3." },
      { send: 0, consumed: 3, desc: "Application reads 3 segments. Buffer freed. rwnd=6." },
      { send: 3, consumed: 0, desc: "Sender sends 3 more (new rwnd=6). Buffer: 5/8. rwnd=3." },
      { send: 0, consumed: 5, desc: "App reads all 5. Buffer empty. rwnd=8 (full window)." },
    ];

    steps.push({
      stepNumber: 1,
      description: `TCP Flow Control: receiver advertises rwnd (receive window). Sender can only send ≤ rwnd unACKed bytes. Prevents buffer overflow.`,
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: Array(bufferSize).fill(null).map((_, i) => ({ val: `[${i}]`, state: "default" as const })),
        label: `Receive buffer (${bufferSize} slots, rwnd=${bufferSize})`,
      },
      variables: { bufferSize, rwnd: bufferSize, bufferUsed: 0 },
    });

    let used = 0;
    for (const ev of events) {
      used = used + ev.send - ev.consumed;
      const rwnd = bufferSize - used;
      steps.push({
        stepNumber: steps.length + 1,
        description: ev.desc,
        highlightLines: [12, 13, 17, 18, 19],
        visualState: {
          type: "array1d",
          cells: Array(bufferSize).fill(null).map((_, i) => ({
            val: i < used ? `data` : `free`,
            state: i < used ? "active" as const : "default" as const,
          })),
          label: `Buffer: ${used}/${bufferSize} used, rwnd=${rwnd}`,
        },
        variables: { bufferUsed: used, rwnd, freeSlots: rwnd },
      });
    }

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DHCP
═══════════════════════════════════════════════════════════════════════════ */
export const dhcpModule: VisualizationModule<null> = {
  id: "dhcp", slug: "dhcp", title: "DHCP",
  category: ["networks", "application-layer"], difficulty: "beginner",
  timeComplexity: "4 messages (DORA)", spaceComplexity: "O(1)",
  description: "Dynamic Host Configuration Protocol: DISCOVER → OFFER → REQUEST → ACK. Automatically assigns IP, subnet, gateway, DNS.",
  relatedTopics: ["dns-resolution", "ip-addressing"],
  pythonCode: `# DHCP — DORA Process

# Step 1: DISCOVER (broadcast)
client → broadcast: DHCP DISCOVER
# "I need an IP address!" (src=0.0.0.0, dst=255.255.255.255)

# Step 2: OFFER
server → broadcast: DHCP OFFER
# "I offer you 192.168.1.100 for 24h"
# {offered_ip, subnet_mask, gateway, dns, lease_time}

# Step 3: REQUEST
client → broadcast: DHCP REQUEST
# "I accept offer from server 192.168.1.1"
# (broadcast so other DHCP servers see client chose)

# Step 4: ACK
server → client: DHCP ACK
# "Confirmed! 192.168.1.100 is yours for 24h"
# Client configures network interface`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["Client", "DHCP Server"], [
    { from: "Client", to: "DHCP Server", label: "DISCOVER (broadcast)", color: "#6366f1",
      description: "D — DISCOVER: Client broadcasts on 255.255.255.255 (no IP yet). Asks: 'Is there a DHCP server?'",
      lines: [3, 4, 5], variables: { src: "0.0.0.0", dst: "255.255.255.255", type: "DISCOVER" } },
    { from: "DHCP Server", to: "Client", label: "OFFER (192.168.1.100)", color: "#10b981",
      description: "O — OFFER: Server offers an IP (192.168.1.100) along with subnet mask, gateway, DNS, and lease time.",
      lines: [8, 9, 10], variables: { offeredIP: "192.168.1.100", subnet: "255.255.255.0", gateway: "192.168.1.1", leaseTime: "86400s" } },
    { from: "Client", to: "DHCP Server", label: "REQUEST (accept offer)", color: "#f59e0b",
      description: "R — REQUEST: Client broadcasts acceptance of the offer. Other DHCP servers see this and withdraw their offers.",
      lines: [13, 14, 15], variables: { requestedIP: "192.168.1.100", serverID: "192.168.1.1" } },
    { from: "DHCP Server", to: "Client", label: "ACK (confirmed lease)", color: "#10b981",
      description: "A — ACK: Server confirms IP lease. Client configures its interface and is ready to communicate.",
      lines: [18, 19, 20], variables: { assignedIP: "192.168.1.100", leaseExpiry: "+24h", dns: "8.8.8.8" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   SMTP
═══════════════════════════════════════════════════════════════════════════ */
export const smtpModule: VisualizationModule<null> = {
  id: "smtp", slug: "smtp", title: "SMTP",
  category: ["networks", "application-layer"], difficulty: "beginner",
  timeComplexity: "Multiple round trips", spaceComplexity: "O(message size)",
  description: "Simple Mail Transfer Protocol: how email is sent from client to mail server. EHLO, MAIL FROM, RCPT TO, DATA, QUIT.",
  relatedTopics: ["dns-resolution", "tls-handshake"],
  pythonCode: `# SMTP Session

S: 220 mail.example.com ESMTP
C: EHLO client.example.com
S: 250-mail.example.com
S: 250-STARTTLS
S: 250 OK

C: STARTTLS
S: 220 Go ahead
# TLS handshake...

C: MAIL FROM: <alice@example.com>
S: 250 OK

C: RCPT TO: <bob@example.com>
S: 250 OK

C: DATA
S: 354 Start mail input
C: Subject: Hello
C: From: alice@example.com
C: To: bob@example.com
C: .  (end of message)
S: 250 Message accepted

C: QUIT
S: 221 Bye`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["SMTP Client", "Mail Server"], [
    { from: "SMTP Client", to: "Mail Server", label: "EHLO client.example.com", color: "#6366f1",
      description: "Client greets server with EHLO. Server responds with supported extensions (STARTTLS, AUTH, SIZE, etc.).",
      lines: [4, 5, 6, 7], variables: { command: "EHLO", extensions: "STARTTLS, AUTH, SIZE" } },
    { from: "SMTP Client", to: "Mail Server", label: "STARTTLS → TLS upgrade", color: "#a855f7",
      description: "STARTTLS: upgrade connection to TLS for encrypted transmission. Server responds 220 Go ahead.",
      lines: [9, 10, 11], variables: { command: "STARTTLS", encryption: "TLSv1.3" } },
    { from: "SMTP Client", to: "Mail Server", label: "MAIL FROM: <alice@...>", color: "#f59e0b",
      description: "MAIL FROM specifies envelope sender (return-path). Server validates and responds 250 OK.",
      lines: [13, 14], variables: { from: "alice@example.com", status: 250 } },
    { from: "SMTP Client", to: "Mail Server", label: "RCPT TO: <bob@...>", color: "#f59e0b",
      description: "RCPT TO specifies recipient. Multiple RCPT TO commands for multiple recipients.",
      lines: [16, 17], variables: { to: "bob@example.com", status: 250 } },
    { from: "SMTP Client", to: "Mail Server", label: "DATA (headers + body)", color: "#10b981",
      description: "DATA command: client sends message headers + body. Terminates with a line containing only '.'",
      lines: [19, 20, 21, 22, 23, 24], variables: { subject: "Hello", bodySize: "1KB" } },
    { from: "SMTP Client", to: "Mail Server", label: "QUIT", color: "#6b7280",
      description: "QUIT closes the SMTP session. Server responds 221 Bye and closes TCP connection.",
      lines: [26, 27], variables: { command: "QUIT", response: "221 Bye" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   WEBSOCKET HANDSHAKE
═══════════════════════════════════════════════════════════════════════════ */
export const websocketModule: VisualizationModule<null> = {
  id: "websocket", slug: "websocket", title: "WebSocket Handshake",
  category: ["networks", "application-layer"], difficulty: "intermediate",
  timeComplexity: "1 upgrade round-trip then persistent", spaceComplexity: "O(1)",
  description: "WebSocket upgrades an HTTP connection to a persistent bidirectional channel. Used for real-time apps (chat, live data).",
  relatedTopics: ["http-lifecycle", "three-way-handshake"],
  pythonCode: `# WebSocket Handshake (RFC 6455)

# 1. Client sends HTTP Upgrade request
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# 2. Server accepts upgrade
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

# 3. Persistent bidirectional channel
# Client → Server frames (masked)
ws.send("Hello from client")

# Server → Client frames (unmasked)
ws.send("Hello from server")

# 4. Close handshake
ws.close(1000, "Normal closure")`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["Browser", "Server"], [
    { from: "Browser", to: "Server", label: "GET /chat + Upgrade: websocket", color: "#6366f1",
      description: "HTTP Upgrade request: browser sends GET with 'Upgrade: websocket' header and Sec-WebSocket-Key (random base64 nonce).",
      lines: [3, 4, 5, 6, 7, 8, 9], variables: { method: "GET", upgrade: "websocket", key: "dGhlIHNhbXBsZSBub25jZQ==" } },
    { from: "Server", to: "Browser", label: "101 Switching Protocols", color: "#10b981",
      description: "Server responds 101: computes Sec-WebSocket-Accept (SHA-1 of key+GUID, base64). Connection is now a WebSocket.",
      lines: [12, 13, 14, 15], variables: { status: 101, accept: "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=" } },
    { from: "Browser", to: "Server", label: "WS Frame: Hello (masked)", color: "#f59e0b",
      description: "WebSocket frame sent client→server. Client-to-server frames MUST be masked (XOR with random masking key).",
      lines: [18, 19], variables: { direction: "client→server", masked: true, opcode: "text" } },
    { from: "Server", to: "Browser", label: "WS Frame: Hello back (unmasked)", color: "#f59e0b",
      description: "Server→client frames are NOT masked. Full-duplex: both sides can send at any time.",
      lines: [22, 23], variables: { direction: "server→client", masked: false, opcode: "text" } },
    { from: "Browser", to: "Server", label: "Close frame (1000)", color: "#6b7280",
      description: "Close handshake: client sends Close frame with status 1000 (normal). Server echoes Close. TCP connection closes.",
      lines: [25, 26], variables: { code: 1000, reason: "Normal closure" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   IP ADDRESSING & SUBNETTING
═══════════════════════════════════════════════════════════════════════════ */
export const ipAddressingModule: VisualizationModule<null> = {
  id: "ip-addressing", slug: "ip-addressing", title: "IP Addressing & Subnetting",
  category: ["networks", "network-layer"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "IPv4 address structure, CIDR notation, subnet masks, and how to calculate network/broadcast addresses and host ranges.",
  relatedTopics: ["nat", "dhcp", "ospf"],
  pythonCode: `# IPv4 Addressing and Subnetting

# IP address: 4 octets (32 bits)
ip = "192.168.1.100"
mask = "255.255.255.0"   # /24 CIDR

# Convert to binary
ip_bin = "11000000.10101000.00000001.01100100"
mask_bin = "11111111.11111111.11111111.00000000"

# Network address (AND)
network = ip_bin AND mask_bin
# = 11000000.10101000.00000001.00000000
# = 192.168.1.0

# Host range: 192.168.1.1 – 192.168.1.254
# Broadcast: 192.168.1.255
# Usable hosts: 254 (2^8 - 2)

# CIDR /25 splits into 2 subnets:
# 192.168.1.0/25:   hosts 1-126, broadcast 127
# 192.168.1.128/25: hosts 129-254, broadcast 255`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const examples = [
      { cidr: "/24", mask: "255.255.255.0", network: "192.168.1.0", bcast: "192.168.1.255", hosts: 254 },
      { cidr: "/25", mask: "255.255.255.128", network: "192.168.1.0", bcast: "192.168.1.127", hosts: 126 },
      { cidr: "/26", mask: "255.255.255.192", network: "192.168.1.0", bcast: "192.168.1.63", hosts: 62 },
    ];

    steps.push({
      stepNumber: 1,
      description: "IPv4: 32-bit address in 4 octets. CIDR /n means n bits for network, 32-n for hosts. Hosts = 2^(32-n) - 2.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: [
          { val: "192", state: "active" as const }, { val: "168", state: "active" as const },
          { val: "1", state: "active" as const }, { val: "100", state: "default" as const },
        ],
        label: "IP: 192.168.1.100 (4 octets)",
      },
      variables: { ip: "192.168.1.100", binary: "11000000.10101000.00000001.01100100" },
    });

    for (const ex of examples) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${ex.cidr}: mask=${ex.mask}. Network=${ex.network}, Broadcast=${ex.bcast}. Usable hosts=${ex.hosts}.`,
        highlightLines: [11, 12, 13],
        visualState: {
          type: "array1d",
          cells: [
            { val: `${ex.cidr}`, state: "highlighted" as const },
            { val: `Net:${ex.network}`, state: "computed" as const },
            { val: `Bcast:${ex.bcast}`, state: "active" as const },
            { val: `Hosts:${ex.hosts}`, state: "default" as const },
          ],
          label: `Subnet ${ex.cidr}`,
        },
        variables: { cidr: ex.cidr, mask: ex.mask, hosts: ex.hosts },
      });
    }

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   NAT
═══════════════════════════════════════════════════════════════════════════ */
export const natModule: VisualizationModule<null> = {
  id: "nat", slug: "nat", title: "NAT",
  category: ["networks", "network-layer"], difficulty: "intermediate",
  timeComplexity: "O(1) per packet", spaceComplexity: "O(connections)",
  description: "Network Address Translation: maps private IPs to a public IP. Conserves IPv4 addresses. Tracks connections via port mapping table.",
  relatedTopics: ["ip-addressing", "dhcp"],
  pythonCode: `# NAT (Network Address Translation)

# Private LAN: 192.168.1.0/24
# Public IP: 203.0.113.5

# Outbound packet (LAN → Internet)
packet_out = {
    "src_ip": "192.168.1.100",
    "src_port": 54321,
    "dst_ip": "8.8.8.8",
    "dst_port": 53
}
# NAT rewrites source to public IP + unique port
nat_table[("192.168.1.100", 54321)] = ("203.0.113.5", 40001)
packet_out["src_ip"] = "203.0.113.5"
packet_out["src_port"] = 40001

# Inbound reply
packet_in = {"dst_ip": "203.0.113.5", "dst_port": 40001}
# NAT looks up table, rewrites to private
original = nat_table.reverse_lookup("203.0.113.5", 40001)
# = ("192.168.1.100", 54321)
packet_in["dst_ip"] = original[0]
packet_in["dst_port"] = original[1]`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["LAN Host", "NAT Router", "Internet Server"], [
    { from: "LAN Host", to: "NAT Router", label: "192.168.1.100:54321 → 8.8.8.8:53", color: "#6366f1",
      description: "LAN host sends DNS query. Private IP 192.168.1.100, port 54321 → DNS server 8.8.8.8:53.",
      lines: [6, 7, 8, 9, 10, 11], variables: { src: "192.168.1.100:54321", dst: "8.8.8.8:53" } },
    { from: "NAT Router", to: "Internet Server", label: "203.0.113.5:40001 → 8.8.8.8:53", color: "#f59e0b",
      description: "NAT rewrites source to public IP:port. Stores mapping in NAT table: (192.168.1.100:54321) ↔ (203.0.113.5:40001).",
      lines: [13, 14, 15, 16], variables: { natMapping: "(192.168.1.100:54321)↔(203.0.113.5:40001)", publicIP: "203.0.113.5:40001" } },
    { from: "Internet Server", to: "NAT Router", label: "8.8.8.8:53 → 203.0.113.5:40001", color: "#10b981",
      description: "Server replies to public IP. NAT receives packet destined for 203.0.113.5:40001.",
      lines: [18, 19], variables: { inbound: "8.8.8.8:53 → 203.0.113.5:40001" } },
    { from: "NAT Router", to: "LAN Host", label: "8.8.8.8:53 → 192.168.1.100:54321", color: "#10b981",
      description: "NAT looks up table, rewrites destination to original private IP:port. Forwards to LAN host.",
      lines: [20, 21, 22, 23, 24], variables: { translated: "→ 192.168.1.100:54321", operation: "reverse NAT" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   OSPF ROUTING
═══════════════════════════════════════════════════════════════════════════ */
export const ospfModule: VisualizationModule<null> = {
  id: "ospf", slug: "ospf", title: "OSPF Routing",
  category: ["networks", "network-layer"], difficulty: "advanced",
  timeComplexity: "O(V²) Dijkstra", spaceComplexity: "O(V+E)",
  description: "Open Shortest Path First: link-state routing protocol. Routers flood LSAs, build complete topology, run Dijkstra for shortest paths.",
  relatedTopics: ["bgp", "rip"],
  pythonCode: `# OSPF — Link State Routing Protocol

# Phase 1: Neighbor Discovery
router.send_hello()  # multicast 224.0.0.5
neighbor = wait_for_hello()
router.form_adjacency(neighbor)

# Phase 2: Database Exchange
router.send_DBD()      # Database Description
neighbor.reply_DBD()
# Exchange LSR/LSU/LSAck for missing LSAs

# Phase 3: Build Link State Database (LSDB)
lsdb = flood_lsas()    # every router has full topology

# Phase 4: Run Dijkstra
spf_tree = dijkstra(lsdb, source=router.id)

# Phase 5: Install routes in FIB
for dest, next_hop in spf_tree:
    fib[dest] = next_hop

# Triggered updates: re-run SPF on topology change`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "R1", x: 100, y: 150 }, { id: 1, label: "R2", x: 250, y: 80 },
      { id: 2, label: "R3", x: 400, y: 150 }, { id: 3, label: "R4", x: 250, y: 250 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 10, directed: false }, { from: 1, to: 2, weight: 5, directed: false },
      { from: 0, to: 3, weight: 20, directed: false }, { from: 3, to: 2, weight: 10, directed: false },
      { from: 1, to: 3, weight: 15, directed: false },
    ];

    steps.push({
      stepNumber: 1,
      description: "OSPF Phase 1: Hello packets. Routers discover neighbors, form adjacencies on shared links.",
      highlightLines: [3, 4, 5, 6],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0, 1, 2, 3], current: -1, distances: {}, path: [] },
      variables: { phase: "Neighbor Discovery", hello: "224.0.0.5 multicast" },
    });

    steps.push({
      stepNumber: 2,
      description: "OSPF Phase 2-3: LSA flooding. Each router sends Link State Advertisements. All routers build identical LSDB (full topology).",
      highlightLines: [9, 10, 11, 12, 13],
      visualState: { type: "graph", nodes, edges, visited: [0, 1, 2, 3], frontier: [], current: -1, distances: {}, path: [] },
      variables: { phase: "LSA Flooding", lsdb: "R1:[R2:10,R4:20], R2:[R1:10,R3:5,R4:15], R3:[R2:5,R4:10], R4:[R1:20,R2:15,R3:10]" },
    });

    // Dijkstra from R1
    const dist: Record<number, number> = { 0: 0, 1: 10, 2: 15, 3: 20 };
    steps.push({
      stepNumber: 3,
      description: "OSPF Phase 4: Dijkstra SPF from R1. Shortest paths: R1→R2=10, R1→R3=15 (via R2), R1→R4=20.",
      highlightLines: [15, 16],
      visualState: {
        type: "graph", nodes, edges,
        visited: [0, 1, 2, 3], frontier: [], current: 0,
        distances: dist, path: [0, 1, 2],
      },
      variables: { source: "R1", dist: JSON.stringify(dist), shortestPath: "R1→R2(10)→R3(15)" },
    });

    steps.push({
      stepNumber: 4,
      description: "OSPF Phase 5: Install routes in FIB. R1's routing table: R2 via direct, R3 via R2, R4 via direct.",
      highlightLines: [18, 19, 20],
      visualState: {
        type: "graph", nodes, edges,
        visited: [0], frontier: [], current: -1,
        distances: dist, path: [0, 1, 2],
        mstEdges: [[0, 1], [1, 2], [0, 3]],
      },
      variables: { fib: "R2:direct, R3:via-R2, R4:direct", triggered: "re-run SPF on change" },
    });

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   BGP
═══════════════════════════════════════════════════════════════════════════ */
export const bgpModule: VisualizationModule<null> = {
  id: "bgp", slug: "bgp", title: "BGP",
  category: ["networks", "network-layer"], difficulty: "advanced",
  timeComplexity: "Path vector", spaceComplexity: "O(prefixes)",
  description: "Border Gateway Protocol: inter-AS routing on the internet. Path-vector protocol using TCP sessions between ASes.",
  relatedTopics: ["ospf", "rip", "ip-addressing"],
  pythonCode: `# BGP — Border Gateway Protocol

# BGP session (eBGP between different ASes)
bgp_session = {
    "local_as": 65001,
    "peer_as": 65002,
    "transport": "TCP port 179",
}

# BGP messages
OPEN    → establish session, exchange AS numbers
KEEPALIVE → heartbeat (every 60s by default)
UPDATE  → advertise/withdraw routes
NOTIFICATION → error, close session

# Route advertisement
router.advertise({
    "prefix": "10.0.0.0/8",
    "as_path": [65001],          # path-vector: list of ASes
    "next_hop": "1.2.3.4",
    "local_pref": 100,           # iBGP preference
    "med": 0,                    # multi-exit discriminator
})

# BGP decision process (simplified):
# 1. Highest local_pref
# 2. Shortest AS_PATH
# 3. Lowest MED
# 4. eBGP over iBGP
# 5. Lowest IGP cost to next-hop`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["AS 65001 (ISP A)", "AS 65002 (ISP B)", "AS 65003 (ISP C)"], [
    { from: "AS 65001 (ISP A)", to: "AS 65002 (ISP B)", label: "OPEN (AS=65001)", color: "#6366f1",
      description: "BGP OPEN: establish TCP session on port 179. Exchange AS numbers, Hold Time, BGP ID. Transition to OpenSent state.",
      lines: [3, 4, 5, 6, 7], variables: { localAS: 65001, peerAS: 65002, holdTime: 180, port: 179 } },
    { from: "AS 65002 (ISP B)", to: "AS 65001 (ISP A)", label: "OPEN + KEEPALIVE", color: "#10b981",
      description: "Peer responds with OPEN. Both send KEEPALIVE to confirm. BGP session is ESTABLISHED.",
      lines: [11, 12], variables: { state: "ESTABLISHED", keepalive: "every 60s" } },
    { from: "AS 65001 (ISP A)", to: "AS 65002 (ISP B)", label: "UPDATE: 10.0.0.0/8 AS_PATH=[65001]", color: "#f59e0b",
      description: "AS 65001 advertises prefix 10.0.0.0/8. AS_PATH=[65001]. ISP B adds to BGP table if best path.",
      lines: [16, 17, 18, 19, 20, 21], variables: { prefix: "10.0.0.0/8", asPath: "[65001]", nextHop: "1.2.3.4" } },
    { from: "AS 65002 (ISP B)", to: "AS 65003 (ISP C)", label: "UPDATE: 10.0.0.0/8 AS_PATH=[65002,65001]", color: "#f59e0b",
      description: "ISP B propagates route to ISP C, prepending its own AS to the path: AS_PATH=[65002,65001]. Loop prevention: discard if own AS in path.",
      lines: [16, 18], variables: { prefix: "10.0.0.0/8", asPath: "[65002,65001]", loopPrevention: "AS_PATH check" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   RIP
═══════════════════════════════════════════════════════════════════════════ */
export const ripModule: VisualizationModule<null> = {
  id: "rip", slug: "rip", title: "RIP",
  category: ["networks", "network-layer"], difficulty: "intermediate",
  timeComplexity: "O(V·E) Bellman-Ford", spaceComplexity: "O(V)",
  description: "Routing Information Protocol: distance-vector protocol. Routers exchange full routing tables every 30s. Max hop count=15.",
  relatedTopics: ["ospf", "bgp"],
  pythonCode: `# RIP — Distance Vector Routing Protocol

# Each router maintains a routing table: {dest: (cost, next_hop)}
routing_table = {
    "192.168.1.0/24": (1, "direct"),
    "192.168.2.0/24": (2, "R2"),
}

# Every 30 seconds: broadcast routing table to neighbors
def send_updates(table):
    for neighbor in neighbors:
        neighbor.receive_update(table)

# Bellman-Ford update
def receive_update(neighbor_table, neighbor, neighbor_cost):
    for dest, (cost, _) in neighbor_table.items():
        new_cost = neighbor_cost + cost
        if new_cost < routing_table.get(dest, (16,))[0]:
            routing_table[dest] = (new_cost, neighbor)

# Infinity = 16 (max hops = 15)
# Count-to-infinity problem: split horizon / route poisoning
# Split horizon: don't advertise route back to source`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "R1", x: 100, y: 150 }, { id: 1, label: "R2", x: 280, y: 80 },
      { id: 2, label: "R3", x: 460, y: 150 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 1, directed: false }, { from: 1, to: 2, weight: 1, directed: false },
    ];

    const tableStates = [
      { desc: "Initial: each router knows only direct neighbors.", dist: { 0: 0, 1: 1, 2: 16 } },
      { desc: "Round 1: R2 shares table. R1 learns R3 via R2 (cost=2). R3 learns R1 via R2 (cost=2).", dist: { 0: 0, 1: 1, 2: 2 } },
      { desc: "Round 2: Stable. No updates needed. Converged. Each router sends full table every 30s.", dist: { 0: 0, 1: 1, 2: 2 } },
    ];

    steps.push({
      stepNumber: 1,
      description: "RIP: distance-vector protocol. Each router knows its direct neighbors. Broadcasts routing table every 30s. Max hop=15 (16=∞).",
      highlightLines: [3, 4, 5, 6],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0], current: 0, distances: { 0: 0, 1: 1, 2: 16 }, path: [] },
      variables: { protocol: "RIP v2", updateInterval: "30s", infinity: 16 },
    });

    for (const s of tableStates) {
      steps.push({
        stepNumber: steps.length + 1,
        description: s.desc,
        highlightLines: [14, 15, 16, 17, 18],
        visualState: { type: "graph", nodes, edges, visited: [0, 1, 2], frontier: [], current: -1, distances: s.dist, path: [] },
        variables: { r1_dist: s.dist },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Count-to-infinity problem: if R3 goes down, R1 and R2 may increment each other's stale routes forever. Fix: split horizon — don't advertise back to source.",
      highlightLines: [22, 23],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [], current: 2, distances: { 0: 0, 1: 1, 2: 16 }, path: [] },
      variables: { problem: "count-to-infinity", fix: "split horizon / route poisoning" },
    });

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ARP
═══════════════════════════════════════════════════════════════════════════ */
export const arpModule: VisualizationModule<null> = {
  id: "arp", slug: "arp", title: "ARP",
  category: ["networks", "data-link-layer"], difficulty: "beginner",
  timeComplexity: "O(1) with cache", spaceComplexity: "O(hosts)",
  description: "Address Resolution Protocol: maps IPv4 addresses to MAC addresses on a local network via broadcast request/reply.",
  relatedTopics: ["ethernet-frame", "nat", "dhcp"],
  pythonCode: `# ARP — Address Resolution Protocol

# Goal: find MAC address for IP 192.168.1.50
target_ip = "192.168.1.50"

# Step 1: Check ARP cache
if target_ip in arp_cache:
    return arp_cache[target_ip]

# Step 2: ARP Request (broadcast)
arp_request = {
    "sender_mac": "AA:BB:CC:11:22:33",
    "sender_ip":  "192.168.1.100",
    "target_mac": "FF:FF:FF:FF:FF:FF",  # broadcast
    "target_ip":  "192.168.1.50",
}
broadcast(arp_request)  # all hosts on LAN receive this

# Step 3: Only target replies (unicast)
if packet.target_ip == my_ip:
    arp_reply = {
        "sender_mac": "DD:EE:FF:44:55:66",
        "sender_ip":  "192.168.1.50",
        "target_mac": "AA:BB:CC:11:22:33",
    }
    unicast(arp_reply, arp_request.sender_mac)

# Step 4: Update ARP cache
arp_cache["192.168.1.50"] = "DD:EE:FF:44:55:66"`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["Host A (192.168.1.100)", "LAN Broadcast", "Host B (192.168.1.50)"], [
    { from: "Host A (192.168.1.100)", to: "LAN Broadcast", label: "ARP Request (who has 192.168.1.50?)", color: "#6366f1",
      description: "ARP Request: broadcasted to FF:FF:FF:FF:FF:FF. All hosts on LAN receive it. 'Who has 192.168.1.50? Tell 192.168.1.100.'",
      lines: [10, 11, 12, 13, 14, 15, 16], variables: { targetIP: "192.168.1.50", senderIP: "192.168.1.100", dst: "FF:FF:FF:FF:FF:FF (broadcast)" } },
    { from: "LAN Broadcast", to: "Host B (192.168.1.50)", label: "All hosts receive, only B replies", color: "#6b7280",
      description: "All hosts receive the broadcast. Only Host B (192.168.1.50) recognizes its own IP and sends a unicast reply.",
      lines: [18, 19], variables: { allHosts: "receive but ignore", hostB: "recognizes own IP" } },
    { from: "Host B (192.168.1.50)", to: "Host A (192.168.1.100)", label: "ARP Reply: DD:EE:FF:44:55:66", color: "#10b981",
      description: "Host B sends unicast ARP Reply with its MAC address directly to Host A.",
      lines: [20, 21, 22, 23, 24], variables: { hostBMAC: "DD:EE:FF:44:55:66", type: "unicast" } },
    { from: "Host A (192.168.1.100)", to: "Host A (192.168.1.100)", label: "Update ARP cache", color: "#f59e0b",
      description: "Host A caches the mapping: 192.168.1.50 → DD:EE:FF:44:55:66. Future packets skip ARP (until TTL expires ≈20 min).",
      lines: [26, 27], variables: { cached: "192.168.1.50 → DD:EE:FF:44:55:66", ttl: "≈20 min" } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   CSMA/CD
═══════════════════════════════════════════════════════════════════════════ */
export const csmaCdModule: VisualizationModule<null> = {
  id: "csma-cd", slug: "csma-cd", title: "CSMA/CD",
  category: ["networks", "data-link-layer"], difficulty: "intermediate",
  timeComplexity: "O(1) per transmission attempt", spaceComplexity: "O(1)",
  description: "Carrier Sense Multiple Access / Collision Detection: Ethernet medium access control. Listen before transmit, detect collision, backoff.",
  relatedTopics: ["ethernet-frame", "arp"],
  pythonCode: `# CSMA/CD — Ethernet Medium Access

import random

def transmit(station, frame):
    while True:
        # 1. Carrier Sense: is medium idle?
        while medium_busy():
            wait()  # wait until idle

        # 2. Transmit
        start_transmitting(frame)

        # 3. Collision Detection
        if collision_detected():
            send_jam_signal()      # 32-bit jam
            k = min(attempt, 10)
            backoff = random.randint(0, 2**k - 1) * slot_time
            wait(backoff)          # Binary Exponential Backoff
            attempt += 1
            if attempt > 16:
                raise TransmissionFailed()
        else:
            break  # success

# Slot time = 2 * propagation delay (end-to-end)
# Max frame size ensures collision detectable`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const events = [
      { station: "A", state: "sense", desc: "Station A senses medium: IDLE. Begins transmitting frame." },
      { station: "B", state: "sense", desc: "Station B also senses medium: detects it's BUSY (A transmitting). B waits." },
      { station: "A+B", state: "collision", desc: "Collision! A and B transmit simultaneously (propagation delay). Both detect voltage spike." },
      { station: "A+B", state: "jam", desc: "Both send 32-bit JAM signal to ensure all stations hear collision. Transmission aborted." },
      { station: "A", state: "backoff", desc: "A: Binary Exponential Backoff. k=1, backoff ∈ {0,1} × 51.2μs. A waits 0 slots." },
      { station: "B", state: "backoff", desc: "B: backoff ∈ {0,1} × 51.2μs. B waits 1 slot." },
      { station: "A", state: "transmit", desc: "A retransmits successfully (medium idle, no collision). Frame delivered." },
    ];

    steps.push({
      stepNumber: 1,
      description: "CSMA/CD: Carrier Sense (listen before transmit), Multiple Access (shared medium), Collision Detection (abort on collision).",
      highlightLines: [6, 7, 8],
      visualState: { type: "array1d", cells: [{ val: "Medium: IDLE", state: "default" as const }], label: "Ethernet Segment" },
      variables: { medium: "idle", stations: ["A", "B", "C"] },
    });

    for (const ev of events) {
      steps.push({
        stepNumber: steps.length + 1,
        description: ev.desc,
        highlightLines: ev.state === "collision" ? [13, 14, 15] : ev.state === "backoff" ? [16, 17, 18] : [10, 11],
        visualState: {
          type: "array1d",
          cells: [
            { val: `Station:${ev.station}`, state: "default" as const },
            {
              val: ev.state === "collision" ? "COLLISION" : ev.state === "jam" ? "JAM" : ev.state === "backoff" ? "BACKOFF" : ev.state === "transmit" ? "TX OK" : "SENSE",
              state: ev.state === "collision" ? "highlighted" as const : ev.state === "transmit" ? "computed" as const : "active" as const,
            },
          ],
          label: `CSMA/CD: ${ev.state}`,
        },
        variables: { station: ev.station, event: ev.state },
      });
    }

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ETHERNET FRAME
═══════════════════════════════════════════════════════════════════════════ */
export const ethernetFrameModule: VisualizationModule<null> = {
  id: "ethernet-frame", slug: "ethernet-frame", title: "Ethernet Frame",
  category: ["networks", "data-link-layer"], difficulty: "beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(frame size)",
  description: "Ethernet II frame structure: Preamble, Destination MAC, Source MAC, EtherType, Payload, FCS. Foundation of LAN communication.",
  relatedTopics: ["arp", "csma-cd"],
  pythonCode: `# Ethernet II Frame Structure

frame = {
    "preamble":    "10101010" * 7,   # 7 bytes: sync clock
    "sfd":         "10101011",        # 1 byte: Start Frame Delimiter
    "dst_mac":     "AA:BB:CC:DD:EE:FF",  # 6 bytes
    "src_mac":     "11:22:33:44:55:66",  # 6 bytes
    "ethertype":   0x0800,            # 2 bytes: 0x0800=IPv4, 0x0806=ARP, 0x86DD=IPv6
    "payload":     data,              # 46-1500 bytes
    "fcs":         crc32(frame),      # 4 bytes: Frame Check Sequence
}
# Total: 64-1518 bytes (min frame = 64B for CSMA/CD)

# EtherType common values:
# 0x0800 = IPv4
# 0x0806 = ARP
# 0x86DD = IPv6
# 0x8100 = VLAN (802.1Q)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const fields = [
      { name: "Preamble+SFD", size: "8B", desc: "7 bytes alternating 1010…+1 byte 10101011. Clock synchronization and frame start." },
      { name: "Dst MAC", size: "6B", desc: "Destination MAC address. FF:FF:FF:FF:FF:FF = broadcast. Used by switch for forwarding." },
      { name: "Src MAC", size: "6B", desc: "Source MAC address. Identifies sending NIC. Burned into hardware (globally unique)." },
      { name: "EtherType", size: "2B", desc: "Protocol of payload: 0x0800=IPv4, 0x0806=ARP, 0x86DD=IPv6, 0x8100=VLAN." },
      { name: "Payload", size: "46-1500B", desc: "IP packet or ARP message. Min 46B (padded if needed), max 1500B (MTU)." },
      { name: "FCS", size: "4B", desc: "Frame Check Sequence: CRC-32 of frame. Receiver recalculates; mismatch → drop frame." },
    ];

    steps.push({
      stepNumber: 1,
      description: "Ethernet II frame: 6 fields. Min 64 bytes (ensures CSMA/CD collision detectable). Max 1518 bytes (standard MTU).",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: fields.map((f) => ({ val: f.name, state: "default" as const })),
        label: "Ethernet Frame Fields",
      },
      variables: { minSize: "64B", maxSize: "1518B", overhead: "26B (headers+FCS)" },
    });

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      steps.push({
        stepNumber: steps.length + 1,
        description: `${f.name} (${f.size}): ${f.desc}`,
        highlightLines: [i + 4],
        visualState: {
          type: "array1d",
          cells: fields.map((ff, j) => ({
            val: `${ff.name}(${ff.size})`,
            state: j === i ? "active" as const : j < i ? "computed" as const : "default" as const,
          })),
          label: "Ethernet Frame",
        },
        variables: { field: f.name, size: f.size },
      });
    }

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   TLS/SSL HANDSHAKE
═══════════════════════════════════════════════════════════════════════════ */
export const tlsHandshakeModule: VisualizationModule<null> = {
  id: "tls-handshake", slug: "tls-handshake", title: "TLS/SSL Handshake",
  category: ["networks", "network-security"], difficulty: "intermediate",
  timeComplexity: "1–2 RTT", spaceComplexity: "O(1)",
  description: "TLS 1.3 handshake: negotiate cipher, authenticate server via certificate, derive session keys. Encrypts all subsequent data.",
  relatedTopics: ["three-way-handshake", "jwt", "rsa"],
  pythonCode: `# TLS 1.3 Handshake

# 1. Client Hello
client → server: {
    tls_version: "1.3",
    cipher_suites: ["TLS_AES_256_GCM_SHA384", ...],
    client_random: random_32_bytes(),
    key_share: client_dh_public_key,  # ECDHE
}

# 2. Server Hello
server → client: {
    chosen_cipher: "TLS_AES_256_GCM_SHA384",
    server_random: random_32_bytes(),
    key_share: server_dh_public_key,
}

# 3. Server Certificate + Verify
server → client: {
    certificate: X509_cert,          # contains server public key
    certificate_verify: sign(hash),  # proves server has private key
    finished: HMAC(handshake_hash),
}

# 4. Key Derivation (both sides independently)
master_secret = HKDF(client_dh, server_dh)
session_key = derive_keys(master_secret, random_bytes)

# 5. Client Finished
client → server: { finished: HMAC(handshake_hash) }

# All subsequent data encrypted with session_key`,
  codeSteps: [],
  defaultInput: null,
  generateSteps: () => buildFlowSteps(["Client", "Server"], [
    { from: "Client", to: "Server", label: "ClientHello (TLS 1.3 + cipher suites + ECDHE key)", color: "#6366f1",
      description: "ClientHello: TLS version, supported cipher suites, client_random (32 bytes), ECDHE key share (public key for Diffie-Hellman).",
      lines: [3, 4, 5, 6, 7, 8], variables: { tlsVersion: "1.3", ciphers: "TLS_AES_256_GCM_SHA384", keyShare: "ECDHE P-256" } },
    { from: "Server", to: "Client", label: "ServerHello (chosen cipher + server ECDHE key)", color: "#10b981",
      description: "ServerHello: chosen cipher, server_random, server's ECDHE public key. Both sides can now derive shared secret.",
      lines: [11, 12, 13, 14, 15], variables: { chosenCipher: "TLS_AES_256_GCM_SHA384", keyShare: "ECDHE server" } },
    { from: "Server", to: "Client", label: "Certificate + CertificateVerify + Finished", color: "#10b981",
      description: "Server sends X.509 certificate (contains public key), signature proving it owns private key, and Finished (HMAC of handshake).",
      lines: [18, 19, 20, 21, 22], variables: { cert: "X.509 signed by CA", verify: "RSA/ECDSA signature" } },
    { from: "Client", to: "Client", label: "Verify cert + Derive session keys", color: "#a855f7",
      description: "Client verifies certificate chain up to trusted CA. Both sides derive identical session keys from ECDHE shared secret via HKDF.",
      lines: [25, 26], variables: { keyDerivation: "HKDF(ECDHE_shared_secret)", sessionKey: "AES-256-GCM" } },
    { from: "Client", to: "Server", label: "Finished (HMAC of handshake)", color: "#f59e0b",
      description: "Client sends Finished message. Server verifies it. TLS session established. All data encrypted with derived session keys.",
      lines: [29, 30], variables: { state: "ESTABLISHED", encryption: "AES-256-GCM", authenticated: true } },
  ]),
};

/* ═══════════════════════════════════════════════════════════════════════════
   JWT LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */
export const jwtModule: VisualizationModule<null> = {
  id: "jwt", slug: "jwt", title: "JWT Lifecycle",
  category: ["networks", "network-security"], difficulty: "beginner",
  timeComplexity: "O(1) verify (no DB lookup)", spaceComplexity: "O(token size)",
  description: "JSON Web Token: Header.Payload.Signature. Stateless authentication — server verifies signature without database lookup.",
  relatedTopics: ["tls-handshake", "oauth2"],
  pythonCode: `import jwt, time

SECRET = "your-256-bit-secret"

# 1. Generate JWT (on login)
def create_token(user_id):
    payload = {
        "sub": str(user_id),          # subject
        "iat": int(time.time()),       # issued at
        "exp": int(time.time()) + 3600,  # expires in 1h
        "role": "user"
    }
    token = jwt.encode(payload, SECRET, algorithm="HS256")
    return token  # "eyJhbGci...header.payload.signature"

# 2. Token structure (Base64URL encoded, NOT encrypted)
# Header:  {"alg": "HS256", "typ": "JWT"}
# Payload: {"sub":"123","iat":...,"exp":...,"role":"user"}
# Signature: HMAC-SHA256(base64(header)+"."+base64(payload), SECRET)

# 3. Verify JWT (on each request)
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload  # valid
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Token expired")
    except jwt.InvalidTokenError:
        raise Unauthorized("Invalid token")`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const header = '{"alg":"HS256","typ":"JWT"}';
    const payload = '{"sub":"123","role":"user","exp":+3600}';

    steps.push({
      stepNumber: 1,
      description: 'JWT structure: Header.Payload.Signature. All Base64URL encoded. NOT encrypted (can be decoded) — signature ensures integrity.',
      highlightLines: [16, 17, 18],
      visualState: {
        type: "array1d",
        cells: [
          { val: "Header", state: "active" as const },
          { val: ".", state: "default" as const },
          { val: "Payload", state: "computed" as const },
          { val: ".", state: "default" as const },
          { val: "Signature", state: "highlighted" as const },
        ],
        label: "JWT = Header.Payload.Signature",
      },
      variables: { format: "eyJ…header.eyJ…payload.signature" },
    });

    steps.push({
      stepNumber: 2,
      description: `Header: ${header}. Algorithm (HS256) and token type.`,
      highlightLines: [16],
      visualState: {
        type: "array1d",
        cells: [{ val: header, state: "active" as const }],
        label: "Header (Base64URL decoded)",
      },
      variables: { alg: "HS256", typ: "JWT" },
    });

    steps.push({
      stepNumber: 3,
      description: `Payload (claims): ${payload}. sub=user ID, role, exp=expiry. NOT secret — visible to anyone.`,
      highlightLines: [7, 8, 9, 10, 11],
      visualState: {
        type: "array1d",
        cells: [{ val: payload, state: "computed" as const }],
        label: "Payload (Base64URL decoded)",
      },
      variables: { sub: "123", role: "user", exp: "+3600s" },
    });

    steps.push({
      stepNumber: 4,
      description: "Signature: HMAC-SHA256(base64(header)+'.'+base64(payload), SECRET). Only server with SECRET can create/verify.",
      highlightLines: [18],
      visualState: {
        type: "array1d",
        cells: [
          { val: "HMAC-SHA256(", state: "default" as const },
          { val: "header+payload,", state: "default" as const },
          { val: "SECRET)", state: "highlighted" as const },
          { val: "= 3m8...xyz", state: "computed" as const },
        ],
        label: "Signature generation",
      },
      variables: { algorithm: "HMAC-SHA256", tamperProof: "changing payload invalidates signature" },
    });

    steps.push({
      stepNumber: 5,
      description: "Verification: recalculate signature from header+payload using SECRET. Match → valid. Check exp timestamp. O(1) — no DB lookup.",
      highlightLines: [21, 22, 23, 24, 25, 26],
      visualState: {
        type: "array1d",
        cells: [
          { val: "1. Decode", state: "default" as const },
          { val: "2. Verify sig", state: "active" as const },
          { val: "3. Check exp", state: "active" as const },
          { val: "✓ VALID", state: "computed" as const },
        ],
        label: "JWT Verification (O(1))",
      },
      variables: { stateless: true, dbLookup: false, verification: "signature match + exp check" },
    });

    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   FIREWALL RULES
═══════════════════════════════════════════════════════════════════════════ */
export const firewallModule: VisualizationModule<null> = {
  id: "firewall", slug: "firewall", title: "Firewall Rules",
  category: ["networks", "network-security"], difficulty: "intermediate",
  timeComplexity: "O(rules)", spaceComplexity: "O(rules + connections)",
  description: "Stateful firewall: match packets against ordered rules (src IP, dst port, protocol). Tracks connection state for reply traffic.",
  relatedTopics: ["nat", "tls-handshake", "ip-addressing"],
  pythonCode: `# Stateful Firewall Rules

# Rules evaluated top-to-bottom, first match wins
rules = [
    # rule: (action, src, dst_port, protocol, state)
    {"action": "ALLOW", "src": "10.0.0.0/8", "dst_port": 443, "proto": "TCP"},
    {"action": "ALLOW", "src": "10.0.0.0/8", "dst_port": 80,  "proto": "TCP"},
    {"action": "ALLOW", "src": "any", "dst_port": 22, "proto": "TCP",
     "src_restrict": "192.168.1.0/24"},
    {"action": "DENY",  "src": "any", "dst_port": 23, "proto": "TCP"},  # Telnet
    {"action": "DENY",  "src": "any", "dst_port": "any", "proto": "any"},  # default deny
]

# Stateful tracking (connection table)
conn_table = {}  # (src_ip, src_port, dst_ip, dst_port) → state

def process_packet(pkt):
    # Check connection table first (reply traffic)
    if (pkt.dst_ip, pkt.dst_port, pkt.src_ip, pkt.src_port) in conn_table:
        return "ALLOW"  # established connection
    # Evaluate rules
    for rule in rules:
        if matches(pkt, rule):
            if rule["action"] == "ALLOW":
                conn_table[pkt.key()] = "ESTABLISHED"
            return rule["action"]`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const rules = [
      { action: "ALLOW", match: "src=10.x.x.x, dst_port=443", desc: "HTTPS from internal network" },
      { action: "ALLOW", match: "src=10.x.x.x, dst_port=80", desc: "HTTP from internal" },
      { action: "ALLOW", match: "src=192.168.1.x, dst_port=22", desc: "SSH from management subnet only" },
      { action: "DENY", match: "dst_port=23", desc: "Block Telnet (unencrypted)" },
      { action: "DENY", match: "any", desc: "Default deny-all" },
    ];

    steps.push({
      stepNumber: 1,
      description: "Firewall: ordered rules matched top-to-bottom. First match wins. Stateful: tracks connections so reply packets auto-allowed.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: rules.map((r) => ({
          val: `${r.action}: ${r.match}`,
          state: r.action === "ALLOW" ? "default" as const : "highlighted" as const,
        })),
        label: "Firewall Rules (ordered)",
      },
      variables: { ruleCount: rules.length, defaultPolicy: "DENY" },
    });

    const packets = [
      { src: "10.0.0.5", dstPort: 443, result: "ALLOW", ruleIdx: 0 },
      { src: "1.2.3.4", dstPort: 22, result: "DENY", ruleIdx: 4 },
      { src: "192.168.1.10", dstPort: 22, result: "ALLOW", ruleIdx: 2 },
      { src: "5.5.5.5", dstPort: 23, result: "DENY", ruleIdx: 3 },
    ];

    for (const pkt of packets) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Packet: src=${pkt.src}, dst_port=${pkt.dstPort}. Matched rule #${pkt.ruleIdx + 1} → ${pkt.result}.`,
        highlightLines: [pkt.ruleIdx + 6, 20, 21, 22, 23],
        visualState: {
          type: "array1d",
          cells: rules.map((r, i) => ({
            val: `${r.action}: ${r.match}`,
            state: i === pkt.ruleIdx ? (pkt.result === "ALLOW" ? "computed" as const : "highlighted" as const)
              : i < pkt.ruleIdx ? "active" as const : "default" as const,
          })),
          label: `Evaluating packet from ${pkt.src}:→${pkt.dstPort}`,
        },
        variables: { src: pkt.src, dstPort: pkt.dstPort, result: pkt.result, matchedRule: pkt.ruleIdx + 1 },
      });
    }

    return steps;
  },
};
