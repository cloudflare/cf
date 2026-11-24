/**
 * update command
 * @generated from apis/overlays/cache.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		region: {
			kind: "parsed",
			brief:
				"Cloud vendor region identifier. Must be a valid region for the specified vendor as returned by the supported_regions endpoint.",
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief:
				"Cloud vendor hosting the origin. Must be one of the supported vendors.",
			optional: true,
			choices: ["aws", "azure", "gcp", "oci"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "vendor", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for creating or replacing an origin cloud region mapping.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "origin-ip",
			brief: "Origin IP address to create or replace.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <origin-ip>",
	describe: "Create or replace an origin cloud region mapping",
	usage:
		"$0 cache origin-cloud-regions update <origin-ip>\n\nCreates a new IP-to-cloud-region mapping or replaces the existing mapping for the specified IP. PUT is idempotent — calling it repeatedly with the same body produces the same result. The IP path parameter is normalized to canonical form (RFC 5952 for IPv6) before storage. The vendor and region are validated against the list from `GET /zones/{zone_id}/origin/cloud_regions/supported_regions`. Returns 400 if the `origin_ip` in the body does not match the URL path parameter. Returns 403 (code 1164) when the zone has reached the limit of 3,500 IP mappings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
