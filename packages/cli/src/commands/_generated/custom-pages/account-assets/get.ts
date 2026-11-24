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
		{
			placeholder: "asset-name",
			brief:
				"The unique name of the custom asset. Can only contain letters (A-Z, a-z), numbers (0-9), and underscores (_).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <asset-name>",
	describe: "Get a custom asset",
	usage:
		"$0 custom-pages account-assets get <asset-name>\n\nReturns a custom asset for an account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
