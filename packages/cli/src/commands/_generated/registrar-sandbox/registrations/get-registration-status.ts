/**
 * get-registration-status command
 * @generated from apis/overlays/registrar-sandbox.ts
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
			placeholder: "domain-name",
			brief:
				"Provides a fully qualified domain name (FQDN), including the extension (e.g., \`example.com\`, \`mybrand.app\`). The domain name uniquely identifies a registration. Cloudflare permits only one registration per domain, making the domain name a natural idempotency key for registration requests.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-registration-status <domain-name>",
	describe: "Get Registration Status",
	usage:
		"$0 registrar-sandbox registrations get-registration-status <domain-name>\n\nReturns the current status of a domain registration workflow. Use this endpoint to poll for completion when the POST response returned `202 Accepted`. The URL is provided in the `links.self` field of the workflow status response. Poll this endpoint until the workflow reaches a terminal state or a state that requires user attention. **Terminal states:** `succeeded` and `failed` are terminal and always have `completed: true`. **Non-terminal states:** - `action_required` has `completed: false` and will not resolve on its own. The workflow is paused pending user intervention. - `blocked` has `completed: false` and indicates the workflow is waiting on a third party such as the extension registry or losing registrar. Continue polling while informing the user of the delay. Use increasing backoff between polls. When `state: blocked`, use a longer polling interval and do not poll indefinitely. A naive polling loop that only checks `completed` can run indefinitely when `state: action_required`. Break explicitly on `action_required`: ```js let status; do { await new Promise(r => setTimeout(r, 2000)); status = await cloudflare.request({ method: 'GET', path: reg.result.links.self, }); } while ( !status.result.completed && status.result.state !== 'action_required' ); if (status.result.state === 'action_required') { // Surface context.action and context.confirmation_sent_to to the user. // Do not re-submit the registration request. } ```",
	...parameters,
	loader: () => import("./get-registration-status.handler.js"),
});

export default command;
