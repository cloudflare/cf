/**
 * delete command
 * @generated from apis/overlays/scim.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "group-id",
			brief:
				"The group identifier for a SCIM Group resource. For system groups this is prefixed \`cloudflare-v1-<permissionGroupTag>\`; for custom user groups this is a UUID-style tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <group-id>",
	describe: "Delete SCIM Group",
	usage:
		"$0 scim groups delete <group-id>\n\nDeletes a SCIM Group (custom user groups only). System groups backed by Cloudflare permission groups cannot be deleted via SCIM. Returns 204 No Content on success.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
