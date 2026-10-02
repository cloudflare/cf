import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/firewall.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 firewall lockdowns list\n\nFetches Zone Lockdown rules. You can filter the results using several optional parameters."
		)
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("description", {
			type: "string",
			description:
				"A string to search for in the description of existing rules.",
		})
		.option("modified-on", {
			type: "string",
			description: "The timestamp of when the rule was last modified.",
		})
		.option("ip", {
			type: "string",
			description: "A single IP address to search for in existing rules.",
		})
		.option("priority", {
			type: "number",
			description:
				"The priority of the rule to control the processing order. A lower number indicates higher priority. If not provided, any rules with a configured priority will be processed before rules without a priority.",
		})
		.option("uri-search", {
			type: "string",
			description:
				"A single URI to search for in the list of URLs of existing rules.",
		})
		.option("ip-range-search", {
			type: "string",
			description: "A single IP address range to search for in existing rules.",
		})
		.option("per-page", {
			type: "number",
			description:
				"The maximum number of results per page. You can only set the value to `1` or to a multiple of 5 such as `5`, `10`, `15`, or `20`.",
		})
		.option("created-on", {
			type: "string",
			description: "The timestamp of when the rule was created.",
		})
		.option("description-search", {
			type: "string",
			description:
				"A string to search for in the description of existing rules.",
		})
		.option("ip-search", {
			type: "string",
			description: "A single IP address to search for in existing rules.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"zone-lockdown-list-zone-lockdown-rules">;
type Query = SdkQuery<"zone-lockdown-list-zone-lockdown-rules">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Zone Lockdown rules",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall lockdowns list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					description: argv["description"],
					modified_on: argv["modified-on"],
					ip: argv["ip"],
					priority: argv["priority"],
					uri_search: argv["uri-search"],
					ip_range_search: argv["ip-range-search"],
					per_page: argv["per-page"],
					created_on: argv["created-on"],
					description_search: argv["description-search"],
					ip_search: argv["ip-search"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall lockdowns list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/lockdowns`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.firewall.lockdowns.list({
						zone_id: zoneId,
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
