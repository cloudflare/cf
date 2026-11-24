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
	operands: [
		{
			placeholder: "dex-test-id",
			brief: "Unique identifier for a DEX test.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <dex-test-id>",
	describe: "Get Device DEX test",
	usage:
		"$0 zero-trust dex tests get <dex-test-id>\n\nFetch a single DEX test.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
