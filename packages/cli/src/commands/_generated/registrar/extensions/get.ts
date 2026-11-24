/**
 * get command
 * @generated from apis/overlays/registrar.ts
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
			placeholder: "extension",
			brief: "The extension name (e.g., \`com\`, \`co.uk\`).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <extension>",
	describe: "Get extension",
	usage:
		"$0 registrar extensions get <extension>\n\nReturns metadata and JSON Schema documents describing the expected input structure for registration and transfer operations on a specific extension (TLD). Supports HTTP conditional GET via `ETag`. Include the `ETag` value from a previous response in an `If-None-Match` header to receive a `304 Not Modified` when the data has not changed.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
