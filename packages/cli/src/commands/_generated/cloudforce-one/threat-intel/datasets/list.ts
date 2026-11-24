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
		"include-deleted": {
			kind: "boolean",
			brief:
				"When true, include soft-deleted datasets in the response. Each item includes a `deletedAt` field (ISO 8601 or null). Default: false.",
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
	describe: "List datasets",
	usage:
		"$0 cloudforce-one threat-intel datasets list\n\nLists the account's datasets. Set `includeDeleted` to include deleted datasets.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
