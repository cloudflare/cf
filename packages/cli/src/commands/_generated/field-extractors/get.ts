/**
 * get command
 * @generated from apis/overlays/field-extractors.ts
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
		{ placeholder: "extractor", brief: "Extractor type.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <extractor>",
	describe: "Get Field Extractor",
	usage:
		"$0 field-extractors get <extractor>\n\nRetrieves the custom extraction rules configured for a given extractor type.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
