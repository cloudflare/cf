/**
 * create command
 * @generated from apis/overlays/pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Fully qualified domain name for the Pages project, such as `example.com`.",
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
			placeholder: "project-name",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <project-name>",
	describe: "Add a Pages custom domain",
	usage:
		"$0 pages domains create <project-name>\n\nAttach a custom domain to a Cloudflare Pages project.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
