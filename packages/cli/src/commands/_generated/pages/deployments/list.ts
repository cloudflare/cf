/**
 * list command
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
		env: {
			kind: "enum",
			brief:
				"Deployment environment to return. Valid values are `production` and `preview`.",
			values: ["production", "preview"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results to return.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Pages deployments",
	usage:
		"$0 pages deployments list\n\nList the production or preview deployments for a Cloudflare Pages project.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
