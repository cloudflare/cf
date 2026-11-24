/**
 * list command
 * @generated from apis/overlays/logs.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"include-zones": {
			kind: "boolean",
			brief:
				"Set to true to include zone-scoped datasets belonging to this account.",
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
	describe: "List account or zone datasets",
	usage:
		"$0 logs datasets list\n\nReturns all Log Explorer datasets configured for the account or zone. Pass `include_zones=true` to also include zone-level datasets that belong to this account or zone. List responses omit the `fields` property; use the single-dataset endpoint to retrieve field configuration.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
