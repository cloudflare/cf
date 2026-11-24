/**
 * edit command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"default-sampling": {
			kind: "parsed",
			brief:
				"Fallback sampling rate of flow messages being sent in packets per second. This should match the packet sampling rate configured on the router.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "The account name.",
			optional: true,
			parse: String,
		},
		"router-ips": {
			kind: "parsed",
			brief: "The router_ips field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"warp-devices": {
			kind: "parsed",
			brief:
				'The warp_devices field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "name": string, "router_ip": string}].',
			optional: true,
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
	command: "edit",
	describe: "Update account configuration fields",
	usage:
		"$0 magic-network-monitoring configs edit\n\nUpdate fields in an existing network monitoring configuration.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
