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
			placeholder: "asset-class",
			brief: "Asset class identifier (PascalCase), e.g. AnthropicApiKey.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <asset-class>",
	describe: "Get asset schema by asset class",
	usage:
		"$0 zero-trust casb asset-schemas get <asset-class>\n\nReturns the fields and related attributes a custom finding type may reference for the given asset class (JSON Schema). Used by the custom finding types builder.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
