/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		until: {
			kind: "parsed",
			brief:
				"End date and time of requesting data period in the ISO8601 format.",
			optional: true,
			parse: String,
		},
		"pool-name": {
			kind: "parsed",
			brief: "The name for the pool to filter.",
			optional: true,
			parse: String,
		},
		"origin-healthy": {
			kind: "boolean",
			brief:
				"If true, filter events where the origin status is healthy. If false, filter events where the origin status is unhealthy.",
			optional: true,
		},
		"pool-id": {
			kind: "parsed",
			brief: "Pool ID",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief:
				"Start date and time of requesting data period in the ISO8601 format.",
			optional: true,
			parse: String,
		},
		"origin-name": {
			kind: "parsed",
			brief: "The name for the origin to filter.",
			optional: true,
			parse: String,
		},
		"pool-healthy": {
			kind: "boolean",
			brief:
				"If true, filter events where the pool status is healthy. If false, filter events where the pool status is unhealthy.",
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
	describe: "List Healthcheck Events",
	usage:
		"$0 user load-balancing-analytics events list\n\nList origin health changes.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
