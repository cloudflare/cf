/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
			placeholder: "worker",
			brief: "Name or script tag of the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <worker>",
	describe: "Create a deploy hook",
	usage:
		"$0 builds deploy-hooks create <worker>\n\nCreate an HTTP hook that starts a build for a selected Worker branch.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
