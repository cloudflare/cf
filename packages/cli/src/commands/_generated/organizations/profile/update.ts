/**
 * update command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"business-address": {
			kind: "parsed",
			brief: "The business_address field",
			optional: true,
			parse: String,
		},
		"business-email": {
			kind: "parsed",
			brief: "The business_email field",
			optional: true,
			parse: String,
		},
		"business-name": {
			kind: "parsed",
			brief: "The business_name field",
			optional: true,
			parse: String,
		},
		"business-phone": {
			kind: "parsed",
			brief: "The business_phone field",
			optional: true,
			parse: String,
		},
		"external-metadata": {
			kind: "parsed",
			brief: "The external_metadata field",
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
			brief:
				"Partial business profile update. Omitted, empty, or null fields remain unchanged. At least one of business name, address, phone, or email must be non-empty.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "organization-id", brief: "Organization ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <organization-id>",
	describe: "Modify organization profile.",
	usage:
		"$0 organizations profile update <organization-id>\n\nPartially updates the business profile (name, email, phone, address, and external metadata) associated with this organization's customer record, creating the profile if it does not exist. Changes apply to every account and organization sharing that profile. Omitted, empty, or null fields are left unchanged. Each profile field is limited to 1,000 UTF-8 bytes. Only available to members of the organization.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
