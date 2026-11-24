/**
 * get command
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
	operands: [{ placeholder: "custom-page-id", brief: "UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <custom-page-id>",
	describe: "Get a custom page",
	usage:
		"$0 zero-trust access custom-pages get <custom-page-id>\n\nFetches a custom page and also returns its HTML.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
