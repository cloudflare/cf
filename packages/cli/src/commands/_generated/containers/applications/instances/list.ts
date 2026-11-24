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
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of instances to return per page. Defaults to 100.",
			optional: true,
			parse: Number,
		},
		"page-token": {
			kind: "parsed",
			brief: "Opaque token from a previous response to retrieve the next page.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "enum",
			brief:
				"Filters instances by lifecycle state. `active` includes provisioning, running, and stopping instances; `not-active` includes stopped and failed instances. When omitted, all instances are returned.",
			values: ["active", "not-active"],
			optional: true,
		},
		"name-prefix": {
			kind: "parsed",
			brief:
				"Filter instances by a case-sensitive name prefix, falling back to the actor ID when no name is known. Keep the same prefix when using a page token.",
			optional: true,
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
	describe: "List container instances",
	usage:
		"$0 containers applications instances list\n\nLists container instances belonging to an application.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
