import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit advanced-tcp-protection configs syn protection rules create\n\nCreate a SYN Protection rule for an account."
		)
		.option("burst-sensitivity", {
			type: "string",
			description:
				"The burst sensitivity. Must be one of 'low', 'medium', 'high'.",
		})
		.option("mitigation-type", {
			type: "string",
			description:
				"The type of mitigation. Must be one of 'challenge' or 'retransmit'. Optional. Defaults to 'challenge'.",
		})
		.option("name", {
			type: "string",
			description:
				"The name of the SYN Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'.",
		})
		.option("rate-sensitivity", {
			type: "string",
			description:
				"The rate sensitivity. Must be one of 'low', 'medium', 'high'.",
		})
		.option("scope", {
			type: "string",
			description:
				"The scope for the SYN Protection rule. Must be one of 'global', 'region', or 'datacenter'.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "The new SYN Protection rule to add.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createSynProtectionRule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create SYN Protection rule.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs syn protection rules create",
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
							"cf magic-transit advanced-tcp-protection configs syn protection rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/syn_protection/rules`,
						pathParams: {},
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
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										rate_sensitivity: resolveFileToken(
											argv["rate-sensitivity"] as string | undefined,
											"rate-sensitivity",
											"text"
										),
										scope: resolveFileToken(
											argv["scope"] as string | undefined,
											"scope",
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
					const result = await withProgress(`Creating`, async () =>
						client.magicTransit.advancedTcpProtection.configs.syn.protection.rules.create(
							{ ...bodyData, account_id: accountId } satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["burst-sensitivity"] === undefined) {
					argv["burst-sensitivity"] = await promptForRequiredField(
						"burst-sensitivity",
						"The burst sensitivity. Must be one of 'low', 'medium', 'high'."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the SYN Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'."
					);
				}
				if (argv["rate-sensitivity"] === undefined) {
					argv["rate-sensitivity"] = await promptForRequiredField(
						"rate-sensitivity",
						"The rate sensitivity. Must be one of 'low', 'medium', 'high'."
					);
				}
				if (argv["scope"] === undefined) {
					argv["scope"] = await promptForRequiredField(
						"scope",
						"The scope for the SYN Protection rule. Must be one of 'global', 'region', or 'datacenter'."
					);
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
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					rate_sensitivity: resolveFileToken(
						argv["rate-sensitivity"] as string | undefined,
						"rate-sensitivity",
						"text"
					),
					scope: resolveFileToken(
						argv["scope"] as string | undefined,
						"scope",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.magicTransit.advancedTcpProtection.configs.syn.protection.rules.create(
						{ ...bodyData, account_id: accountId } satisfies Request
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
