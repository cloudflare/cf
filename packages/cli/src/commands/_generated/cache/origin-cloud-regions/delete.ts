/**
 * delete command
 * @generated from apis/overlays/cache.ts
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
			placeholder: "origin-ip",
			brief: "Origin IP address whose mapping should be deleted.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <origin-ip>",
	describe: "Delete an origin cloud region mapping",
	usage:
		"$0 cache origin-cloud-regions delete <origin-ip>\n\nRemoves the cloud region mapping for a single origin IP address. The IP path parameter is normalized before lookup. Returns the deleted IP on success. Returns 404 if no mapping exists for the specified IP. When the last mapping for the zone is removed the underlying rule record is also deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
