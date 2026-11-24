/**
 * update command
 * @generated from apis/overlays/mesh.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"mesh-config-fnr-id": {
			kind: "parsed",
			brief:
				"Floating Network Resource ID — the secondary ENI that is moved between nodes on failover.",
			optional: true,
			parse: String,
		},
		"mesh-config-vips": {
			kind: "parsed",
			brief:
				'VIPs to assign on the CloudflareWARP interface. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"address": string}].',
			optional: true,
			parse: String,
		},
		"mesh-config-vips-previous": {
			kind: "parsed",
			brief:
				'VIPs to clean up on demotion or version drift. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"address": string}].',
			optional: true,
			parse: String,
		},
		"ha-mode": {
			kind: "parsed",
			brief:
				"High-availability mode for the Mesh node. `none` means HA is enabled but no provider is configured yet (newly created nodes default to this). `disabled` means HA is explicitly turned off. `aws` uses AWS ENI move for failover. `local` uses virtual IPs (VIPs) on the local interface.",
			optional: true,
			choices: ["none", "disabled", "aws", "local"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ha-mode", "text"),
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
	operands: [
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
	rules(rules) {
		rules.conflicts("mesh-config-fnr-id", [
			"mesh-config-vips",
			"mesh-config-vips-previous",
		]);
		rules.conflicts("mesh-config-vips", ["mesh-config-fnr-id"]);
		rules.conflicts("mesh-config-vips-previous", ["mesh-config-fnr-id"]);
		rules.implies("mesh-config-vips-previous", ["mesh-config-vips"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <tunnel-id>",
	describe: "Update Mesh node HA configuration",
	usage:
		"$0 mesh nodes configurations update <tunnel-id>\n\nAdds or updates the high-availability configuration for a Mesh node.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
