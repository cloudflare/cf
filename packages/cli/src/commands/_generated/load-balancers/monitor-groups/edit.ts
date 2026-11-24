/**
 * edit command
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
	operands: [
		{
			placeholder: "monitor-group-id",
			brief: "Monitor group ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <monitor-group-id>",
	describe: "Patch Monitor Group",
	usage:
		"$0 load-balancers monitor-groups edit <monitor-group-id>\n\nApply changes to an existing monitor group, overwriting the supplied properties.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
