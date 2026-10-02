import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { CommandModule } from "yargs";
/**
 * Generated CLI commands
 * @generated
 */
import { lazyCommand } from "#lib/lazy-command.js";

export interface GeneratedCommand {
	command: CommandModule<CommonYargsOptions>;
	hideCommand: boolean;
}

export const generatedCommands: GeneratedCommand[] = [
	{
		command: lazyCommand<CommonYargsOptions>(
			"abuse-reports",
			"Submit and track abuse reports for phishing, malware, and other policy violations on Cloudflare-proxied sites",
			() => import("./abuse-reports/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"access",
			"Access protected applications and services",
			() => import("./access/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"account-tags",
			"account-tags",
			() => import("./account-tags/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"accounts",
			"Account settings, members, roles, subscriptions, and API tokens for your Cloudflare account",
			() => import("./accounts/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"acm",
			"acm",
			() => import("./acm/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"addressing",
			"addressing",
			() => import("./addressing/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"agent-memory",
			"agent-memory",
			() => import("./agent-memory/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ai",
			"ai",
			() => import("./ai/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ai-audit",
			"ai-audit",
			() => import("./ai-audit/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ai-gateway",
			"Proxy, cache, rate-limit, and observe requests to AI providers — OpenAI, Anthropic, Workers AI, and more",
			() => import("./ai-gateway/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ai-search",
			"Managed search-as-a-service: crawl, index, and query content with AI-powered relevance and chat completions",
			() => import("./ai-search/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ai-security",
			"Detect prompt injection, PII, and unsafe topics in traffic to your AI applications",
			() => import("./ai-security/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"alerting",
			"alerting",
			() => import("./alerting/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"alerts",
			"alerts",
			() => import("./alerts/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"analytics",
			"Zone-level traffic analytics — dashboard summaries, per-colo breakdowns, and Argo latency metrics",
			() => import("./analytics/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"analytics_engine",
			"analytics_engine",
			() => import("./analytics_engine/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"api-security",
			"api-security",
			() => import("./api-security/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"argo",
			"Network optimization features that speed up and improve reliability of traffic to your origins",
			() => import("./argo/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"artifacts",
			"artifacts",
			() => import("./artifacts/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"audit-logs",
			"audit-logs",
			() => import("./audit-logs/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"autorag",
			"autorag",
			() => import("./autorag/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"basin-catalog",
			"Iceberg-compatible data catalog for R2 — organize objects into tables and namespaces for SQL query engines",
			() => import("./basin-catalog/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"billing",
			"Account billing profiles and usage data for Cloudflare subscriptions and add-on services",
			() => import("./billing/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"bot-management",
			"bot-management",
			() => import("./bot-management/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"botnet-feed",
			"Botnet threat intelligence feeds — IP and ASN-level data on known command-and-control infrastructure",
			() => import("./botnet-feed/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"brand-protection",
			"brand-protection",
			() => import("./brand-protection/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"brands",
			"brands",
			() => import("./brands/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"browser-extension",
			"browser-extension",
			() => import("./browser-extension/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"browser-run",
			"browser-run",
			() => import("./browser-run/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"builds",
			"Build and deploy Workers from connected repositories, then inspect build status and logs.",
			() => import("./builds/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"cache",
			"Purge cached content and configure Cache Reserve, tiered caching, and variant serving",
			() => import("./cache/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"certificate-authorities",
			"certificate-authorities",
			() => import("./certificate-authorities/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"clear",
			"clear",
			() => import("./clear/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"client-certificates",
			"client-certificates",
			() => import("./client-certificates/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"client-side-security",
			"Client-Side Security — monitor JavaScript, connections, and cookies on your pages for supply-chain attacks",
			() => import("./client-side-security/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"cloud-connector",
			"Route traffic from Cloudflare directly to cloud provider services (AWS, Azure, GCP) without origin servers",
			() => import("./cloud-connector/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"cloudforce-one",
			"Detection rule management APIs",
			() => import("./cloudforce-one/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"connector-interrupts",
			"connector-interrupts",
			() => import("./connector-interrupts/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"connector-telemetry-events",
			"connector-telemetry-events",
			() => import("./connector-telemetry-events/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"connector-telemetry-events-latest",
			"connector-telemetry-events-latest",
			() => import("./connector-telemetry-events-latest/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"connector-telemetry-snapshots",
			"connector-telemetry-snapshots",
			() => import("./connector-telemetry-snapshots/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"connector-telemetry-snapshots-latest",
			"connector-telemetry-snapshots-latest",
			() => import("./connector-telemetry-snapshots-latest/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"connectors",
			"connectors",
			() => import("./connectors/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"containers",
			"Deploy and manage Containers applications on Cloudflare's global network",
			() => import("./containers/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"content-scan",
			"Malicious uploads detection, scan uploaded content in HTTP requests for malware and malicious payloads",
			() => import("./content-scan/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"cps",
			"cps",
			() => import("./cps/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"csamScanner",
			"csamScanner",
			() => import("./csamScanner/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ct-alerting",
			"ct-alerting",
			() => import("./ct-alerting/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"custom-certificates",
			"custom-certificates",
			() => import("./custom-certificates/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"custom-csrs",
			"custom-csrs",
			() => import("./custom-csrs/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"custom-hostnames",
			"custom-hostnames",
			() => import("./custom-hostnames/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"custom-nameservers",
			"custom-nameservers",
			() => import("./custom-nameservers/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"custom-pages",
			"Manage custom error and challenge pages and their assets for accounts and zones",
			() => import("./custom-pages/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"d1",
			"D1 is Cloudflare's managed, serverless database with SQLite's SQL semantics, built-in disaster recovery, and Worker and HTTP API access.",
			() => import("./d1/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"dcv-delegation",
			"dcv-delegation",
			() => import("./dcv-delegation/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"diagnostics",
			"Network diagnostic tools — traceroutes from Cloudflare's edge and endpoint health checks",
			() => import("./diagnostics/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"dls",
			"dls",
			() => import("./dls/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"dns",
			"dns",
			() => import("./dns/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"dns-firewall",
			"dns-firewall",
			() => import("./dns-firewall/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"domain-info",
			"domain-info",
			() => import("./domain-info/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"durable-objects",
			"durable-objects",
			() => import("./durable-objects/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"email-auth",
			"email-auth",
			() => import("./email-auth/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"email-routing",
			"Route incoming email to verified destination addresses or Workers with routing rules, catch-all behavior, and managed DNS records",
			() => import("./email-routing/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"email-security",
			"Cloud email security — investigate threats, manage allow/block policies, and detect phishing",
			() => import("./email-security/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"email-sending",
			"Send transactional email and manage sending subdomains and their DNS configuration",
			() => import("./email-sending/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"fieldExtractors",
			"fieldExtractors",
			() => import("./fieldExtractors/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"firewall",
			"Legacy firewall rules, zone lockdowns, access rules, user-agent blocking, and WAF packages",
			() => import("./firewall/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"flagship",
			"flagship",
			() => import("./flagship/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"fraud",
			"fraud",
			() => import("./fraud/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"google-tag-gateway",
			"Google Tag Gateway operations",
			() => import("./google-tag-gateway/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"health",
			"health",
			() => import("./health/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"healthchecks",
			"Standalone health checks that monitor origin server availability from Cloudflare's edge",
			() => import("./healthchecks/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"hostnames",
			"hostnames",
			() => import("./hostnames/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"hyperdrive",
			"Accelerate access to existing databases by caching queries and pooling connections at the edge",
			() => import("./hyperdrive/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"iam",
			"Identity and access management — permission groups, resource groups, user groups, and SSO connectors",
			() => import("./iam/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"images",
			"Store, resize, and deliver optimized images globally — variants, signing keys, and direct uploads",
			() => import("./images/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"intel",
			"Threat intelligence lookups — IP reputation, domain info, ASN details, WHOIS, and indicator feeds",
			() => import("./intel/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"internal",
			"internal",
			() => import("./internal/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ips",
			"ips",
			() => import("./ips/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"k2",
			"Durable, ordered event streams that you produce records to and consume from with subscriptions",
			() => import("./k2/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"keyless-certificates",
			"keyless-certificates",
			() => import("./keyless-certificates/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"keys",
			"keys",
			() => import("./keys/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"kv",
			"kv",
			() => import("./kv/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"leaked-credential-checks",
			"Detect compromised credentials in login requests by checking against known breach databases",
			() => import("./leaked-credential-checks/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"live",
			"live",
			() => import("./live/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"load-balancers",
			"Distribute traffic across origin pools with health monitoring, geo-steering, and failover",
			() => import("./load-balancers/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"logo-matches",
			"logo-matches",
			() => import("./logo-matches/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"logos",
			"logos",
			() => import("./logos/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"logpush",
			"logpush",
			() => import("./logpush/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"logs",
			"Log control, retention, and raw log access — CMB config, ray ID lookups, and received fields",
			() => import("./logs/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"magic-cloud-networking",
			"magic-cloud-networking",
			() => import("./magic-cloud-networking/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"magic-network-monitoring",
			"Flow-based network traffic monitoring with configurable alerting rules and VPC flow ingestion",
			() => import("./magic-network-monitoring/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"magic-transit",
			"DDoS-protected network transit — GRE/IPsec tunnels, static routes, Magic WAN sites, connectors, and packet captures",
			() => import("./magic-transit/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"managed-defense",
			"managed-defense",
			() => import("./managed-defense/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"managed-transforms",
			"managed-transforms",
			() => import("./managed-transforms/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"matches",
			"matches",
			() => import("./matches/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"mcp",
			"mcp",
			() => import("./mcp/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"mesh",
			"mesh",
			() => import("./mesh/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"monetization",
			"monetization",
			() => import("./monetization/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"mtls-certificates",
			"mtls-certificates",
			() => import("./mtls-certificates/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"network",
			"network",
			() => import("./network/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"network-interconnects",
			"Physical and virtual private interconnects between your infrastructure and Cloudflare's network",
			() => import("./network-interconnects/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"oauth-clients",
			"oauth-clients",
			() => import("./oauth-clients/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"oauth-scopes",
			"oauth-scopes",
			() => import("./oauth-scopes/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"observability",
			"observability",
			() => import("./observability/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"organization",
			"organization",
			() => import("./organization/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"organizations",
			"Multi-user organizations that group accounts, members, and shared settings under a single entity",
			() => import("./organizations/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"origin-ca-certificates",
			"origin-ca-certificates",
			() => import("./origin-ca-certificates/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"origin-post-quantum-encryption",
			"Enable post-quantum key exchange for connections between Cloudflare and your origin server",
			() => import("./origin-post-quantum-encryption/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"origin-tls-client-auth",
			"origin-tls-client-auth",
			() => import("./origin-tls-client-auth/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"page-rules",
			"page-rules",
			() => import("./page-rules/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"pages",
			"Full-stack application hosting with Git-integrated builds, preview deployments, and custom domains",
			() => import("./pages/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"pay-per-crawl",
			"pay-per-crawl",
			() => import("./pay-per-crawl/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"pay-per-use",
			"pay-per-use",
			() => import("./pay-per-use/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"pipelines",
			"Ingest, transform, and route event streams into R2, analytics, or other destinations in real time",
			() => import("./pipelines/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"precursor",
			"Precursor settings for a zone",
			() => import("./precursor/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"queries",
			"queries",
			() => import("./queries/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"queues",
			"Reliable message queuing between Workers — produce, consume, and batch-process messages at scale",
			() => import("./queues/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"r2",
			"S3-compatible object storage with zero egress fees — buckets, lifecycle rules, event notifications, and data migration",
			() => import("./r2/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"r2-data-catalog",
			"Iceberg-compatible data catalog for R2 — organize objects into tables and namespaces for SQL query engines",
			() => import("./r2-data-catalog/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"radar",
			"Internet-wide traffic intelligence — BGP, DNS, HTTP trends, attack data, and network quality insights",
			() => import("./radar/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"rate-limit-analytics",
			"rate-limit-analytics",
			() => import("./rate-limit-analytics/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"rate-limits",
			"Legacy per-zone rate limiting rules — prefer Advanced Rate Limiting in Rulesets for new configurations",
			() => import("./rate-limits/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ready",
			"ready",
			() => import("./ready/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"realtime",
			"Real-time audio, video, and data services on Cloudflare's global network",
			() => import("./realtime/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"recent-submissions",
			"recent-submissions",
			() => import("./recent-submissions/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"refute",
			"refute",
			() => import("./refute/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"registrar",
			"registrar",
			() => import("./registrar/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"registrar-sandbox",
			"registrar-sandbox",
			() => import("./registrar-sandbox/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"reporting",
			"reporting",
			() => import("./reporting/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"request-tracers",
			"Trace how a request would be processed through Cloudflare's rules and configuration pipeline",
			() => import("./request-tracers/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"resource-sharing",
			"Share Cloudflare resources (zones, accounts) across organizations with granular access controls",
			() => import("./resource-sharing/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"resource-tagging",
			"resource-tagging",
			() => import("./resource-tagging/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"rules",
			"Resources used by Cloudflare rules and rulesets",
			() => import("./rules/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"rulesets",
			"rulesets",
			() => import("./rulesets/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"rum",
			"Real User Measurement (Web Analytics) — track page loads, Core Web Vitals, and visitor metrics",
			() => import("./rum/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"scan-logo",
			"scan-logo",
			() => import("./scan-logo/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"scan-page",
			"scan-page",
			() => import("./scan-page/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"scim",
			"SCIM 2.0 provisioning — manage users, groups, and identity provider sync for your account",
			() => import("./scim/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"search",
			"search",
			() => import("./search/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"secrets-store",
			"Centralized secret management — store API keys, tokens, and credentials for use across Workers and other products",
			() => import("./secrets-store/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"security-insights",
			"security-insights",
			() => import("./security-insights/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"security-txt",
			"Manage the /.well-known/security.txt file that tells security researchers how to report vulnerabilities",
			() => import("./security-txt/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"signed-url",
			"signed-url",
			() => import("./signed-url/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"smart-shield",
			"Smart Shield settings, health checks, and cache reserve management",
			() => import("./smart-shield/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"snippets",
			"snippets",
			() => import("./snippets/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"spectrum",
			"Proxy and protect arbitrary TCP/UDP applications through Cloudflare's network with DDoS mitigation",
			() => import("./spectrum/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"speed",
			"Observatory speed tests — run Lighthouse audits, track performance trends, and schedule recurring tests",
			() => import("./speed/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"ssl",
			"SSL/TLS certificate management — certificate packs, Universal SSL, verification, and TLS mode recommendations",
			() => import("./ssl/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"stream",
			"Video encoding, storage, and delivery — upload, live-stream, clip, caption, and embed video at scale",
			() => import("./stream/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"submission-info",
			"submission-info",
			() => import("./submission-info/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"submit",
			"submit",
			() => import("./submit/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"tags",
			"tags",
			() => import("./tags/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"tenant",
			"tenant",
			() => import("./tenant/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"tenant-custom-nameservers",
			"tenant-custom-nameservers",
			() => import("./tenant-custom-nameservers/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"total-queries",
			"total-queries",
			() => import("./total-queries/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"tracked-domains",
			"tracked-domains",
			() => import("./tracked-domains/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"tunnels",
			"tunnels",
			() => import("./tunnels/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"turnstile",
			"CAPTCHA-free bot verification widgets that protect forms and APIs without degrading user experience",
			() => import("./turnstile/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"url-info",
			"url-info",
			() => import("./url-info/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"url-normalization",
			"url-normalization",
			() => import("./url-normalization/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"url-scanner",
			"Scan URLs for phishing, malware, and other threats — submit scans and retrieve detailed results",
			() => import("./url-scanner/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"user",
			"Your Cloudflare user profile, invitations, organizations, billing, and personal API tokens",
			() => import("./user/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"values",
			"values",
			() => import("./values/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"vectorize",
			"Globally distributed vector database for building semantic search, recommendations, and RAG applications on Workers",
			() => import("./vectorize/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"verify",
			"verify",
			() => import("./verify/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"waiting-rooms",
			"Virtual queues that throttle traffic to your site during peak demand with customizable waiting pages",
			() => import("./waiting-rooms/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"web-assets",
			"web-assets",
			() => import("./web-assets/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"web3",
			"web3",
			() => import("./web3/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"workers",
			"workers",
			() => import("./workers/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"workers-builds",
			"workers-builds",
			() => import("./workers-builds/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"workers-for-platforms",
			"workers-for-platforms",
			() => import("./workers-for-platforms/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"workers-vpc",
			"workers-vpc",
			() => import("./workers-vpc/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"workflows",
			"Durable, multi-step workflows that run on Workers with automatic retries and state persistence",
			() => import("./workflows/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"zaraz",
			"Server-side tag manager — load third-party tools (analytics, pixels, etc.) from Cloudflare's edge without client-side JS",
			() => import("./zaraz/index.js"),
			null
		),
		hideCommand: true,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"zero-trust",
			"Cloudflare's SASE platform — secure access, device posture, DLP, tunnels, gateway policies, and network segmentation",
			() => import("./zero-trust/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"zone",
			"zone",
			() => import("./zone/index.js"),
			null
		),
		hideCommand: false,
	},
	{
		command: lazyCommand<CommonYargsOptions>(
			"zones",
			"Zones are domains on Cloudflare — list, create, and configure domain settings",
			() => import("./zones/index.js"),
			null
		),
		hideCommand: false,
	},
];
