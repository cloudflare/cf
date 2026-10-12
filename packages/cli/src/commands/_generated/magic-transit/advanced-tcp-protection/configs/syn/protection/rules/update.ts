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
			"$0 magic-transit advanced-tcp-protection configs syn protection rules update <rule-id>\n\nUpdate a SYN Protection rule specified by the given UUID."
		)
		.positional("rule-id", {
			type: "string",
			description: "The UUID of the SYN Protection rule to update.",
			demandOption: true,
		})
		.option("burst-sensitivity", {
			type: "string",
			description:
				"The new burst sensitivity. Optional. Must be one of 'low', 'medium', 'high'.",
		})
		.option("mitigation-type", {
			type: "string",
			description:
				"The new mitigation type. Optional. Must be one of 'challenge' or 'retransmit'.",
		})
		.option("rate-sensitivity", {
			type: "string",
			description:
				"The new rate sensitivity. Optional. Must be one of 'low', 'medium', 'high'.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "The fields to update on the SYN Protection rule.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateSynProtectionRule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <rule-id>",
	describe: "Update SYN Protection rule.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs syn protection rules update",
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
							"cf magic-transit advanced-tcp-protection configs syn protection rules update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/syn_protection/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										burst_sensitivity: resolveFileToken(
											argv["burst-sensitivity"] as string | undefined,
											"burst-sensitivity",
											"text"
										),
										mitigation_type: resolveFileToken(
											argv["mitigation-type"] as string | undefined,
											"mitigation-type",
											"text"
										),
										rate_sensitivity: resolveFileToken(
											argv["rate-sensitivity"] as string | undefined,
											"rate-sensitivity",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.advancedTcpProtection.configs.syn.protection.rules.update(
							{
								...bodyData,
								account_id: accountId,
								rule_id: argv["rule-id"],
							} satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					burst_sensitivity: resolveFileToken(
						argv["burst-sensitivity"] as string | undefined,
						"burst-sensitivity",
						"text"
					),
					mitigation_type: resolveFileToken(
						argv["mitigation-type"] as string | undefined,
						"mitigation-type",
						"text"
					),
					rate_sensitivity: resolveFileToken(
						argv["rate-sensitivity"] as string | undefined,
						"rate-sensitivity",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.advancedTcpProtection.configs.syn.protection.rules.update(
						{
							...bodyData,
							account_id: accountId,
							rule_id: argv["rule-id"],
						} satisfies Request
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
