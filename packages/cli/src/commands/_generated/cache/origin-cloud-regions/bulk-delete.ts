/**
 * bulk-delete command
 * @generated from apis/overlays/cache.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-delete",
	describe: "Batch delete origin cloud region mappings",
	usage:
		"$0 cache origin-cloud-regions bulk-delete\n\nRemoves up to 100 IP-to-cloud-region mappings in a single request. Each IP is validated independently — successfully deleted items are returned in the `succeeded` array and IPs that could not be found or are invalid are returned in the `failed` array.",
	...parameters,
	loader: () => import("./bulk-delete.handler.js"),
});

export default command;
