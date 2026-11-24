/**
 * get command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "snapshot-t", brief: "Snapshot t", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <snapshot-t>",
	describe: "Get Snapshot",
	usage:
		"$0 connector-telemetry-snapshots get <snapshot-t>\n\nGets Magic WAN Connector Telemetry Snapshot",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
