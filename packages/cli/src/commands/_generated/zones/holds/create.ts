/**
 * create command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"include-subdomains": {
			kind: "boolean",
			brief:
				"If provided, the zone hold will extend to block any subdomain of the given zone, as well\nas SSL4SaaS Custom Hostnames. For example, a zone hold on a zone with the hostname\n'example.com' and include_subdomains=true will block 'example.com',\n'staging.example.com', 'api.staging.example.com', etc.",
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
	command: "create",
	describe: "Create Zone Hold",
	usage:
		"$0 zones holds create\n\nEnforce a zone hold on the zone, blocking the creation and activation of zones with this zone's hostname. Zone holds cannot be enabled on CDN-only zones.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
