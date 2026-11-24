/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"category-uuids": {
			kind: "parsed",
			brief:
				"Up to 100 unique tag category UUIDs that the managed default tagging skill may select tags from.",
			variadic: true,
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
	operands: [
		{
			placeholder: "skill-id",
			brief:
				"Must be default-tagging-skill; configures the managed default tagging skill",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <skill-id>",
	describe: "Replace Threat Signals skill tag categories",
	usage:
		"$0 cloudforce-one threat-signals skills tag-categories update <skill-id>\n\nReplaces the Tag Categories the managed default tagging skill may select tags from. This configures the managed default tagging skill, not Custom Skills.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
