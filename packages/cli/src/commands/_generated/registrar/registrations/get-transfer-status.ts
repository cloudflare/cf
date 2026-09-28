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
 * get-transfer-status command
 * @generated from apis/overlays/registrar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 registrar registrations get-transfer-status <domain-name>\n\nReturns the current status of a domain transfer workflow. Use this endpoint to poll transfer progress after initiating a transfer with `POST /accounts/{account_id}/registrar/registrations/{domain_name}/transfer-in`. The URL is provided in the `links.self` field of the transfer response. ### Transfer timelines Transfers typically take 1–10 days due to ICANN-mandated approval windows. ### Workflow states **Terminal states:** `succeeded` and `failed` are terminal and always have `completed: true`. **Non-terminal states:** - `in_progress`: Transfer has been submitted to the registry and is being processed. Continue polling. - `blocked`: The workflow is waiting on the losing registrar or registry to release the domain. This is the **most common state** for transfers and is entirely normal — it means the ICANN transfer approval window is in effect. The losing registrar has up to 5 days to approve or reject. Continue polling with longer intervals (e.g., every 30–60 minutes). - `action_required`: The user needs to take action (e.g., the FOA email needs to be accepted). See `context` for details on what is needed. - `pending`: Transfer workflow created but not yet started processing. ### Polling guidance Adjust your polling interval based on the current workflow state: - `pending` or `in_progress`: Poll every 30 seconds. - `blocked`: The transfer is waiting on a third party (e.g., losing registrar approval). Poll every 30–60 minutes. - `action_required`: Stop polling. The workflow will not advance until the user takes action. Check `context` for details on what is needed. - `succeeded` or `failed`: Terminal — stop polling."
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

type Request = SdkRequest<"registrar-domain-transfer-get-status">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-transfer-status <domain-name>",
	describe: "Get Transfer Status",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar registrations get-transfer-status",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar registrations get-transfer-status",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/registrations/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}/transfer-in-status`,
						pathParams: { "domain-name": String(argv["domain-name"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.registrar.registrations.getTransferStatus({
						account_id: accountId,
						domain_name: argv["domain-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
