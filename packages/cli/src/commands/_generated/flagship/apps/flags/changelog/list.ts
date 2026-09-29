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
 * list command
 * @generated from apis/overlays/flagship.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 flagship apps flags changelog list\n\nReturns the audit history for a flag, newest first. Each entry includes the event type and full flag state after the change; `update` entries include a field-level diff. Capped at 200 entries per flag."
		)
		.option("app-id", {
			type: "string",
			description: "Flagship app ID returned when the app was created.",
			demandOption: true,
		})
		.option("flag-key", {
			type: "string",
			description: "Case-sensitive key identifying the flag within the app.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description: "Max items to return (1–200).",
		})
		.option("cursor", {
			type: "string",
			description: "Pagination cursor from a previous response.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"flagship_get_flag_changelog">;
type Query = SdkQuery<"flagship_get_flag_changelog">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List flag changelog entries",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags changelog list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf flagship apps flags changelog list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags/${argv["flag-key"] == null ? "<flag-key>" : encodeURIComponent(String(argv["flag-key"]))}/changelog`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"flag-key": String(argv["flag-key"] ?? ""),
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
					client.flagship.apps.flags.changelog.list({
						account_id: accountId,
						app_id: argv["app-id"],
						flag_key: argv["flag-key"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
