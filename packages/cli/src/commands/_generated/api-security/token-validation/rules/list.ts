import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security token-validation rules list\n\nLists token validation rules for the zone, with filters for configuration, action, state, ID, and host."
		)
		.option("per-page", {
			type: "number",
			description: "Maximum number of results per page.",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("token-configuration", {
			type: "string",
			description: "Select rules using any of these token configurations.",
		})
		.option("action", {
			type: "string",
			description:
				"Action to take on requests that match operations included in `selector` and fail `expression`.",
			choices: ["log", "block"],
		})
		.option("enabled", {
			type: "boolean",
			description: "Toggle rule on or off.",
		})
		.option("id", {
			type: "string",
			description: "Select rules with these IDs.",
		})
		.option("rule-id", {
			type: "string",
			description: "Select rules with these IDs.",
		})
		.option("host", {
			type: "string",
			description: "Select rules with this host in `include`.",
		})
		.option("hostname", {
			type: "string",
			description: "Select rules with this host in `include`.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"token-validation-rules-list">;
type Query = SdkQuery<"token-validation-rules-list">;

const typedBuilder = withArgTypes<
	{
		action: Query["action"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List token validation rules",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security token-validation rules list",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					per_page: argv["per-page"],
					page: argv["page"],
					token_configuration: argv["token-configuration"],
					action: argv["action"],
					enabled: argv["enabled"],
					id: argv["id"],
					rule_id: argv["rule-id"],
					host: argv["host"],
					hostname: argv["hostname"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security token-validation rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/rules`,
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
					client.apiSecurity.tokenValidation.rules.list({
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
