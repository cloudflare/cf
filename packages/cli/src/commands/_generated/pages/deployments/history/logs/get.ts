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
			placeholder: "deployment-id",
			brief:
				"UUID of the Pages deployment, as returned by deployment list or create operations.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <deployment-id>",
	describe: "Get Pages deployment logs",
	usage:
		"$0 pages deployments history logs get <deployment-id>\n\nRetrieve the build logs for a Cloudflare Pages deployment.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
