/**
 * retry command
 * @generated from apis/overlays/pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"project-name": {
			kind: "parsed",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
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
			placeholder: "domain-name",
			brief:
				"Fully qualified domain name for the Pages project, such as \`example.com\`.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "retry <domain-name>",
	describe: "Retry custom domain validation",
	usage:
		"$0 pages domains validation retry <domain-name>\n\nRetry validation for a custom domain attached to a Cloudflare Pages project.",
	...parameters,
	loader: () => import("./retry.handler.js"),
});

export default command;
