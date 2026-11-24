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
		name: {
			kind: "parsed",
			brief: "The name of the share.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags associated with the share. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
			brief:
				"Request body for `PUT /accounts/{account_id}/shares/{share_id}`. The share's display `name` and `tags` can be updated via this endpoint. To modify recipients, use the `/accounts/{account_id}/shares/{share_id}/recipients` subresource endpoints (POST, PUT, DELETE). ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <share-id>",
	describe: "Trigger a share update",
	usage:
		"$0 resource-sharing update <share-id>\n\nUpdates the share's display name and tags. Omitting `tags` leaves the existing tags unchanged. Recipients and resources are managed via their subresource endpoints.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
