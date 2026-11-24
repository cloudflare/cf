/**
 * patch command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief: "Controls enablement of Automatic SSL/TLS.",
			optional: true,
			choices: ["auto", "custom"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update enablement of Automatic SSL/TLS.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "patch",
	describe: "Patch Automatic SSL/TLS Enrollment status for given zone",
	usage:
		'$0 ssl automatic-upgrader patch\n\nThe automatic system is enabled when this endpoint is hit with value in the request body is set to "auto", and disabled when the request body value is set to "custom".',
	...parameters,
	loader: () => import("./patch.handler.js"),
});

export default command;
