/**
 * update command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Name or script tag of the Worker.",
			parse: String,
		},
		branch: {
			kind: "parsed",
			brief: "Git branch name.",
			optional: true,
			parse: String,
		},
		"deploy-hook-name": {
			kind: "parsed",
			brief: "Deploy hook name (1-58 characters).",
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
			placeholder: "deploy-hook-uuid",
			brief: "UUID of the deploy hook, as returned by deploy-hooks list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <deploy-hook-uuid>",
	describe: "Update a deploy hook",
	usage:
		"$0 builds deploy-hooks update <deploy-hook-uuid>\n\nReplace the name and target branch for a deploy hook.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
