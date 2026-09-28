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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit advanced-tcp-protection configs prefixes update <prefix-id>\n\nUpdate a prefix specified by the given UUID."
		)
		.positional("prefix-id", {
			type: "string",
			description: "The UUID of the prefix to update.",
			demandOption: true,
		})
		.option("comment", {
			type: "string",
			description: "A new comment for the prefix. Optional.",
		})
		.option("excluded", {
			type: "boolean",
			description: "Whether to exclude the prefix from protection. Optional.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "The updates to apply to the prefix.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updatePrefix">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <prefix-id>",
	describe: "Update prefix.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs prefixes update",
				classification: {
					safeFlags: ["excluded", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs prefixes update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/prefixes/${argv["prefix-id"] == null ? "<prefix-id>" : encodeURIComponent(String(argv["prefix-id"]))}`,
						pathParams: { "prefix-id": String(argv["prefix-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										excluded: argv["excluded"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.advancedTcpProtection.configs.prefixes.update({
							...bodyData,
							account_id: accountId,
							prefix_id: argv["prefix-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					excluded: argv["excluded"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.advancedTcpProtection.configs.prefixes.update({
						...bodyData,
						account_id: accountId,
						prefix_id: argv["prefix-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
