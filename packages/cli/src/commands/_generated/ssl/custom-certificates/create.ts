/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"bundle-method": {
			kind: "parsed",
			brief:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			default: "ubiquitous",
			choices: ["ubiquitous", "optimal", "force"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "bundle-method", "text"),
		},
		certificate: {
			kind: "parsed",
			brief:
				"The zone's SSL certificate or certificate and the intermediate(s).",
			optional: true,
			parse: String,
		},
		"custom-csr-id": {
			kind: "parsed",
			brief: "The identifier for the Custom CSR that was used.",
			optional: true,
			parse: String,
		},
		deploy: {
			kind: "parsed",
			brief:
				"The environment to deploy the certificate to, defaults to production.",
			default: "production",
			choices: ["staging", "production"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "deploy", "text"),
		},
		"geo-restrictions-label": {
			kind: "parsed",
			brief: "The geo_restrictions.label field",
			optional: true,
			choices: ["us", "eu", "highest_security"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "geo-restrictions-label", "text"),
		},
		policy: {
			kind: "parsed",
			brief:
				'Specify the policy that determines the region where your private key will be held locally. HTTPS connections to any excluded data center will still be fully encrypted, but will incur some latency while Keyless SSL is used to complete the handshake with the nearest allowed data center. Any combination of countries, specified by their two letter country code (https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) can be chosen, such as \'country: IN\', as well as \'region: EU\' which refers to the EU region. If there are too few data centers satisfying the policy, it will be rejected.\nNote: The API accepts this field as either "policy" or "policy_restrictions" in requests. Responses return this field as "policy_restrictions".',
			optional: true,
			parse: String,
		},
		"private-key": {
			kind: "parsed",
			brief:
				"The zone's private key. Not required if custom_csr_id is provided, in which case the private key is retrieved from the CSR record held by Cloudflare.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"The type 'legacy_custom' enables support for legacy clients which do not include SNI in the TLS handshake.",
			default: "legacy_custom",
			choices: ["legacy_custom", "sni_custom"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	describe: "Create SSL Configuration",
	usage:
		"$0 ssl custom-certificates create\n\nUpload a new SSL certificate for a zone.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
