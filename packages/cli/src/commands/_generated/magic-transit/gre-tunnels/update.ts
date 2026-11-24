/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"x-magic-new-hc-target": {
			kind: "parsed",
			brief:
				"If true, the health check target in the request and response bodies will be presented using the new object format. Defaults to false.",
			optional: true,
			parse: String,
		},
		"automatic-return-routing": {
			kind: "boolean",
			brief:
				"True if automatic stateful return routing should be enabled for a tunnel, false otherwise. Requires the `coupler_integration` account flag to be enabled; requests setting this to `true` without that flag will be rejected.",
			optional: true,
		},
		"cloudflare-gre-endpoint": {
			kind: "parsed",
			brief:
				"The IP address assigned to the Cloudflare side of the GRE tunnel.",
			optional: true,
			parse: String,
		},
		"customer-gre-endpoint": {
			kind: "parsed",
			brief: "The IP address assigned to the customer side of the GRE tunnel.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "An optional description of the GRE tunnel.",
			optional: true,
			parse: String,
		},
		"health-check-enabled": {
			kind: "boolean",
			brief: "Determines whether to run healthchecks for a tunnel.",
			optional: true,
		},
		"health-check-rate": {
			kind: "parsed",
			brief:
				"How frequent the health check is run. The default value is `mid`.",
			optional: true,
			choices: ["low", "mid", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-rate", "text"),
		},
		"health-check-target-saved": {
			kind: "parsed",
			brief:
				"The saved health check target. Setting the value to the empty string indicates that the calculated default value will be used.",
			optional: true,
			parse: String,
		},
		"health-check-type": {
			kind: "parsed",
			brief:
				"The type of healthcheck to run, reply or request. The default value is `reply`.",
			optional: true,
			choices: ["reply", "request"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-type", "text"),
		},
		"health-check-direction": {
			kind: "parsed",
			brief:
				"The direction of the flow of the healthcheck. Either unidirectional, where the probe comes to you via the tunnel and the result comes back to Cloudflare via the open Internet, or bidirectional where both the probe and result come and go via the tunnel.",
			optional: true,
			choices: ["unidirectional", "bidirectional"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-direction", "text"),
		},
		"interface-address": {
			kind: "parsed",
			brief:
				"A 31-bit prefix (/31 in CIDR notation) supporting two hosts, one for each side of the tunnel. Select the subnet from the following private IP space: 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, 192.168.0.0–192.168.255.255.",
			optional: true,
			parse: String,
		},
		"interface-address6": {
			kind: "parsed",
			brief:
				"A 127 bit IPV6 prefix from within the virtual_subnet6 prefix space with the address being the first IP of the subnet and not same as the address of virtual_subnet6. Eg if virtual_subnet6 is 2606:54c1:7:0:a9fe:12d2::/127 , interface_address6 could be 2606:54c1:7:0:a9fe:12d2:1:200/127",
			optional: true,
			parse: String,
		},
		mtu: {
			kind: "parsed",
			brief:
				"Maximum Transmission Unit (MTU) in bytes for the GRE tunnel. The minimum value is 576.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the tunnel. The name cannot contain spaces or special characters, must be 15 characters or less, and cannot share a name with another GRE tunnel.",
			optional: true,
			parse: String,
		},
		ttl: {
			kind: "parsed",
			brief: "Time To Live (TTL) in number of hops of the GRE tunnel.",
			optional: true,
			parse: Number,
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
		{ placeholder: "gre-tunnel-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <gre-tunnel-id>",
	describe: "Update GRE Tunnel",
	usage:
		"$0 magic-transit gre-tunnels update <gre-tunnel-id>\n\nUpdates a specific GRE tunnel. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
