/**
 * create command
 * @generated from apis/overlays/vectorize.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"index-type": {
			kind: "parsed",
			brief: "Specifies the type of metadata property to index.",
			optional: true,
			choices: ["string", "number", "boolean"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "index-type", "text"),
		},
		"property-name": {
			kind: "parsed",
			brief: "Specifies the metadata property to index.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <index-name>",
	describe: "Create Metadata Index",
	usage:
		"$0 vectorize metadata-indexes create <index-name>\n\nEnable metadata filtering based on metadata property. Limited to 10 properties.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
