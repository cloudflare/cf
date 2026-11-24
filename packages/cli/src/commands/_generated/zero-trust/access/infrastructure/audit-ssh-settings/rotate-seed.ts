/**
 * rotate-seed command
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
	command: "rotate-seed",
	describe: "Rotate Zero Trust SSH account seed",
	usage:
		"$0 zero-trust access infrastructure audit-ssh-settings rotate-seed\n\nRotate the SSH account seed that generates the host key identity when connecting through the Cloudflare SSH Proxy.",
	...parameters,
	loader: () => import("./rotate-seed.handler.js"),
});

export default command;
