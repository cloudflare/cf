/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"excluded-recipients": {
			kind: "parsed",
			brief:
				'Accounts to exclude from an organization-targeted share. Only allowed when `recipients` contains no account entries. The share owner cannot be excluded. Duplicate entries are ignored. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"account_id": string}].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the share.",
			optional: true,
			parse: String,
		},
		recipients: {
			kind: "parsed",
			brief:
				'The recipients field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"account_id"?: string, "organization_id"?: string, "recipient_account_id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		resources: {
			kind: "parsed",
			brief:
				'The resources field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"meta": {...}, "resource_account_id": string, "resource_id": string, "resource_type": "custom-ruleset" | "gateway-policy" | "gateway-destination-ip" | ...more}].',
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags associated with the share. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
	describe: "Trigger a share creation",
	usage:
		"$0 resource-sharing create\n\nCreates a share that makes a resource available to specific accounts in the caller's organization, or to the whole organization.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
