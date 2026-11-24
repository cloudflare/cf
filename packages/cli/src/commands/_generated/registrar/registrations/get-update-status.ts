import operation from "../../_operations/registrar/registrations/get-update-status.js";
/**
 * get-update-status command
 * @generated from apis/overlays/registrar.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "get-update-status <domain-name>",
	describe: "Get Update Status",
	usage:
		"$0 registrar registrations get-update-status <domain-name>\n\nReturns the current status of a domain update workflow. Use this endpoint to poll for completion when the PATCH response returned `202 Accepted`. The URL is provided in the `links.self` field of the workflow status response. Poll this endpoint until the workflow reaches a terminal state or a state that requires user attention. Use increasing backoff between polls. When the workflow remains blocked on a third party, use a longer polling interval and do not poll indefinitely.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar registrations get-update-status",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar registrations get-update-status",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/registrations/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}/update-status`,
						pathParams: { "domain-name": String(argv["domain-name"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						domain_name: argv["domain-name"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
