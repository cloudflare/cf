/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		"indicator-id": { kind: "parsed", brief: "Indicator UUID.", parse: String },
		search: {
			kind: "parsed",
			brief:
				'JSON array of {field, op, value} filters, AND-combined. Fields: entityType (other-end type), type (relationship type), confidence (0–100), metadata.<key>. Example: [{"field":"type","op":"equals","value":"appears_in"},{"field":"confidence","op":"gte","value":50}]',
			variadic: true,
			optional: true,
			parse: String,
		},
		expand: {
			kind: "parsed",
			brief: "Comma-separated entity types to hydrate (event, indicator, tag).",
			variadic: true,
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief: "Keyset cursor from a previous page.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "Page size (1–100, default 25).",
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
	describe: "List indicator relationships",
	usage:
		"$0 cloudforce-one threat-intel indicators relationships list\n\nLists the relationships that start at an indicator. Use `search` to filter them and `expand` to include the related entities in the response.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
