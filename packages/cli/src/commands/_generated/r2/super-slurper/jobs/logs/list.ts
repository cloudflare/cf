/**
 * list command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"job-id": { kind: "parsed", brief: "Job ID", parse: String },
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
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
	describe: "Get job logs",
	usage:
		"$0 r2 super-slurper jobs logs list\n\nGets log entries for an R2 Super Slurper migration job, showing migration status changes, errors, etc.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
