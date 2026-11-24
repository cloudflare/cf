/**
 * bulk-replace-tags command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		items: {
			kind: "parsed",
			brief:
				'The items field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"tags": {...}, "target_id": string}].',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-replace-tags",
	describe: "Replace tags on existing targets",
	usage:
		"$0 zero-trust access targets bulk-replace-tags\n\nReplaces tags for one or more existing infrastructure access targets.",
	...parameters,
	loader: () => import("./bulk-replace-tags.handler.js"),
});

export default command;
