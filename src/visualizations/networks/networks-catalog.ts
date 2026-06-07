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
   REMAINING PLACEHOLDERS
═══════════════════════════════════════════════════════════════════════════ */
export const fourWayTerminationModule = createPlaceholderModule(
  "four-way-termination", "four-way-termination", "TCP 4-Way Termination",
  ["networks", "tcp-ip"], "beginner",
);
export const tcpCongestionModule = createPlaceholderModule(
  "tcp-congestion", "tcp-congestion", "TCP Congestion Control",
  ["networks", "tcp-ip"], "intermediate",
);
export const tcpFlowControlModule = createPlaceholderModule(
  "tcp-flow-control", "tcp-flow-control", "TCP Flow Control",
  ["networks", "tcp-ip"], "intermediate",
);
export const dhcpModule = createPlaceholderModule(
  "dhcp", "dhcp", "DHCP",
  ["networks", "application-layer"], "beginner",
);
export const smtpModule = createPlaceholderModule(
  "smtp", "smtp", "SMTP",
  ["networks", "application-layer"], "beginner",
);
export const websocketModule = createPlaceholderModule(
  "websocket", "websocket", "WebSocket Handshake",
  ["networks", "application-layer"], "intermediate",
);
export const ipAddressingModule = createPlaceholderModule(
  "ip-addressing", "ip-addressing", "IP Addressing & Subnetting",
  ["networks", "network-layer"], "intermediate",
);
export const natModule = createPlaceholderModule(
  "nat", "nat", "NAT",
  ["networks", "network-layer"], "intermediate",
);
export const ospfModule = createPlaceholderModule(
  "ospf", "ospf", "OSPF Routing",
  ["networks", "network-layer"], "advanced",
);
export const bgpModule = createPlaceholderModule(
  "bgp", "bgp", "BGP",
  ["networks", "network-layer"], "advanced",
);
export const ripModule = createPlaceholderModule(
  "rip", "rip", "RIP",
  ["networks", "network-layer"], "intermediate",
);
export const arpModule = createPlaceholderModule(
  "arp", "arp", "ARP",
  ["networks", "data-link-layer"], "beginner",
);
export const csmaCdModule = createPlaceholderModule(
  "csma-cd", "csma-cd", "CSMA/CD",
  ["networks", "data-link-layer"], "intermediate",
);
export const ethernetFrameModule = createPlaceholderModule(
  "ethernet-frame", "ethernet-frame", "Ethernet Frame",
  ["networks", "data-link-layer"], "beginner",
);
export const tlsHandshakeModule = createPlaceholderModule(
  "tls-handshake", "tls-handshake", "TLS/SSL Handshake",
  ["networks", "network-security"], "intermediate",
);
export const jwtModule = createPlaceholderModule(
  "jwt", "jwt", "JWT Lifecycle",
  ["networks", "network-security"], "beginner",
);
export const firewallModule = createPlaceholderModule(
  "firewall", "firewall", "Firewall Rules",
  ["networks", "network-security"], "intermediate",
);
