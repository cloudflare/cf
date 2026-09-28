import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get-registration-status command
 * @generated from apis/overlays/registrar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 registrar registrations get-registration-status <domain-name>\n\nReturns the current status of a domain registration workflow. Use this endpoint to poll for completion when the POST response returned `202 Accepted`. The URL is provided in the `links.self` field of the workflow status response. Poll this endpoint until the workflow reaches a terminal state or a state that requires user attention. **Terminal states:** `succeeded` and `failed` are terminal and always have `completed: true`. **Non-terminal states:** - `action_required` has `completed: false` and will not resolve on its own. The workflow is paused pending user intervention. - `blocked` has `completed: false` and indicates the workflow is waiting on a third party such as the extension registry or losing registrar. Continue polling while informing the user of the delay. Use increasing backoff between polls. When `state: blocked`, use a longer polling interval and do not poll indefinitely. A naive polling loop that only checks `completed` can run indefinitely when `state: action_required`. Break explicitly on `action_required`: ```js let status; do { await new Promise(r => setTimeout(r, 2000)); status = await cloudflare.request({ method: 'GET', path: reg.result.links.self, }); } while ( !status.result.completed && status.result.state !== 'action_required' ); if (status.result.state === 'action_required') { // Surface context.action and context.confirmation_sent_to to the user. // Do not re-submit the registration request. } ```"
		)
		.positional("domain-name", {
			type: "string",
			description:
				"Provides a fully qualified domain name (FQDN), including the extension (e.g., \`example.com\`, \`mybrand.app\`). The domain name uniquely identifies a registration. Cloudflare permits only one registration per domain, making the domain name a natural idempotency key for registration requests.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"registrar-domain-registration-get-status">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-registration-status <domain-name>",
	describe: "Get Registration Status",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar registrations get-registration-status",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar registrations get-registration-status",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/registrations/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}/registration-status`,
						pathParams: { "domain-name": String(argv["domain-name"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.registrar.registrations.getRegistrationStatus({
						account_id: accountId,
						domain_name: argv["domain-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
