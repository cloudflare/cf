/**
 * update command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"search-engine-crawler-bypass": {
			kind: "boolean",
			brief:
				"Whether to allow verified search engine crawlers to bypass all waiting rooms on this zone.\nVerified search engine crawlers will not be tracked or counted by the waiting room system,\nand will not appear in waiting room analytics.\n",
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
	command: "update",
	describe: "Update zone-level Waiting Room settings",
	usage:
		"$0 waiting-rooms settings update\n\nReplace zone-level Waiting Room settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
