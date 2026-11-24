/**
 * disconnect command
 * @generated from apis/overlays/pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "project-name",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "disconnect <project-name>",
	describe: "Disconnect a Git repository",
	usage:
		"$0 pages source disconnect <project-name>\n\nDisconnect the Git repository from a Cloudflare Pages project to stop Git-based deployments.",
	...parameters,
	loader: () => import("./disconnect.handler.js"),
});

export default command;
