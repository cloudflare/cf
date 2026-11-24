/**
 * list command
 * @generated from apis/overlays/turnstile.ts
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
			brief: "Number of items per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order widgets by.",
			values: ["id", "sitekey", "name", "created_on", "modified_on"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order widgets.",
			values: ["asc", "desc"],
			optional: true,
		},
		filter: {
			kind: "parsed",
			brief:
				"Filter widgets by field. The `name` field uses case-insensitive\nsubstring matching; `sitekey` uses exact matching.\nFormat: `field:value`\n\nSupported fields:\n- `name` - Filter by widget name (e.g., `filter=name:login-form`)\n- `sitekey` - Filter by sitekey (e.g., `filter=sitekey:0x4AAA`)\n\nReturns 400 Bad Request if the field is unsupported or format is invalid.\nAn empty filter value returns all results.",
			optional: true,
			parse: String,
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
	describe: "List Turnstile Widgets",
	usage: "$0 turnstile widgets list\n\nLists Turnstile widgets for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
