/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"finding-type-id": {
			kind: "parsed",
			brief: "A UUID string identifying the finding type.",
			parse: String,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by an integration ID",
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief: "A cursor for pagination.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
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
	describe: "List remediation types for a finding type",
	usage:
		"$0 zero-trust casb finding-types remediation-types list\n\nList all remediation types for a given finding type. This endpoint supports both cursor and offset pagination. Note that `cursor` and `page` are mutually exclusive.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
