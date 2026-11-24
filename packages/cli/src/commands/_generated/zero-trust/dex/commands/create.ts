/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		commands: {
			kind: "parsed",
			brief:
				'List of device-level commands to execute. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"device_id": string, "type": "pcap" | "speed-test" | "warp-diag", "user_email": string, "args"?: {...}, "registration_id"?: string}]. ? marks optional keys.',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create account commands",
	usage:
		"$0 zero-trust dex commands create\n\nInitiate commands for up to 10 devices per account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
