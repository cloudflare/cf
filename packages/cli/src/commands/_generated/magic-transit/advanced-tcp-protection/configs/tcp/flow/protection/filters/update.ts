import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit advanced-tcp-protection configs tcp flow protection filters update <filter-id>\n\nUpdate a TCP Flow Protection filter specified by the given UUID."
		)
		.positional("filter-id", {
			type: "string",
			description: "The UUID of the filter to update.",
			demandOption: true,
		})
		.option("expression", {
			type: "string",
			description: "The new filter expression. Optional.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "The updates to apply to the filter.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateTcpFlowProtectionFilter">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <filter-id>",
	describe: "Update TCP Flow Protection filter.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs tcp flow protection filters update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs tcp flow protection filters update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/tcp_flow_protection/filters/${argv["filter-id"] == null ? "<filter-id>" : encodeURIComponent(String(argv["filter-id"]))}`,
						pathParams: { "filter-id": String(argv["filter-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.advancedTcpProtection.configs.tcp.flow.protection.filters.update(
							{
								body: bodyData,
								account_id: accountId,
								filter_id: argv["filter-id"],
							} satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.advancedTcpProtection.configs.tcp.flow.protection.filters.update(
						{
							body: bodyData,
							account_id: accountId,
							filter_id: argv["filter-id"],
						} satisfies Request
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
