/**
 * update command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"gateway-id": { kind: "parsed", brief: "Gateway ID", parse: String },
		models: {
			kind: "parsed",
			brief:
				'The models field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"model": string, "providers"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"routing-algorithm": {
			kind: "parsed",
			brief: "The routing.algorithm field",
			optional: true,
			choices: ["preferred", "smart"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "routing-algorithm", "text"),
		},
		"routing-mode": {
			kind: "parsed",
			brief: "The routing.mode field",
			optional: true,
			choices: ["cost", "best"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "routing-mode", "text"),
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Update a model alias",
	usage:
		"$0 ai-gateway model-aliases update <id>\n\nReplaces a model alias. Omitting `routing` clears any previously stored routing options.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
