/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		role: {
			kind: "parsed",
			brief: "The role field",
			optional: true,
			choices: ["read", "write"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "role", "text"),
		},
		"subject-id": {
			kind: "parsed",
			brief: "The subjectId field",
			optional: true,
			parse: String,
		},
		"subject-type": {
			kind: "parsed",
			brief: "The subjectType field",
			optional: true,
			choices: ["account", "group"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "subject-type", "text"),
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
		{ placeholder: "dataset-id", brief: "Dataset UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <dataset-id>",
	describe: "Grant access to a dataset",
	usage:
		"$0 cloudforce-one threat-intel datasets access permissions create <dataset-id>\n\nGives an account or account group (`subjectType` and `subjectId`) `read` or `write` access to a dataset.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
