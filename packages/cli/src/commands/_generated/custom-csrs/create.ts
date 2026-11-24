/**
 * create command
 * @generated from apis/overlays/custom-csrs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"common-name": {
			kind: "parsed",
			brief:
				"The common name (domain) for the CSR. Must be at most 64 characters.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "Two-letter ISO 3166-1 alpha-2 country code.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional description for the CSR.",
			optional: true,
			parse: String,
		},
		"key-type": {
			kind: "parsed",
			brief:
				"Key algorithm to use for the CSR. Defaults to rsa2048 if not specified.",
			default: "rsa2048",
			choices: ["rsa2048", "p256v1"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "key-type", "text"),
		},
		locality: {
			kind: "parsed",
			brief: "City or locality name.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name for the CSR.",
			optional: true,
			parse: String,
		},
		organization: {
			kind: "parsed",
			brief: "Organization name.",
			optional: true,
			parse: String,
		},
		"organizational-unit": {
			kind: "parsed",
			brief: "Organizational unit name.",
			optional: true,
			parse: String,
		},
		sans: {
			kind: "parsed",
			brief:
				"Subject Alternative Names for the CSR. At least one SAN is required.",
			variadic: true,
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "State or province name.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating a custom CSR.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Custom CSR",
	usage:
		"$0 custom-csrs create\n\nGenerate a new custom Certificate Signing Request (CSR) for an account or zone. Cloudflare generates and securely stores the private key associated with the CSR.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
