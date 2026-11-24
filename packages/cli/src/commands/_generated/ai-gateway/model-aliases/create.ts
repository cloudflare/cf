/**
 * create command
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
	operands: [{ placeholder: "gateway-id", brief: "Gateway ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <gateway-id>",
	describe: "Create a model alias",
	usage:
		"$0 ai-gateway model-aliases create <gateway-id>\n\nCreates a model alias on a gateway: a named, ordered list of catalog models, each optionally restricted to providers. Requests address it as `custom/<name>`.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
