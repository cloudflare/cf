/**
 * delete command
 * @generated from apis/overlays/page-rules.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "pagerule-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <pagerule-id>",
	describe: "Delete a Page Rule",
	usage: "$0 page-rules delete <pagerule-id>\n\nDeletes an existing Page Rule.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
