/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List managed PIR topics",
	usage:
		"$0 cloudforce-one priority-intelligence topics list\n\nReturns the managed topics a structured PIR can follow, with their family, default question, relevance criteria, suggested actors and event rules. Suggested actors the account cannot see are left out. Topics change centrally; PIRs follow a topic's defaults wherever the customer has not changed them. Also returns `topic_families`, the picker's groups in display order, and `organization_types` for the organization profile form.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
