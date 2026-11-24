/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		status: {
			kind: "enum",
			brief:
				"Selects approval statuses. Repeat the parameter to OR-match statuses (for example, status=pending&status=rejected). Use status=all alone to disable status filtering.",
			values: ["pending", "approved", "rejected", "cancelled", "all"],
			optional: true,
		},
		"latest-only": {
			kind: "enum",
			brief: "When true, returns the newest revision in each approval chain.",
			values: ["true", "false"],
			optional: true,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
		"reviewer-scope": {
			kind: "enum",
			brief: "Limits approvals to the specified reviewer scope.",
			values: ["default", "email", "unresolved"],
			optional: true,
		},
		"change-type": {
			kind: "enum",
			brief: "Limits approvals to the specified mutation type.",
			values: ["create", "update", "delete"],
			optional: true,
		},
		"rule-id": {
			kind: "parsed",
			brief: "Filter approvals by rule ID.",
			optional: true,
			parse: String,
		},
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
	describe: "List rule approvals",
	usage:
		"$0 cloudforce-one rules approvals list\n\nReturns rule approvals with optional status, revision, reviewer-scope, and mutation-type filtering.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
