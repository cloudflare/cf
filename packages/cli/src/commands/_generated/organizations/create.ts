/**
 * create command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "The Organization name, limited to 65 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		"parent-id": {
			kind: "parsed",
			brief: "Organization ID",
			optional: true,
			parse: String,
		},
		"profile-business-address": {
			kind: "parsed",
			brief: "The profile.business_address field",
			optional: true,
			parse: String,
		},
		"profile-business-email": {
			kind: "parsed",
			brief: "The profile.business_email field",
			optional: true,
			parse: String,
		},
		"profile-business-name": {
			kind: "parsed",
			brief: "The profile.business_name field",
			optional: true,
			parse: String,
		},
		"profile-business-phone": {
			kind: "parsed",
			brief: "The profile.business_phone field",
			optional: true,
			parse: String,
		},
		"profile-external-metadata": {
			kind: "parsed",
			brief: "The profile.external_metadata field",
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
	describe: "Create organization",
	usage:
		"$0 organizations create\n\nCreate a new organization for a user. Sub-organization creation availability depends on the organization's capabilities. The optional `profile` object accepts partial profile details; its individual fields are not required. Organization names are limited to 65 UTF-8 bytes. Each profile field is limited to 1,000 UTF-8 bytes, and a non-empty business email must be valid. At least one of business name, address, phone, or email must be non-empty to persist a profile.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
