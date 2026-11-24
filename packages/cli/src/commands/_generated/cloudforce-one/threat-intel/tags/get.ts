/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	},
	operands: [{ placeholder: "tag-uuid", brief: "Tag UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tag-uuid>",
	describe: "Get a tag",
	usage:
		"$0 cloudforce-one threat-intel tags get <tag-uuid>\n\nReturns a tag by its UUID, including its custom fields (`properties`). Tags marked TLP:PURPLE are visible only to Cloudforce One.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
