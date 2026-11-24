/**
 * create command
 * @generated from apis/overlays/load-balancers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "A short description of the monitor group",
			optional: true,
			parse: String,
		},
		members: {
			kind: "parsed",
			brief:
				'List of monitors in this group. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "monitor_id": string, "monitoring_only": boolean, "must_be_healthy": boolean}].',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Monitor Group",
	usage:
		"$0 load-balancers monitor-groups create\n\nCreate a new monitor group.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
