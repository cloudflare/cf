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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Delete Fallback Origin for Custom Hostnames",
	usage:
		"$0 custom-hostnames fallback-origin delete\n\nRemoves the fallback origin configuration for custom hostnames on a zone. Custom hostnames without specific origins will no longer have a fallback.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
