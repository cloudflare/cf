/**
 * get command
 * @generated from apis/overlays/ssl.ts
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
	command: "get",
	describe: "Get Enablement Setting for Zone",
	usage:
		"$0 ssl origin-tls-client-auth settings get\n\nGet whether zone-level authenticated origin pulls is enabled or not. It is false by default.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
