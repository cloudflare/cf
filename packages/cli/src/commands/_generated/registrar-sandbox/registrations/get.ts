import operation from "../../_operations/registrar-sandbox/registrations/get.js";
/**
 * get command
 * @generated from apis/overlays/registrar-sandbox.ts
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
	command: "get <domain-name>",
	describe: "Get Registration",
	usage:
		"$0 registrar-sandbox registrations get <domain-name>\n\nReturns the current state of a domain registration. This is the canonical read endpoint for a domain you own. It returns the full registration resource including current settings and expiration. When the registration resource is ready, both `created_at` and `expires_at` are present in the response.",
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
			brief: "Domain name to retrieve.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar-sandbox registrations get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar-sandbox registrations get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar-sandbox/registrations/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}`,
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
