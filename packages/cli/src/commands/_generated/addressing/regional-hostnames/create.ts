/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hostname: {
			kind: "parsed",
			brief:
				"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g `*.example.com`",
			optional: true,
			parse: String,
		},
		"region-key": {
			kind: "parsed",
			brief: "Identifying key for the region",
			optional: true,
			parse: String,
		},
		routing: {
			kind: "parsed",
			brief: "Configure which routing method to use for the regional hostname",
			default: "dns",
			parse: String,
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
	command: "create",
	describe: "Create Regional Hostname",
	usage:
		"$0 addressing regional-hostnames create\n\nCreate a new Regional Hostname entry. Cloudflare will only use data centers that are physically located within the chosen region to decrypt and service HTTPS traffic. Learn more about [Regional Services](https://developers.cloudflare.com/data-localization/regional-services/get-started/).",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
