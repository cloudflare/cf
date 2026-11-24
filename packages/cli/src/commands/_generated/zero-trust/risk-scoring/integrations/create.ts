/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"integration-type": {
			kind: "parsed",
			brief: "The integration_type field",
			optional: true,
			choices: ["Okta"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "integration-type", "text"),
		},
		"reference-id": {
			kind: "parsed",
			brief:
				"A reference id that can be supplied by the client. Currently this should be set to the Access-Okta IDP ID (a UUIDv4).\nhttps://developers.cloudflare.com/api/operations/access-identity-providers-get-an-access-identity-provider",
			optional: true,
			parse: String,
		},
		"tenant-url": {
			kind: "parsed",
			brief: 'The base url of the tenant, e.g. "https://tenant.okta.com".',
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
	describe: "Create new risk score integration.",
	usage:
		"$0 zero-trust risk-scoring integrations create\n\nCreates a new Zero Trust risk score integration, connecting external risk signals to Cloudflare's risk scoring system.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
