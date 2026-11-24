/**
 * delete command
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
		"allow-aliased": {
			kind: "boolean",
			brief:
				"Allow deletion when a non-production deployment has an active alias.",
			optional: true,
		},
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
			placeholder: "deployment-id",
			brief:
				"UUID of the Pages deployment, as returned by deployment list or create operations.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <deployment-id>",
	describe: "Delete a Pages deployment",
	usage:
		"$0 pages deployments delete <deployment-id>\n\nRemove a deployment from a Cloudflare Pages project.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
