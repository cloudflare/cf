import operation from "../../_operations/tunnels/hostnames/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/tunnels.ts
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
			"$0 tunnels hostnames list\n\nLists and filters the hostnames assigned to a tunnel."
		)
		.option("tunnel-id", {
			type: "string",
			description: "UUID of the tunnel.",
			demandOption: true,
		})
		.option("hostname", {
			type: "string",
			description:
				"If set, only list tunnel hostnames that contain this value. The filter is case-insensitive.",
		})
		.option("canonical", {
			type: "boolean",
			description:
				"If set, only list tunnel hostnames with the specified canonical status.",
		})
		.option("is-deleted", {
			type: "boolean",
			description:
				"If `true`, only return deleted tunnel hostnames. If `false` or omitted, exclude deleted tunnel hostnames.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of results to display, up to 1000. The server caps larger values at 1000.",
		})
		.option("page", { type: "number", description: "Page number to return." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tunnel hostnames",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels hostnames list",
				classification: {
					safeFlags: ["canonical", "is-deleted", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					hostname: argv["hostname"],
					canonical: argv["canonical"],
					is_deleted: argv["is-deleted"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels hostnames list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/tunnels/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/hostnames`,
						pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
						query: queryParams,
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
						tunnel_id: argv["tunnel-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
