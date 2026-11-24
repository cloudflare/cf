/**
 * update command
 * @generated from apis/overlays/custom-pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		state: {
			kind: "parsed",
			brief: "The custom page state.",
			optional: true,
			choices: ["default", "customized"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "state", "text"),
		},
		url: {
			kind: "parsed",
			brief: "The URL associated with the custom page.",
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
	operands: [
		{ placeholder: "identifier", brief: "Custom page type.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <identifier>",
	describe: "Update a custom page",
	usage:
		"$0 custom-pages account-custom-pages update <identifier>\n\nUpdates the configuration for a custom page type.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
