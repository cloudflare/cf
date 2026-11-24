/**
 * get command
 * @generated from apis/overlays/custom-pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "identifier", brief: "Custom page type.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <identifier>",
	describe: "Get a custom page",
	usage:
		"$0 custom-pages account-custom-pages get <identifier>\n\nReturns the configuration for a custom page type.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
