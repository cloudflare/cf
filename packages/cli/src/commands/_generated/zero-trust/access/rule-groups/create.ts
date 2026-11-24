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
		exclude: {
			kind: "parsed",
			brief:
				'Rules evaluated with a NOT logical operator. To match a policy, a user cannot meet any of the Exclude rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"group": {...}} | {"any_valid_service_token": {...}} | {"auth_context": {...}} | ...more)].',
			optional: true,
			parse: String,
		},
		include: {
			kind: "parsed",
			brief:
				'Rules evaluated with an OR logical operator. A user needs to meet only one of the Include rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"group": {...}} | {"any_valid_service_token": {...}} | {"auth_context": {...}} | ...more)].',
			optional: true,
			parse: String,
		},
		"is-default": {
			kind: "boolean",
			brief: "Whether this is the default group",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name of the Access group.",
			optional: true,
			parse: String,
		},
		require: {
			kind: "parsed",
			brief:
				'Rules evaluated with an AND logical operator. To match a policy, a user must meet all of the Require rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"group": {...}} | {"any_valid_service_token": {...}} | {"auth_context": {...}} | ...more)].',
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
	describe: "Create an Access group",
	usage:
		"$0 zero-trust access rule-groups create\n\nCreates a new Access group.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
