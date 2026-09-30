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
 * @generated from apis/overlays/network.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network routes hostname list\n\nLists and filters hostname routes in an account."
		)
		.option("id", { type: "string", description: "The hostname route ID." })
		.option("hostname", {
			type: "string",
			description:
				"If set, only list hostname routes that contain a substring of the given value, the filter is case-insensitive.",
		})
		.option("tunnel-id", {
			type: "string",
			description:
				"If set, only list hostname routes that point to a specific tunnel.",
		})
		.option("comment", {
			type: "string",
			description: "If set, only list hostname routes with the given comment.",
		})
		.option("existed-at", {
			type: "string",
			description:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
		})
		.option("is-deleted", {
			type: "boolean",
			description:
				"If `true`, only return deleted hostname routes. If `false`, exclude deleted hostname routes.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to display.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"zero-trust-networks-route-hostname-list">;
type Query = SdkQuery<"zero-trust-networks-route-hostname-list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List hostname routes",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network routes hostname list",
				classification: {
					safeFlags: ["is-deleted", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					id: argv["id"],
					hostname: argv["hostname"],
					tunnel_id: argv["tunnel-id"],
					comment: argv["comment"],
					existed_at: argv["existed-at"],
					is_deleted: argv["is-deleted"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes hostname list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/routes/hostname`,
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
					client.network.routes.hostname.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
