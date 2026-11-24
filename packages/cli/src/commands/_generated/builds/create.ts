/**
 * create command
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
		branch: {
			kind: "parsed",
			brief: "Git branch name (required if commit_hash not provided)",
			optional: true,
			parse: String,
		},
		"commit-hash": {
			kind: "parsed",
			brief: "Git commit hash (required if branch not provided)",
			optional: true,
			parse: String,
		},
		"seed-repo-branch": {
			kind: "parsed",
			brief: "Repository branch to seed.",
			optional: true,
			parse: String,
		},
		"seed-repo-files": {
			kind: "parsed",
			brief:
				'Files to add or replace for this build. Maximum 2. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content": string, "filename": string, "isBase64"?: boolean, "replace"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"seed-repo-owner": {
			kind: "parsed",
			brief: "Repository owner or namespace.",
			optional: true,
			parse: String,
		},
		"seed-repo-path": {
			kind: "parsed",
			brief: "Path within the repository to seed.",
			optional: true,
			parse: String,
		},
		"seed-repo-provider": {
			kind: "parsed",
			brief: "Source control provider for the seed repository.",
			optional: true,
			choices: ["github", "gitlab"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "seed-repo-provider", "text"),
		},
		"seed-repo-repository": {
			kind: "parsed",
			brief: "Repository name.",
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
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"seed-repo-branch",
				"seed-repo-files",
				"seed-repo-owner",
				"seed-repo-path",
				"seed-repo-provider",
				"seed-repo-repository",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"seed-repo-owner",
					"seed-repo-provider",
					"seed-repo-repository",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --seed-repo-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <worker>",
	describe: "Start a Worker build",
	usage:
		"$0 builds create <worker>\n\nStart a production build for a branch or commit.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
