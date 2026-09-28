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
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security investigate get <investigate-id>\n\nRetrieves comprehensive details for a specific email message including headers, recipients, sender information, and current quarantine status. Use the investigate_id from search results to fetch detailed information."
		)
		.positional("investigate-id", {
			type: "string",
			description:
				"Unique identifier for a message retrieved from investigation.",
			demandOption: true,
		})
		.option("submission", {
			type: "boolean",
			description:
				"When true, search the submissions datastore only. When false or omitted, search the\nregular datastore only.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_get_message">;
type Query = SdkQuery<"email_security_get_message">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <investigate-id>",
	describe: "Get message details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security investigate get",
				classification: {
					safeFlags: ["submission", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					submission: argv["submission"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security investigate get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/${argv["investigate-id"] == null ? "<investigate-id>" : encodeURIComponent(String(argv["investigate-id"]))}`,
						pathParams: {
							"investigate-id": String(argv["investigate-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.emailSecurity.investigate.get({
						account_id: accountId,
						investigate_id: argv["investigate-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
