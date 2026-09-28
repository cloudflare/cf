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
			"$0 magic-transit advanced-dns-protection configs dns protection rules update <rule-id>\n\nUpdate a DNS Protection rule specified by the given UUID."
		)
		.positional("rule-id", {
			type: "string",
			description: "The UUID of the DNS Protection rule to update.",
			demandOption: true,
		})
		.option("block-any-queries", {
			type: "boolean",
			description:
				"The new value for whether to block DNS ANY queries. Optional.",
		})
		.option("burst-sensitivity", {
			type: "string",
			description:
				"The new burst sensitivity. Optional. Must be one of 'low', 'medium', 'high'.",
		})
		.option("profile-sensitivity", {
			type: "string",
			description:
				"The new profile sensitivity. Optional. Recommended setting is 'low'. Must be one of 'low', 'medium', 'high', or 'very_high'.",
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
			description: "The updates to apply to the DNS Protection rule.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateDnsProtectionRule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <rule-id>",
	describe: "Update DNS Protection rule.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-dns-protection configs dns protection rules update",
				classification: {
					safeFlags: ["block-any-queries", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-dns-protection configs dns protection rules update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_dns_protection/configs/dns_protection/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										block_any_queries: argv["block-any-queries"],
										burst_sensitivity: resolveFileToken(
											argv["burst-sensitivity"] as string | undefined,
											"burst-sensitivity",
											"text"
										),
										profile_sensitivity: resolveFileToken(
											argv["profile-sensitivity"] as string | undefined,
											"profile-sensitivity",
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
						client.magicTransit.advancedDnsProtection.configs.dns.protection.rules.update(
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
					block_any_queries: argv["block-any-queries"],
					burst_sensitivity: resolveFileToken(
						argv["burst-sensitivity"] as string | undefined,
						"burst-sensitivity",
						"text"
					),
					profile_sensitivity: resolveFileToken(
						argv["profile-sensitivity"] as string | undefined,
						"profile-sensitivity",
						"text"
					),
					rate_sensitivity: resolveFileToken(
						argv["rate-sensitivity"] as string | undefined,
						"rate-sensitivity",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.advancedDnsProtection.configs.dns.protection.rules.update(
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
