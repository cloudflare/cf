/**
 * evaluate-existing command
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
	operands: [
		{
			placeholder: "webhook-id",
			brief: "A UUID identifying the webhook configuration.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "evaluate-existing <webhook-id>",
	describe: "Test an existing webhook configuration",
	usage:
		'$0 zero-trust casb webhooks evaluate-existing <webhook-id>\n\nSends a test webhook event using an existing webhook configuration. This allows customers to verify their webhook endpoint is still reachable and properly configured after creating the webhook resource. The test payload includes: - event_type: "webhook.test" - timestamp: Current UTC timestamp - message: Test message indicating this is from Cloudflare CASB - data: Object with test: true',
	...parameters,
	loader: () => import("./evaluate-existing.handler.js"),
});

export default command;
