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
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dex test-results http percentiles get <test-id>\n\nGet percentiles for an http test for a given time period between 1 hour and 7 days."
		)
		.positional("test-id", {
			type: "string",
			description: "Unique identifier for a specific test.",
			demandOption: true,
		})
		.option("device-id", {
			type: "string",
			description:
				"Optionally filter result stats to a specific device(s). Cannot be used in combination with colo param.",
		})
		.option("from", {
			type: "string",
			description:
				"Start time for the query in ISO (RFC3339 - ISO 8601) format.",
			demandOption: true,
		})
		.option("to", {
			type: "string",
			description: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			demandOption: true,
		})
		.option("colo", {
			type: "string",
			description:
				"Optionally filter result stats to a Cloudflare colo. Cannot be used in combination with deviceId param.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dex-endpoints-http-test-percentiles">;
type Query = SdkQuery<"dex-endpoints-http-test-percentiles">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <test-id>",
	describe: "Get percentiles for an http test",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex test-results http percentiles get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					deviceId: argv["device-id"],
					from: argv["from"],
					to: argv["to"],
					colo: argv["colo"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex test-results http percentiles get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/http-tests/${argv["test-id"] == null ? "<test-id>" : encodeURIComponent(String(argv["test-id"]))}/percentiles`,
						pathParams: { "test-id": String(argv["test-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.dex.testResults.http.percentiles.get({
						account_id: accountId,
						test_id: argv["test-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
