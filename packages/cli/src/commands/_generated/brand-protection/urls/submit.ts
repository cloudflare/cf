/**
 * submit command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		url: { kind: "parsed", brief: "An HTTP or HTTPS URL.", parse: String },
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
	command: "submit",
	describe: "Submit a URL for scanning",
	usage:
		"$0 brand-protection urls submit\n\nSubmit one unlisted URL Scanner scan. The returned URL Scanner UUID replaces the numeric v1 URL ID.",
	...parameters,
	loader: () => import("./submit.handler.js"),
});

export default command;
