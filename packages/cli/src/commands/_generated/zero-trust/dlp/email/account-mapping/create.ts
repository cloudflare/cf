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
		"auth-requirements-allowed-microsoft-organizations": {
			kind: "parsed",
			brief: "The auth_requirements.allowed_microsoft_organizations field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"auth-requirements-type": {
			kind: "parsed",
			brief: "The auth_requirements.type field",
			optional: true,
			choices: ["Org", "NoAuth"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "auth-requirements-type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Account mapping.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create mapping",
	usage:
		"$0 zero-trust dlp email account-mapping create\n\nCreates a mapping between a Cloudflare account and an email provider for DLP email scanning integration.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
