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
			"$0 zero-trust casb integrations list\n\nReturns a paginated list of integrations for the account."
		)
		.option("application", {
			type: "string",
			description:
				"Filter by application/vendor (e.g., GOOGLE_WORKSPACE, MICROSOFT_INTERNAL).",
		})
		.option("direction", {
			type: "string",
			description: "Direction to order results.",
			choices: ["asc", "desc"],
		})
		.option("dlp-enabled", {
			type: "boolean",
			description: "Filter by DLP enabled status (true/false).",
		})
		.option("order", {
			type: "string",
			description: "Field to order results by.",
			choices: ["application", "created", "name", "status"],
		})
		.option("page", {
			type: "number",
			description: "Page number within the paginated result set.",
		})
		.option("page-size", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("search", {
			type: "string",
			description: "Search integrations by name or application.",
		})
		.option("status", {
			type: "string",
			description: "Filter by integration status.",
			choices: ["Healthy", "Initializing", "Offline", "Unhealthy"],
		})
		.option("use-cases", {
			type: "string",
			description:
				"Filter by enabled use cases (e.g., casb, ces). Matches integrations enrolled in any of the specified values. Can be specified multiple times.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"list_integrations_v2">;
type Query = SdkQuery<"list_integrations_v2">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		order: Query["order"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List integrations",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb integrations list",
				classification: {
					safeFlags: ["direction", "dlp-enabled", "order", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					application: argv["application"],
					direction: argv["direction"],
					dlp_enabled: argv["dlp-enabled"],
					order: argv["order"],
					page: argv["page"],
					page_size: argv["page-size"],
					search: argv["search"],
					status: argv["status"],
					use_cases: argv["use-cases"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb integrations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/one/integrations`,
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
					client.zeroTrust.casb.integrations.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
