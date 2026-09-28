import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * bulk-get command
 * @generated from apis/overlays/ai-audit.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-audit robots bulk-get\n\nFetches and parses robots.txt files for multiple domains within a zone in a single request. Each domain must belong to the specified zone. Results are keyed by hostname."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Array of domain hostnames to fetch robots.txt for. Each domain must end with the zone name. Maximum 25 domains per request.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ai-audit-bulk-get-robots">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk-get",
	describe: "Bulk get robots.txt rules",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-audit robots bulk-get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ai-audit robots bulk-get",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/ai-audit/robots/bulk`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					if (Array.isArray(bodyData) && bodyData.length > 25) {
						const total = Math.ceil(bodyData.length / 25);
						let result: unknown = null;
						for (let i = 0; i < bodyData.length; i += 25) {
							const batch = bodyData.slice(i, i + 25);
							const batchNum = Math.floor(i / 25) + 1;
							result = await withProgress(
								`Loading: batch ${batchNum}/${total}`,
								async () =>
									requestApi<unknown>(
										client,
										"POST",
										`/zones/${argv.zoneId}/ai-audit/robots/bulk`,
										{ body: batch }
									)
							);
						}
						formatOutput(result, { successLabel: `Loaded` });
						return;
					}
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/zones/${argv.zoneId}/ai-audit/robots/bulk`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
