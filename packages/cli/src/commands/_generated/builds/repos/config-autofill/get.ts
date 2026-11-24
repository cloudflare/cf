/**
 * get command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"provider-type": {
			kind: "parsed",
			brief: "SCM provider type",
			parse: String,
		},
		"provider-account-id": {
			kind: "parsed",
			brief:
				"Provider-specific identifier of the account or namespace that owns the repository.",
			parse: String,
		},
		branch: { kind: "parsed", brief: "Git branch name.", parse: String },
		"root-directory": {
			kind: "parsed",
			brief: "Repository directory in which build and deploy commands run.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "repo-id",
			brief: "Provider-specific repository identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <repo-id>",
	describe: "Get repository configuration autofill",
	usage:
		"$0 builds repos config-autofill get <repo-id>\n\nAnalyze repository for automatic configuration detection",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
