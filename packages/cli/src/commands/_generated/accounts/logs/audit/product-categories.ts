/**
 * product-categories command
 * @generated from apis/overlays/accounts.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "product-categories",
	describe: "List account audit log product categories (Version 2)",
	usage:
		"$0 accounts logs audit product-categories\n\nLists the available audit log product categories and the resource products each one expands to. Use these values with the product_category filter on the account audit logs endpoint.",
	...parameters,
	loader: () => import("./product-categories.handler.js"),
});

export default command;
