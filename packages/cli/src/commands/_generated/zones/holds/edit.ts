/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"hold-after": {
			kind: "parsed",
			brief:
				"If `hold_after` is provided and future-dated, the hold will be temporarily disabled,\nthen automatically re-enabled by the system at the time specified\nin this RFC3339-formatted timestamp. A past-dated `hold_after` value will have\nno effect on an existing, enabled hold. Providing an empty string will set its value\nto the current time. Providing `null` will disable the hold indefinitely.",
			optional: true,
			parse: String,
		},
		"include-subdomains": {
			kind: "boolean",
			brief:
				"If `true`, the zone hold will extend to block any subdomain of the given zone, as well\nas SSL4SaaS Custom Hostnames. For example, a zone hold on a zone with the hostname\n'example.com' and include_subdomains=true will block 'example.com',\n'staging.example.com', 'api.staging.example.com', etc.",
			optional: true,
		},
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
	command: "edit",
	describe: "Update Zone Hold",
	usage:
		"$0 zones holds edit\n\nUpdate the `hold_after` and/or `include_subdomains` values on an existing zone hold. The hold is enabled if the `hold_after` date-time value is in the past. Existing zone holds can be removed from CDN-only zones by setting `hold_after` to `null`. Other zone hold updates cannot be made on CDN-only zones. Active holds are automatically disabled when a zone transitions to CDN-only mode.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
