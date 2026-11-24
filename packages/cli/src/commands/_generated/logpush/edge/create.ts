/**
 * create command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		fields: {
			kind: "parsed",
			brief: "Comma-separated list of fields.",
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief: "Filters to drill down into specific events.",
			optional: true,
			parse: String,
		},
		sample: {
			kind: "parsed",
			brief:
				'The sample parameter is the sample rate of the records set by the client: "sample": 1 is 100% of records "sample": 10 is 10% and so on.',
			optional: true,
			parse: Number,
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
	describe: "Create Instant Logs job",
	usage: "$0 logpush edge create\n\nCreates a new Instant Logs job for a zone.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
