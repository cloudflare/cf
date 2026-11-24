/**
 * create command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		jurisdiction: {
			kind: "parsed",
			brief: "The jurisdiction field",
			default: "unrestricted",
			choices: ["unrestricted", "us", "eu", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		namespace: {
			kind: "parsed",
			brief: "The namespace field",
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
	command: "create",
	describe: "Create a namespace",
	usage:
		"$0 artifacts namespaces create\n\nCreates an empty Artifacts namespace for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
