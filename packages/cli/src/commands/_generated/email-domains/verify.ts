import operation from "../_operations/email-domains/verify.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * verify command
 * @generated from apis/overlays/email-domains.ts
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
			"$0 email-domains verify <email-domain-id>\n\nRequires an empty body. Schedules an expedited check and coalesces queued or leased work. It does not accept verification results, bypass activation gates, or perform customer DNS checks synchronously. Follow the Location header after Retry-After seconds until verification.observed_at appears or advances beyond the value in this 202 response; status may remain unchanged. Candidate expiry returns 404. Available only to the configured OpenAI pilot account behind a default-off gate. Authentication failures may use the gateway error envelope."
		)
		.positional("email-domain-id", {
			type: "string",
			description: "Email domain ID",
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
	command: "verify <email-domain-id>",
	describe: "Verify an Email Domain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-domains verify",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-domains verify",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/domains/${argv["email-domain-id"] == null ? "<email-domain-id>" : encodeURIComponent(String(argv["email-domain-id"]))}/verify`,
						pathParams: {
							"email-domain-id": String(argv["email-domain-id"] ?? ""),
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
						email_domain_id: argv["email-domain-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
