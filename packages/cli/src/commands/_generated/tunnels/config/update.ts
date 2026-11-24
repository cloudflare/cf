/**
 * update command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tunnel-config-ingress": {
			kind: "parsed",
			brief:
				'List of public hostname definitions. At least one ingress rule needs to be defined for the tunnel. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"hostname": string, "service": string, "originRequest"?: {...}, "path"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-access-aud-tag": {
			kind: "parsed",
			brief:
				"Access applications that are allowed to reach this hostname for this Tunnel. Audience tags can be identified in the dashboard or via the List Access policies API.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-access-required": {
			kind: "boolean",
			brief: "Deny traffic that has not fulfilled Access authorization.",
			optional: true,
		},
		"tunnel-config-origin-request-access-team-name": {
			kind: "parsed",
			brief: "The config.originRequest.access.teamName field",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-ca-pool": {
			kind: "parsed",
			brief:
				"Path to the certificate authority (CA) for the certificate of your origin. This option should be used only if your certificate is not signed by Cloudflare.",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-connect-timeout": {
			kind: "parsed",
			brief:
				"Timeout for establishing a new TCP connection to your origin server. This excludes the time taken to establish TLS, which is controlled by tlsTimeout.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-disable-chunked-encoding": {
			kind: "boolean",
			brief:
				"Disables chunked transfer encoding. Useful if you are running a WSGI server.",
			optional: true,
		},
		"tunnel-config-origin-request-http2origin": {
			kind: "boolean",
			brief:
				"Attempt to connect to origin using HTTP2. Origin must be configured as https.",
			optional: true,
		},
		"tunnel-config-origin-request-http-host-header": {
			kind: "parsed",
			brief: "Sets the HTTP Host header on requests sent to the local service.",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-keep-alive-connections": {
			kind: "parsed",
			brief:
				"Maximum number of idle keepalive connections between Tunnel and your origin. This does not restrict the total number of concurrent connections.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-keep-alive-timeout": {
			kind: "parsed",
			brief:
				"Timeout after which an idle keepalive connection can be discarded.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-match-snito-host": {
			kind: "boolean",
			brief: "Auto configure the Hostname on the origin server certificate.",
			optional: true,
		},
		"tunnel-config-origin-request-no-happy-eyeballs": {
			kind: "boolean",
			brief:
				"Disable the “happy eyeballs” algorithm for IPv4/IPv6 fallback if your local network has misconfigured one of the protocols.",
			optional: true,
		},
		"tunnel-config-origin-request-no-tlsverify": {
			kind: "boolean",
			brief:
				"Disables TLS verification of the certificate presented by your origin. Will allow any certificate from the origin to be accepted.",
			optional: true,
		},
		"tunnel-config-origin-request-origin-server-name": {
			kind: "parsed",
			brief:
				"Hostname that cloudflared should expect from your origin server certificate.",
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-proxy-type": {
			kind: "parsed",
			brief:
				'cloudflared starts a proxy server to translate HTTP traffic into TCP when proxying, for example, SSH or RDP. This configures what type of proxy will be started. Valid options are: "" for the regular proxy and "socks" for a SOCKS5 proxy.\n',
			optional: true,
			parse: String,
		},
		"tunnel-config-origin-request-tcp-keep-alive": {
			kind: "parsed",
			brief:
				"The timeout after which a TCP keepalive packet is sent on a connection between Tunnel and the origin server.",
			optional: true,
			parse: Number,
		},
		"tunnel-config-origin-request-tls-timeout": {
			kind: "parsed",
			brief:
				"Timeout for completing a TLS handshake to your origin server, if you have chosen to connect Tunnel to an HTTPS server.",
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
	operands: [
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"tunnel-config-origin-request-access-aud-tag",
				"tunnel-config-origin-request-access-required",
				"tunnel-config-origin-request-access-team-name",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"tunnel-config-origin-request-access-aud-tag",
					"tunnel-config-origin-request-access-team-name",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --tunnel-config-origin-request-access-aud-tag, --tunnel-config-origin-request-access-required, --tunnel-config-origin-request-access-team-name is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <tunnel-id>",
	describe: "Update Tunnel configuration",
	usage:
		"$0 tunnels config update <tunnel-id>\n\nReplaces the configuration for a remotely managed Cloudflare Tunnel, including its ingress rules and origin request settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
