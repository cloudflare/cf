import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/zaraz.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zaraz history configs get\n\nGets a history of published Zaraz configurations by ID(s) for a zone."
		)
		.option("ids", {
			type: "string",
			description: "Comma separated list of Zaraz configuration IDs.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get-zones-zone_identifier-zaraz-config-history">;
type Query = SdkQuery<"get-zones-zone_identifier-zaraz-config-history">;

const typedBuilder = withArgTypes<
	{
		ids: Query["ids"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get Zaraz historical configurations by ID(s)",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zaraz history configs get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					ids: argv["ids"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zaraz history configs get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/zaraz/history/configs`,
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
					client.zaraz.history.configs.get({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
