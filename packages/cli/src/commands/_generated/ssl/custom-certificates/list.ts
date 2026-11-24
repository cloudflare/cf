/**
 * list command
 * @generated from apis/overlays/ssl.ts
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
			brief: "Number of zones per page.",
			optional: true,
			parse: Number,
		},
		match: {
			kind: "enum",
			brief: "Whether to match all search requirements or at least one (any).",
			values: ["any", "all"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Status of the zone's custom SSL.",
			values: ["active", "expired", "deleted", "pending", "initializing"],
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
	describe: "List SSL Configurations",
	usage:
		"$0 ssl custom-certificates list\n\nList, search, and filter all of your custom SSL certificates. The higher priority will break ties across overlapping 'legacy_custom' certificates, but 'legacy_custom' certificates will always supercede 'sni_custom' certificates.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
