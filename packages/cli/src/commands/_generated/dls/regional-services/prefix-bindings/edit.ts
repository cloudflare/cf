/**
 * edit command
 * @generated from apis/overlays/dls.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"region-key": {
			kind: "parsed",
			brief: 'New region key to assign (e.g., "us", "eu", "cfcanary").',
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
		{
			placeholder: "binding-id",
			brief: "Unique identifier for the prefix binding.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <binding-id>",
	describe: "Update a DLS prefix binding",
	usage:
		"$0 dls regional-services prefix-bindings edit <binding-id>\n\nUpdate the region of an existing BYOIP prefix binding. Like creating a binding, this requires **IP Prefixes Write** in addition to **DLS Write**.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
