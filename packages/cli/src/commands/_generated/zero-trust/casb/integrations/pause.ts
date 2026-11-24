/**
 * pause command
 * @generated from apis/overlays/zero-trust.ts
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
	operands: [{ placeholder: "id", brief: "Integration ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "pause <id>",
	describe: "Pause integration",
	usage:
		"$0 zero-trust casb integrations pause <id>\n\nPauses an integration, stopping all crawlers.",
	...parameters,
	loader: () => import("./pause.handler.js"),
});

export default command;
