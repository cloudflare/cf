/**
 * progress command
 * @generated from apis/overlays/images.ts
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
	operands: [
		{
			placeholder: "migration-id",
			brief: "Sourcing kit resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "progress <migration-id>",
	describe: "Get migration progress",
	usage:
		"$0 images import progress <migration-id>\n\nGet progress and object counts for a CF Images import.",
	...parameters,
	loader: () => import("./progress.handler.js"),
});

export default command;
