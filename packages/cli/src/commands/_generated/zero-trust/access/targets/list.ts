import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
		.usage(
			"$0 zero-trust access targets list\n\nLists and sorts an account's targets. Filters are optional and are ANDed together."
		)
		.option("hostname", { type: "string", description: "Hostname of a target" })
		.option("hostname-contains", {
			type: "string",
			description: "Partial match to the hostname of a target",
		})
		.option("virtual-network-id", {
			type: "string",
			description: "Private virtual network identifier of the target",
		})
		.option("ip-v4", {
			type: "string",
			description: "IPv4 address of the target",
		})
		.option("ip-v6", {
			type: "string",
			description: "IPv6 address of the target",
		})
		.option("created-before", {
			type: "string",
			description:
				"Date and time at which the target was created before (inclusive)",
		})
		.option("created-after", {
			type: "string",
			description:
				"Date and time at which the target was created after (inclusive)",
		})
		.option("modified-before", {
			type: "string",
			description:
				"Date and time at which the target was modified before (inclusive)",
		})
		.option("modified-after", {
			type: "string",
			description:
				"Date and time at which the target was modified after (inclusive)",
		})
		.option("ips", {
			type: "string",
			description:
				"Filters for targets that have any of the following IP addresses. Specify\n`ips` multiple times in query parameter to build list of candidates.",
		})
		.option("target-ids", {
			type: "string",
			description:
				"Filters for targets that have any of the following UUIDs. Specify\n`target_ids` multiple times in query parameter to build list of\ncandidates.",
		})
		.option("ip-like", {
			type: "string",
			description:
				"Filters for targets whose IP addresses look like the specified string.\nSupports `*` as a wildcard character",
		})
		.option("ipv4-start", {
			type: "string",
			description:
				"Defines an IPv4 filter range's starting value (inclusive). Requires\n`ipv4_end` to be specified as well.",
		})
		.option("ipv4-end", {
			type: "string",
			description:
				"Defines an IPv4 filter range's ending value (inclusive). Requires\n`ipv4_start` to be specified as well.",
		})
		.option("ipv6-start", {
			type: "string",
			description:
				"Defines an IPv6 filter range's starting value (inclusive). Requires\n`ipv6_end` to be specified as well.",
		})
		.option("ipv6-end", {
			type: "string",
			description:
				"Defines an IPv6 filter range's ending value (inclusive). Requires\n`ipv6_start` to be specified as well.",
		})
		.option("tag", {
			type: "string",
			description:
				"Filter by tag key:value pairs. Multiple `tag` params are AND'd.\nFormat: `tag=key:value` (e.g., `tag=environment:production`).\nKey and value must both be non-empty; `tag=:value` and `tag=key:` return 400.",
		})
		.option("page", {
			type: "number",
			description: "Current page in the response",
		})
		.option("per-page", {
			type: "number",
			description: "Max amount of entries returned per page",
		})
		.option("order", {
			type: "string",
			description: "The field to sort by.",
			choices: ["hostname", "created_at"],
		})
		.option("direction", {
			type: "string",
			description: "The sorting direction.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"infra-targets-list">;
type Query = SdkQuery<"infra-targets-list">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List all targets",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access targets list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					hostname: argv["hostname"],
					hostname_contains: argv["hostname-contains"],
					virtual_network_id: argv["virtual-network-id"],
					ip_v4: argv["ip-v4"],
					ip_v6: argv["ip-v6"],
					created_before: argv["created-before"],
					created_after: argv["created-after"],
					modified_before: argv["modified-before"],
					modified_after: argv["modified-after"],
					ips: argv["ips"],
					target_ids: argv["target-ids"],
					ip_like: argv["ip-like"],
					ipv4_start: argv["ipv4-start"],
					ipv4_end: argv["ipv4-end"],
					ipv6_start: argv["ipv6-start"],
					ipv6_end: argv["ipv6-end"],
					tag: argv["tag"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access targets list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/infrastructure/targets`,
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
					client.zeroTrust.access.targets.list({
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
