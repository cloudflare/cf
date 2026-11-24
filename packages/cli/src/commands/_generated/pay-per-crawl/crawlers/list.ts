/**
 * list command
 * @generated from apis/overlays/pay-per-crawl.ts
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
	command: "list",
	describe: "List pay-per-crawl crawlers",
	usage:
		"$0 pay-per-crawl crawlers list\n\nLists the crawlers known to pay-per-crawl.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
