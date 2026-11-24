/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "Fetch limits associated with DLP for account",
	usage:
		"$0 zero-trust dlp limits list\n\nRetrieves current DLP usage limits and quotas for the account, including maximum allowed counts and current usage for custom entries, dataset cells, and document fingerprints.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
