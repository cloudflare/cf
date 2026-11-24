/**
 * get command
 * @generated from apis/overlays/artifacts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		ref: {
			kind: "parsed",
			brief: "Git ref, branch, tag, or commit hash. Defaults to HEAD.",
			optional: true,
			parse: String,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "name", brief: "Repository name.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <name>",
	describe: "Read commit history",
	usage:
		"$0 artifacts namespaces repos logs get <name>\n\nReturns commit metadata walking backwards from a ref, branch, tag, or HEAD.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
