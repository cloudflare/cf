import operation from "../../_operations/brand-protection/queries/dismiss.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * dismiss command
 * @generated from apis/overlays/brand-protection.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 brand-protection queries dismiss <domain-id>\n\nMarks a matched domain as dismissed for one domain query. Dismissals are per query: dismissing a domain in one query does not affect other queries. Get `domain_id` from List domain matches with `include_domain_id=true`. Dismissing an already dismissed match succeeds. If the query or match does not exist, the request fails with error code 404."
		)
		.positional("domain-id", {
			type: "string",
			description:
				"ID of the matched domain, as returned in \`domain_id\` by List domain matches with \`include_domain_id=true\`.",
			demandOption: true,
		})
		.option("query-id", {
			type: "string",
			description: "ID of the domain query that the match belongs to.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "dismiss <domain-id>",
	describe: "Dismiss a domain match",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "brand-protection queries dismiss",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf brand-protection queries dismiss",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/queries/${argv["query-id"] == null ? "<query-id>" : encodeURIComponent(String(argv["query-id"]))}/matches/${argv["domain-id"] == null ? "<domain-id>" : encodeURIComponent(String(argv["domain-id"]))}/dismiss`,
						pathParams: {
							"query-id": String(argv["query-id"] ?? ""),
							"domain-id": String(argv["domain-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						account_id: accountId,
						query_id: argv["query-id"],
						domain_id: argv["domain-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
