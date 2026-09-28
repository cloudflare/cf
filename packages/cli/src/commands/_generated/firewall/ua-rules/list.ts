import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/firewall.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 firewall ua-rules list\n\nFetches User Agent Blocking rules in a zone. You can filter the results using several optional parameters."
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
		.option("per-page", {
			type: "number",
			description:
				"The maximum number of results per page. You can only set the value to `1` or to a multiple of 5 such as `5`, `10`, `15`, or `20`.",
		})
		.option("user-agent", {
			type: "string",
			description:
				"A string to search for in the user agent values of existing rules.",
		})
		.option("paused", {
			type: "boolean",
			description: "When true, indicates that the rule is currently paused.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"user-agent-blocking-rules-list-user-agent-blocking-rules">;
type Query =
	SdkQuery<"user-agent-blocking-rules-list-user-agent-blocking-rules">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List User Agent Blocking rules",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall ua-rules list",
				classification: {
					safeFlags: ["paused", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					description: argv["description"],
					per_page: argv["per-page"],
					user_agent: argv["user-agent"],
					paused: argv["paused"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall ua-rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/ua_rules`,
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
					client.firewall.uaRules.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
