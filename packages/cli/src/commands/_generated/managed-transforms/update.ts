/**
 * update command
 * @generated from apis/overlays/managed-transforms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"managed-request-headers": {
			kind: "parsed",
			brief:
				'The list of Managed Request Transforms. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"enabled": boolean, "id": string} & {"id"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"managed-response-headers": {
			kind: "parsed",
			brief:
				'The list of Managed Response Transforms. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"enabled": boolean, "id": string} & {"id"?: string})]. ? marks optional keys.',
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
				"A Managed Transforms patch object. Both fields are optional; only the sections provided will be updated.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Managed Transforms",
	usage:
		"$0 managed-transforms update\n\nUpdates the status of one or more Managed Transforms.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
