/**
 * list command
 * @generated from apis/overlays/containers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"application-id": {
			kind: "parsed",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
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
	describe: "List all application versions",
	usage:
		'$0 containers applications versions list\n\nReturns all versions for a scheduler-backed application with `scheduling_policy: "default"`. Versions and rollouts do not apply to applications with `scheduling_policy: "durable_object"`.',
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
