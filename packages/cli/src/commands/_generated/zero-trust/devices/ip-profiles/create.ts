/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
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
			brief: "An optional description of the Device IP profile.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether the Device IP profile will be applied to matching devices.",
			default: true,
		},
		match: {
			kind: "parsed",
			brief:
				'The wirefilter expression to match registrations. Available values: "identity.name", "identity.email", "identity.groups.id", "identity.groups.name", "identity.groups.email", "identity.saml_attributes".',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the Device IP profile.",
			optional: true,
			parse: String,
		},
		precedence: {
			kind: "parsed",
			brief:
				"The precedence of the Device IP profile. Lower values indicate higher precedence. Device IP profile will be evaluated in ascending order of this field.",
			optional: true,
			parse: Number,
		},
		"subnet-id": {
			kind: "parsed",
			brief: "The ID of the Subnet.",
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
	command: "create",
	describe: "Create IP profile",
	usage:
		"$0 zero-trust devices ip-profiles create\n\nCreates a WARP Device IP profile. Currently, only IPv4 Device subnets can be associated.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
