/**
 * make-reusable command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": { kind: "parsed", brief: "The application ID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "policy-id", brief: "The policy ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "make-reusable <policy-id>",
	describe: "Convert an Access application policy to a reusable policy",
	usage:
		"$0 zero-trust access applications policies make-reusable <policy-id>\n\nConverts an application-scoped policy to a reusable policy. The policy will no longer be exclusively scoped to the application. Further updates to the policy should go through the /accounts/{account_id}/policies/{uid} endpoint.",
	...parameters,
	loader: () => import("./make-reusable.handler.js"),
});

export default command;
