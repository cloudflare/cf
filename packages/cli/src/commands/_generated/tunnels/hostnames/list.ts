/**
 * list command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief:
				"If set, only list tunnel hostnames that contain this value. The filter is case-insensitive.",
			optional: true,
			parse: String,
		},
		canonical: {
			kind: "boolean",
			brief:
				"If set, only list tunnel hostnames with the specified canonical status.",
			optional: true,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only return deleted tunnel hostnames. If `false` or omitted, exclude deleted tunnel hostnames.",
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of results to display, up to 1000. The server caps larger values at 1000.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number to return.",
			optional: true,
			parse: Number,
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
	describe: "List tunnel hostnames",
	usage:
		"$0 tunnels hostnames list\n\nLists and filters the hostnames assigned to a tunnel.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
