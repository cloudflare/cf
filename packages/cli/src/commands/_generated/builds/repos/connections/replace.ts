/**
 * replace command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"provider-account-id": {
			kind: "parsed",
			brief:
				"Provider-specific identifier of the account or namespace that owns the repository.",
			optional: true,
			parse: String,
		},
		"provider-account-name": {
			kind: "parsed",
			brief:
				"Human-readable name of the account or namespace that owns the repository.",
			optional: true,
			parse: String,
		},
		"provider-type": {
			kind: "parsed",
			brief: "Source control provider.",
			optional: true,
			choices: ["github", "gitlab", "gitlab_internal", "origin"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "provider-type", "text"),
		},
		"repo-id": {
			kind: "parsed",
			brief: "Provider-specific repository identifier.",
			optional: true,
			parse: String,
		},
		"repo-name": {
			kind: "parsed",
			brief: "Human-readable repository name.",
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
	command: "replace",
	describe: "Create or update a repository connection",
	usage:
		"$0 builds repos connections replace\n\nSave the repository connection required by build triggers.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
