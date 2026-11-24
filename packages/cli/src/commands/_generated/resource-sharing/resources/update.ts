/**
 * update command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
		meta: {
			kind: "parsed",
			brief:
				'Resource Metadata. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
			placeholder: "share-resource-id",
			brief: "Share Resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <share-resource-id>",
	describe: "Trigger a resource metadata update in a share",
	usage:
		"$0 resource-sharing resources update <share-resource-id>\n\nUpdates the resource's `meta`. Only resources with `status=active` can be updated.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
