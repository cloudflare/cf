/**
 * update command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		emails: {
			kind: "parsed",
			brief:
				"Email addresses that receive CT alert notifications for the zone. A maximum of 100 addresses may be configured. Each address must be a valid RFC 5322 email address and must not contain a comma. Omitted from responses when no addresses are configured.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether CT alerting is enabled for the zone.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for updating CT alerting subscription settings.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update CT Alerting Subscription",
	usage:
		"$0 ssl ct-alerting update\n\nCreate or update the Certificate Transparency alerting subscription for a zone. Enables or disables email notifications when certificates are issued for the zone's domains. The `enabled` field is required on every request and controls whether the subscription is active. The `emails` field is optional and, when provided, replaces the stored recipient list for the zone. When `emails` is omitted, the stored recipient list is preserved and only the enabled state is toggled. A maximum of 100 email addresses may be configured per zone. Requests that omit `enabled` are rejected with error code 1008. Subscribe and unsubscribe notification emails are only sent for recipients whose effective subscription state changes. Idempotent requests (no state change) send no notification email.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
