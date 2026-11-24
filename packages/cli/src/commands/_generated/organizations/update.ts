/**
 * update command
 * @generated from apis/overlays/organizations.ts
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
			brief:
				"The Organization name, limited to 65 UTF-8 bytes. An omitted, empty, or unchanged value is a no-op.",
			optional: true,
			parse: String,
		},
		"parent-id": {
			kind: "parsed",
			brief:
				"The current parent Organization ID. A different value is rejected; this endpoint cannot move an Organization.",
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
			brief: "The Organization fields to update or verify.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "organization-id",
			brief: "The ID of the organization to modify.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <organization-id>",
	describe: "Update organization",
	usage:
		"$0 organizations update <organization-id>\n\nUpdate an organization's name. Supplying `parent_id` verifies the current parent; this endpoint cannot move an organization. Organization names are limited to 65 UTF-8 bytes.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
