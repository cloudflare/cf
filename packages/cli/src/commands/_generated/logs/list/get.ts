import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/logs.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logs list get\n\nLists R2 objects containing logs matching the provided query parameters."
		)
		.option("start", {
			type: "string",
			description: "Start time in RFC3339 format.",
			demandOption: true,
		})
		.option("end", {
			type: "string",
			description: "End time in RFC3339 format.",
			demandOption: true,
		})
		.option("bucket", {
			type: "string",
			description: "R2 bucket name.",
			demandOption: true,
		})
		.option("prefix", {
			type: "string",
			description: "R2 bucket prefix logs are stored under.",
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of results to return.",
		})
		.option("r2-access-key-id", {
			type: "string",
			description: "The R2-Access-Key-Id header",
			demandOption: true,
		})
		.option("r2-secret-access-key", {
			type: "string",
			description: "The R2-Secret-Access-Key header",
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
	command: "get",
	describe: "List log files",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logs list get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					start: argv["start"],
					end: argv["end"],
					bucket: argv["bucket"],
					prefix: argv["prefix"],
					limit: argv["limit"],
				};

				const headers: Record<string, string> = {};
				if (argv["r2-access-key-id"] !== undefined)
					headers["R2-Access-Key-Id"] = String(argv["r2-access-key-id"]);
				if (argv["r2-secret-access-key"] !== undefined)
					headers["R2-Secret-Access-Key"] = String(
						argv["r2-secret-access-key"]
					);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf logs list get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logs/list`,
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
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/logs/list`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
