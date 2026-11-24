/**
 * edit command
 * @generated from apis/overlays/accounts.ts
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
			brief:
				'Enables Unique Transformations billing for the account.\nNote: once enabled, this setting cannot be set back to "off".\n',
			optional: true,
			choices: ["on"],
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Change Unique Transformations billing setting",
	usage:
		'$0 accounts ut-billing edit\n\nUpdates the Unique Transformations billing configuration for an account. When enabled, billing data is directed to the Transformations pipeline. Note: setting the value to "off" is not permitted once enabled.',
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
