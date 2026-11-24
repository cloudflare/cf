/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			parse: Number,
		},
		from: {
			kind: "parsed",
			brief: "Start time for the query in ISO (RFC3339 - ISO 8601) format.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief: "Unique identifier for a device.",
			optional: true,
			parse: String,
		},
		"user-email": {
			kind: "parsed",
			brief: "Email tied to the device.",
			optional: true,
			parse: String,
		},
		"command-type": {
			kind: "enum",
			brief: "Optionally filter executed commands by command type.",
			values: ["pcap", "speed-test", "warp-diag"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Optionally filter executed commands by status.",
			values: ["PENDING_EXEC", "PENDING_UPLOAD", "SUCCESS", "FAILED"],
			optional: true,
		},
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
	describe: "List account commands",
	usage:
		"$0 zero-trust dex commands list\n\nRetrieves a paginated list of commands issued to devices under the specified account, optionally filtered by time range, device, or other parameters",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
