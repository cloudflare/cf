/**
 * stats command
 * @generated from apis/overlays/images.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "stats",
	describe: "Images usage statistics",
	usage:
		"$0 images stats\n\nFetch image statistics details for Cloudflare Images. The returned statistics detail storage usage, including the current image count vs this account's allowance.",
	...parameters,
	loader: () => import("./stats.handler.js"),
});

export default command;
