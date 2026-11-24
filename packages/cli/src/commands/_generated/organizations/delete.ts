/**
 * delete command
 * @generated from apis/overlays/organizations.ts
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
			placeholder: "organization-id",
			brief: "The ID of the organization to delete.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <organization-id>",
	describe: "Delete organization",
	usage:
		"$0 organizations delete <organization-id>\n\nDelete an organization. It must not contain active sub-organizations or accounts. A root organization must also have no active managed users. Sub-organization deletion availability depends on the organization's capabilities. **Access Control:** Root deletion is restricted to enterprise organizations.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
