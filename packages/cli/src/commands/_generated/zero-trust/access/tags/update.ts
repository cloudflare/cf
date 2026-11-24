/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"created-at": {
			kind: "parsed",
			brief: "The created_at field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the tag",
			optional: true,
			parse: String,
		},
		"updated-at": {
			kind: "parsed",
			brief: "The updated_at field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: { kind: "parsed", brief: "A tag", optional: true, parse: String },
	},
	operands: [
		{ placeholder: "tag-name", brief: "The name of the tag", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <tag-name>",
	describe: "Update a tag",
	usage: "$0 zero-trust access tags update <tag-name>\n\nUpdate a tag",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
