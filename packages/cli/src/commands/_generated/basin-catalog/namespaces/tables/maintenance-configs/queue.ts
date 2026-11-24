/**
 * queue command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
		namespace: { kind: "parsed", brief: "Namespace", parse: String },
		"table-name": { kind: "parsed", brief: "Table name", parse: String },
		"request-id": {
			kind: "parsed",
			brief: "The request_id field",
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
			placeholder: "configuration-type",
			brief: "Configuration type",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "queue <configuration-type>",
	describe: "Queue table maintenance",
	usage:
		"$0 basin-catalog namespaces tables maintenance-configs queue <configuration-type>\n\nQueue maintenance for normal polling. This request does not start a run.",
	...parameters,
	loader: () => import("./queue.handler.js"),
});

export default command;
