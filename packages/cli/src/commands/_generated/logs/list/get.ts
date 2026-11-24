/**
 * get command
 * @generated from apis/overlays/logs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		start: {
			kind: "parsed",
			brief: "Start time in RFC3339 format.",
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "End time in RFC3339 format.",
			parse: String,
		},
		bucket: { kind: "parsed", brief: "R2 bucket name.", parse: String },
		prefix: {
			kind: "parsed",
			brief: "R2 bucket prefix logs are stored under.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of results to return.",
			optional: true,
			parse: Number,
		},
		"r2-access-key-id": {
			kind: "parsed",
			brief: "The R2-Access-Key-Id header",
			parse: String,
		},
		"r2-secret-access-key": {
			kind: "parsed",
			brief: "The R2-Secret-Access-Key header",
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
	command: "get",
	describe: "List log files",
	usage:
		"$0 logs list get\n\nLists R2 objects containing logs matching the provided query parameters.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
