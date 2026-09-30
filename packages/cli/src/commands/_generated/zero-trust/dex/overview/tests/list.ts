import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dex overview tests list\n\nList DEX tests with overview metrics."
		)
		.option("colo", {
			type: "string",
			description:
				"Optionally filter result stats to a Cloudflare colo. Cannot be used in combination with deviceId param.",
		})
		.option("test-name", {
			type: "string",
			description: "Optionally filter results by test name.",
		})
		.option("device-id", {
			type: "string",
			description:
				"Optionally filter result stats to a specific device(s). Cannot be used in combination with colo param.",
		})
		.option("registration-id", {
			type: "string",
			description:
				"Optionally filter results to a specific device registration. Must be used in combination with a single deviceId.",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page",
		})
		.option("kind", {
			type: "string",
			description: "Filter by test type.",
			choices: ["http", "traceroute"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"dex-endpoints-list-tests-overview">;
type Query = SdkQuery<"dex-endpoints-list-tests-overview">;

const typedBuilder = withArgTypes<
	{
		kind: Query["kind"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List DEX test analytics",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex overview tests list",
				classification: {
					safeFlags: ["kind", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					colo: argv["colo"],
					testName: argv["test-name"],
					deviceId: argv["device-id"],
					registration_id: argv["registration-id"],
					page: argv["page"],
					per_page: argv["per-page"],
					kind: argv["kind"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex overview tests list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/tests/overview`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.dex.overview.tests.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
