/**
 * delete command
 * @generated from apis/overlays/leaked-credential-checks.ts
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
		{
			placeholder: "detection-id",
			brief: "Defines the unique ID for this custom detection.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <detection-id>",
	describe: "Delete a custom detection location from a zone.",
	usage:
		"$0 leaked-credential-checks detections delete <detection-id>\n\nDelete a user-defined detection location, identified by its detection ID. Incoming requests are then scanned using only the default scan locations and the detection locations that remain.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
