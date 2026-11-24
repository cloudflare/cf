/**
 * list command
 * @generated from apis/overlays/connector-telemetry-snapshots.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"connector-id": { kind: "parsed", brief: "Connector ID", parse: String },
		from: { kind: "parsed", brief: "From", parse: Number },
		to: { kind: "parsed", brief: "To", parse: Number },
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Snapshots",
	usage:
		"$0 connector-telemetry-snapshots list\n\nLists Magic WAN Connector Telemetry Snapshots",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
