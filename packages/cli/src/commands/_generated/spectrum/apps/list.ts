/**
 * list command
 * @generated from apis/overlays/spectrum.ts
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
			brief:
				"Page number of paginated results. This parameter is required in order to use other pagination parameters. If included in the query, `result_info` will be present in the response.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Sets the maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "Sets the direction by which results are ordered.",
			values: ["asc", "desc"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Application field by which results are ordered.",
			values: ["protocol", "app_id", "created_on", "modified_on", "dns"],
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
	describe: "List Spectrum applications",
	usage:
		"$0 spectrum apps list\n\nRetrieves a list of currently existing Spectrum applications inside a zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
