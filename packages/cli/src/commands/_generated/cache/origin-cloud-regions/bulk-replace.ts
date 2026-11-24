/**
 * bulk-replace command
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
	command: "bulk-replace",
	describe: "Batch create or replace origin cloud region mappings",
	usage:
		"$0 cache origin-cloud-regions bulk-replace\n\nUpserts up to 100 IP-to-cloud-region mappings in a single request. Items in the request body are created or replaced; mappings not included in the request body are preserved unchanged (this is a merge operation, not a full collection replacement). Each item is validated independently — valid items are applied and invalid items are returned in the `failed` array. The vendor and region for every item are validated against the list from `GET /zones/{zone_id}/origin/cloud_regions/supported_regions`.",
	...parameters,
	loader: () => import("./bulk-replace.handler.js"),
});

export default command;
