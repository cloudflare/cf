/**
 * delete command
 * @generated from apis/overlays/custom-hostnames.ts
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
			placeholder: "custom-hostname-id",
			brief: "Custom hostname identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <custom-hostname-id>",
	describe: "Delete Custom Hostname (and any issued SSL certificates)",
	usage:
		"$0 custom-hostnames delete <custom-hostname-id>\n\nPermanently deletes a custom hostname and revokes any SSL certificates that were issued for it. This action cannot be undone.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
