import { createPlaceholderModule } from "@/visualizations/placeholder";

// TCP/IP
export const threeWayHandshakeModule = createPlaceholderModule(
  "three-way-handshake", "three-way-handshake", "TCP 3-Way Handshake",
  ["networks", "tcp-ip"], "beginner",
);
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

// Application Layer
export const httpLifecycleModule = createPlaceholderModule(
  "http-lifecycle", "http-lifecycle", "HTTP / HTTPS Lifecycle",
  ["networks", "application-layer"], "beginner",
);
export const dnsResolutionModule = createPlaceholderModule(
  "dns-resolution", "dns-resolution", "DNS Resolution",
  ["networks", "application-layer"], "beginner",
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

// Network Layer
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

// Data Link Layer
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

// Network Security
export const tlsHandshakeModule = createPlaceholderModule(
  "tls-handshake", "tls-handshake", "TLS/SSL Handshake",
  ["networks", "network-security"], "intermediate",
);
export const oauth2Module = createPlaceholderModule(
  "oauth2", "oauth2", "OAuth 2.0 Flow",
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
