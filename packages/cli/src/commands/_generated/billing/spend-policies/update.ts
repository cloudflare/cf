/**
 * update command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"if-match": {
			kind: "parsed",
			brief:
				'The policy `version` the change is based on, as returned in `ETag`. Quoted (`"3"`) and bare (`3`) values are both accepted. Weak ETags (`W/"3"`) and `*` are not.',
			parse: String,
		},
		action: {
			kind: "parsed",
			brief:
				"The action taken when the threshold is reached. `notification` sends an email to `notification_email`. `usage_block` blocks further usage of the product until the end of the billing period. Raising the threshold above the current balance, disabling the policy, or deleting it lifts the block early.",
			optional: true,
			choices: ["notification", "usage_block"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		enabled: {
			kind: "boolean",
			brief: "Whether the policy is evaluated.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief:
				"Display name of the policy. After surrounding whitespace is trimmed, it must be 1 to 200 bytes long. The value is stored as sent, untrimmed.",
			optional: true,
			parse: String,
		},
		"notification-email": {
			kind: "parsed",
			brief:
				"Email address that receives notifications. Required when `action` is `notification`. When set, it must be a bare address (`user@example.com`); display-name forms such as `Name <user@example.com>` are rejected.",
			optional: true,
			parse: String,
		},
		"product-id": {
			kind: "parsed",
			brief:
				"The product the policy applies to: `workers` or `durable_objects`. Each product's balance and policies are separate. Both products support `notification` and `usage_block` policies on create and update.",
			optional: true,
			choices: ["workers", "durable_objects"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "product-id", "text"),
		},
		"threshold-cents": {
			kind: "parsed",
			brief:
				"The spend threshold for the current billing period, in US cents. Must be greater than zero.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"A spend policy as sent on create and on full replacement. Unknown fields and trailing JSON are rejected. Only the first 1 MiB of the body is read.",
			optional: true,
			parse: String,
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
	command: "update <policy-id>",
	describe: "Update Spend Policy",
	usage:
		"$0 billing spend-policies update <policy-id>\n\nReplaces the whole spend policy. Every field is required, as on create; there are no partial updates and `PATCH` is not supported. The `If-Match` header must equal the policy's current `version`. On success, `version` goes up by one and the new value is returned in `ETag`.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
