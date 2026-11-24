/**
 * create command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"custom-metadata": {
			kind: "parsed",
			brief:
				'Unique key/value metadata for this hostname. These are per-hostname (customer) settings. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"custom-origin-server": {
			kind: "parsed",
			brief:
				"a valid hostname that’s been added to your DNS zone as an A, AAAA, or CNAME record.",
			optional: true,
			parse: String,
		},
		"custom-origin-sni": {
			kind: "parsed",
			brief:
				"A hostname that will be sent to your custom origin server as SNI for TLS handshake. This can be a valid subdomain of the zone or custom origin server name or the string ':request_host_header:' which will cause the host header in the request to be used as SNI. Not configurable with default/fallback origin server.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "The custom hostname that will point to your hostname via CNAME.",
			optional: true,
			parse: String,
		},
		"ssl-bundle-method": {
			kind: "parsed",
			brief:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			optional: true,
			choices: ["ubiquitous", "optimal", "force"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-bundle-method", "text"),
		},
		"ssl-certificate-authority": {
			kind: "parsed",
			brief: "The Certificate Authority that will issue the certificate.",
			optional: true,
			choices: ["digicert", "google", "lets_encrypt", "ssl_com"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-certificate-authority", "text"),
		},
		"ssl-cloudflare-branding": {
			kind: "boolean",
			brief:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
			optional: true,
		},
		"ssl-custom-cert-bundle": {
			kind: "parsed",
			brief:
				'Array of custom certificate and key pairs (1 or 2 pairs allowed). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"custom_certificate": string, "custom_key": string}].',
			optional: true,
			parse: String,
		},
		"ssl-custom-certificate": {
			kind: "parsed",
			brief: "If a custom uploaded certificate is used.",
			optional: true,
			parse: String,
		},
		"ssl-custom-csr-id": {
			kind: "parsed",
			brief: "The identifier for the Custom CSR that was used.",
			optional: true,
			parse: String,
		},
		"ssl-custom-key": {
			kind: "parsed",
			brief: "The key for a custom uploaded certificate.",
			optional: true,
			parse: String,
		},
		"ssl-method": {
			kind: "parsed",
			brief: "Domain control validation (DCV) method used for this hostname.",
			optional: true,
			choices: ["http", "txt", "email"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ssl-method", "text"),
		},
		"ssl-settings-ciphers": {
			kind: "parsed",
			brief:
				"An allowlist of ciphers for TLS termination. These ciphers must be in the BoringSSL format.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ssl-settings-early-hints": {
			kind: "parsed",
			brief: "Whether or not Early Hints is enabled.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-early-hints", "text"),
		},
		"ssl-settings-http2": {
			kind: "parsed",
			brief: "Whether or not HTTP2 is enabled.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-http2", "text"),
		},
		"ssl-settings-min-tls-version": {
			kind: "parsed",
			brief: "The minimum TLS version supported.",
			optional: true,
			choices: ["1.0", "1.1", "1.2", "1.3"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-min-tls-version", "text"),
		},
		"ssl-settings-tls-1-3": {
			kind: "parsed",
			brief: "Whether or not TLS 1.3 is enabled.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ssl-settings-tls-1-3", "text"),
		},
		"ssl-type": {
			kind: "parsed",
			brief:
				"Level of validation to be used for this hostname. Domain validation (dv) must be used.",
			optional: true,
			choices: ["dv"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ssl-type", "text"),
		},
		"ssl-wildcard": {
			kind: "boolean",
			brief: "Indicates whether the certificate covers a wildcard.",
			optional: true,
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Custom Hostname",
	usage:
		"$0 custom-hostnames create\n\nAdd a new custom hostname and request that an SSL certificate be issued for it. One of three validation methods—http, txt, email—should be used, with 'http' recommended if the CNAME is already in place (or will be soon). Specifying 'email' will send an email to the WHOIS contacts on file for the base domain plus hostmaster, postmaster, webmaster, admin, administrator. If http is used and the domain is not already pointing to the Managed CNAME host, the PATCH method must be used once it is (to complete validation). Enable bundling of certificates using the custom_cert_bundle field. The bundling process requires the following condition One certificate in the bundle must use an RSA, and the other must use an ECDSA.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
