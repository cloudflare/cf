/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Description for the ACL.",
			optional: true,
			parse: String,
		},
		"forward-locally": {
			kind: "boolean",
			brief:
				'The desired forwarding action for this ACL policy. If set to "false", the policy will forward traffic to Cloudflare. If set to "true", the policy will forward traffic locally on the Magic Connector. If not included in request, will default to false.',
			optional: true,
		},
		"lan-1-lan-id": {
			kind: "parsed",
			brief:
				"The identifier for the LAN you want to create an ACL policy with.",
			optional: true,
			parse: String,
		},
		"lan-1-lan-name": {
			kind: "parsed",
			brief: "The name of the LAN based on the provided lan_id.",
			optional: true,
			parse: String,
		},
		"lan-1-port-ranges": {
			kind: "parsed",
			brief:
				"Array of port ranges on the provided LAN that will be included in the ACL. If no ports or port rangess are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lan-1-ports": {
			kind: "parsed",
			brief:
				"Array of ports on the provided LAN that will be included in the ACL. If no ports or port ranges are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lan-2-lan-id": {
			kind: "parsed",
			brief:
				"The identifier for the LAN you want to create an ACL policy with.",
			optional: true,
			parse: String,
		},
		"lan-2-lan-name": {
			kind: "parsed",
			brief: "The name of the LAN based on the provided lan_id.",
			optional: true,
			parse: String,
		},
		"lan-2-port-ranges": {
			kind: "parsed",
			brief:
				"Array of port ranges on the provided LAN that will be included in the ACL. If no ports or port rangess are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lan-2-ports": {
			kind: "parsed",
			brief:
				"Array of ports on the provided LAN that will be included in the ACL. If no ports or port ranges are provided, communication on any port on this LAN is allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the ACL.",
			optional: true,
			parse: String,
		},
		protocols: {
			kind: "parsed",
			brief: "The protocols field",
			variadic: true,
			optional: true,
			parse: String,
		},
		unidirectional: {
			kind: "boolean",
			brief:
				'The desired traffic direction for this ACL policy. If set to "false", the policy will allow bidirectional traffic. If set to "true", the policy will only allow traffic in one direction. If not included in request, will default to false.',
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Bidirectional ACL policy for local network traffic within a site.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <site-id>",
	describe: "Create a new Site ACL",
	usage:
		"$0 magic-transit sites acls create <site-id>\n\nCreates a new Site ACL.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
