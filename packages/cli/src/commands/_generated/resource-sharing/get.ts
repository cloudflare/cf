/**
 * get command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"include-resources": {
			kind: "boolean",
			brief: "Include resources in the response.",
			optional: true,
		},
		"include-recipient-counts": {
			kind: "boolean",
			brief: "Include recipient counts in the response.",
			optional: true,
		},
		"include-tags-from": {
			kind: "enum",
			brief:
				"Include share tags in the response. `api` reads tags from the tag service; `mirror` reads a local, eventually consistent replica. If the tag lookup fails, the response omits `tags`.",
			values: ["api", "mirror"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <share-id>",
	describe: "Get account share by ID",
	usage: "$0 resource-sharing get <share-id>\n\nFetches share by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
