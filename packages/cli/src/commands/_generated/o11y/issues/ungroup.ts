/**
 * ungroup command
 * @generated from apis/overlays/o11y.ts
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
	operands: [{ placeholder: "group-id", brief: "GroupId", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "ungroup <groupId>",
	describe: "Dissolve an issue group",
	usage:
		"$0 o11y issues ungroup <groupId>\n\nDissolve an issue group and restore its members as standalone issues.",
	...parameters,
	loader: () => import("./ungroup.handler.js"),
});

export default command;
