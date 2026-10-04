import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/mesh.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 mesh nodes list\n\nLists and filters Mesh nodes in an account.")
		.option("name", {
			type: "string",
			description: "A user-friendly name for the tunnel.",
		})
		.option("is-deleted", {
			type: "boolean",
			description:
				"If `true`, only include deleted tunnels. If `false`, exclude deleted tunnels. If empty, all tunnels will be included.",
		})
		.option("existed-at", {
			type: "string",
			description:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
		})
		.option("uuid", { type: "string", description: "UUID of the tunnel." })
		.option("was-active-at", { type: "string", description: "Was active at" })
		.option("was-inactive-at", {
			type: "string",
			description: "Was inactive at",
		})
		.option("include-prefix", { type: "string", description: "Include prefix" })
		.option("exclude-prefix", { type: "string", description: "Exclude prefix" })
		.option("status", {
			type: "string",
			description:
				"The status of the tunnel. Valid values are `inactive` (tunnel has never been run), `degraded` (tunnel is active and able to serve traffic but in an unhealthy state), `healthy` (tunnel is active and able to serve traffic), or `down` (tunnel can not serve traffic as it has no connections to the Cloudflare Edge).",
			choices: ["inactive", "degraded", "healthy", "down"],
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to display.",
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

type Request = SdkRequest<"cloudflare-tunnel-list-warp-connector-tunnels">;
type Query = SdkQuery<"cloudflare-tunnel-list-warp-connector-tunnels">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Mesh nodes",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mesh nodes list",
				classification: {
					safeFlags: ["is-deleted", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					name: argv["name"],
					is_deleted: argv["is-deleted"],
					existed_at: argv["existed-at"],
					uuid: argv["uuid"],
					was_active_at: argv["was-active-at"],
					was_inactive_at: argv["was-inactive-at"],
					include_prefix: argv["include-prefix"],
					exclude_prefix: argv["exclude-prefix"],
					status: argv["status"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector`,
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
					client.mesh.nodes.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
