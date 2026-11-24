/**
 * delete command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"if-match": {
			kind: "parsed",
			brief:
				'The policy `version` the change is based on, as returned in `ETag`. Quoted (`"3"`) and bare (`3`) values are both accepted. Weak ETags (`W/"3"`) and `*` are not.',
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "Identifies the spend policy.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <policy-id>",
	describe: "Delete Spend Policy",
	usage:
		"$0 billing spend-policies delete <policy-id>\n\nSoft-deletes the spend policy. The policy is disabled and no longer appears in list, get or audit responses. The `If-Match` header must equal the policy's current `version`.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
