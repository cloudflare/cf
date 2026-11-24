/**
 * diagnose command
 * @generated from apis/overlays/feedback.ts
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
	command: "diagnose",
	describe: "Get the project feedback prompt",
	usage:
		"$0 feedback diagnose\n\nReturns the Cloudflare team's whole-project feedback prompt. An agent follows `instructions` to review how the user's project uses Cloudflare and write a report on what got in the way, shows the user the full report, and sends it with `POST /feedback/send` once the user approves.",
	...parameters,
	loader: () => import("./diagnose.handler.js"),
});

export default command;
