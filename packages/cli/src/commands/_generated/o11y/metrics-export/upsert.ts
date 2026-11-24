/**
 * upsert command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"requester-requester-id": {
			kind: "parsed",
			brief: "The requester.requesterId field",
			optional: true,
			parse: String,
		},
		"requester-requester-type": {
			kind: "parsed",
			brief: "The requester.requesterType field",
			optional: true,
			choices: ["workers"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "requester-requester-type", "text"),
		},
		resources: {
			kind: "parsed",
			brief:
				'The resources field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"destinations": [string], "resourceId": string, "resourceType": "workers" | "d1" | "r2" | ...more}].',
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
	command: "upsert",
	describe: "Upsert Metrics Exports",
	usage:
		"$0 o11y metrics-export upsert\n\nCreate or replace resources configured for Workers Observability metrics export.",
	...parameters,
	loader: () => import("./upsert.handler.js"),
});

export default command;
