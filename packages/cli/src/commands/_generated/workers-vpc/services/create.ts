/**
 * create command
 * @generated from apis/overlays/workers-vpc.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"host-ipv4": {
			kind: "parsed",
			brief: "The host.ipv4 field",
			optional: true,
			parse: String,
		},
		"host-network-tunnel-id": {
			kind: "parsed",
			brief: "The host.network.tunnel_id field",
			optional: true,
			parse: String,
		},
		"host-ipv6": {
			kind: "parsed",
			brief: "The host.ipv6 field",
			optional: true,
			parse: String,
		},
		"host-hostname": {
			kind: "parsed",
			brief: "The host.hostname field",
			optional: true,
			parse: String,
		},
		"host-resolver-network-resolver-ips": {
			kind: "parsed",
			brief: "The host.resolver_network.resolver_ips field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"host-resolver-network-tunnel-id": {
			kind: "parsed",
			brief: "The host.resolver_network.tunnel_id field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"tls-settings-cert-verification-mode": {
			kind: "parsed",
			brief:
				'TLS certificate verification mode for the connection to the origin.\n\n- `"verify_full"` — verify certificate chain and hostname (default)\n- `"verify_ca"` — verify certificate chain only, skip hostname check\n- `"disabled"` — do not verify the server certificate at all\n\n`disabled` cannot be combined with `certificate_authority`: a custom CA is\nonly used to verify the server certificate.',
			optional: true,
			parse: String,
		},
		"tls-settings-certificate-authority": {
			kind: "parsed",
			brief: "UUID of the custom CA certificate or chain.",
			optional: true,
			parse: String,
		},
		"tls-settings-client-certificate": {
			kind: "parsed",
			brief: "UUID of the mTLS client certificate and private key.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["tcp", "http"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"http-port": {
			kind: "parsed",
			brief: "The http_port field",
			optional: true,
			parse: Number,
		},
		"https-port": {
			kind: "parsed",
			brief: "The https_port field",
			optional: true,
			parse: Number,
		},
		"app-protocol": {
			kind: "parsed",
			brief: "The app_protocol field",
			optional: true,
			choices: ["postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "app-protocol", "text"),
		},
		"tcp-port": {
			kind: "parsed",
			brief: "The tcp_port field",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.conflicts("host-ipv4", [
			"host-hostname",
			"host-resolver-network-resolver-ips",
			"host-resolver-network-tunnel-id",
		]);
		rules.implies("host-ipv4", ["host-network-tunnel-id"]);
		rules.conflicts("host-network-tunnel-id", [
			"host-hostname",
			"host-resolver-network-resolver-ips",
			"host-resolver-network-tunnel-id",
		]);
		rules.conflicts("host-ipv6", [
			"host-hostname",
			"host-resolver-network-resolver-ips",
			"host-resolver-network-tunnel-id",
		]);
		rules.implies("host-ipv6", ["host-network-tunnel-id"]);
		rules.conflicts("host-hostname", [
			"host-ipv4",
			"host-network-tunnel-id",
			"host-ipv6",
		]);
		rules.implies("host-hostname", ["host-resolver-network-tunnel-id"]);
		rules.conflicts("host-resolver-network-resolver-ips", [
			"host-ipv4",
			"host-network-tunnel-id",
			"host-ipv6",
		]);
		rules.implies("host-resolver-network-resolver-ips", [
			"host-hostname",
			"host-resolver-network-tunnel-id",
		]);
		rules.conflicts("host-resolver-network-tunnel-id", [
			"host-ipv4",
			"host-network-tunnel-id",
			"host-ipv6",
		]);
		rules.implies("host-resolver-network-tunnel-id", ["host-hostname"]);
		rules.implies("tls-settings-certificate-authority", [
			"tls-settings-cert-verification-mode",
		]);
		rules.implies("tls-settings-client-certificate", [
			"tls-settings-cert-verification-mode",
		]);
		rules.conflicts("http-port", ["app-protocol", "tcp-port"]);
		rules.conflicts("https-port", ["app-protocol", "tcp-port"]);
		rules.conflicts("app-protocol", ["http-port", "https-port"]);
		rules.conflicts("tcp-port", ["http-port", "https-port"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Workers VPC connectivity service",
	usage:
		"$0 workers-vpc services create\n\nCreates a new Workers VPC connectivity service in the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
