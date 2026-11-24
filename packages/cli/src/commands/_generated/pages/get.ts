/**
 * get command
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
	command: "get <project-name>",
	describe: "Get a Cloudflare Pages project",
	usage:
		"$0 pages get <project-name>\n\nRetrieve the configuration and deployment settings for a Cloudflare Pages project.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
