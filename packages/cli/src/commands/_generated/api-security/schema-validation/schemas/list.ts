/**
 * list command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		"omit-source": {
			kind: "boolean",
			brief:
				"Omit the source-files of schemas and only retrieve their meta-data.",
			optional: true,
		},
		"validation-enabled": {
			kind: "boolean",
			brief: "Filter for enabled schemas",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List all uploaded schemas",
	usage:
		"$0 api-security schema-validation schemas list\n\nLists all OpenAPI schemas uploaded to API Security.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
