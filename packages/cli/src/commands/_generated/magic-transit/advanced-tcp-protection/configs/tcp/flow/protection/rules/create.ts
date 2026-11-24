import operation from "../../../../../../../_operations/magic-transit/advanced-tcp-protection/configs/tcp/flow/protection/rules/create.js";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create TCP Flow Protection rule.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection rules create\n\nCreate a TCP Flow Protection rule for an account.",
	flags: {
		"burst-sensitivity": {
			kind: "parsed",
			brief: "The burst sensitivity. Must be one of 'low', 'medium', 'high'.",
			optional: true,
			parse: String,
		},
		"protection-mode": {
			kind: "parsed",
			brief:
				"The mode for the TCP Flow Protection. Must be one of 'enabled', 'disabled', 'monitoring'.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the TCP Flow Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'.",
			optional: true,
			parse: String,
		},
		"rate-sensitivity": {
			kind: "parsed",
			brief: "The rate sensitivity. Must be one of 'low', 'medium', 'high'.",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief: "The scope for the TCP Flow Protection rule.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The new TCP Flow Protection rule.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs tcp flow protection rules create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["burst-sensitivity"] === undefined) {
						argv["burst-sensitivity"] = await promptForRequiredField(
							"burst-sensitivity",
							"The burst sensitivity. Must be one of 'low', 'medium', 'high'."
						);
					}
					if (argv["protection-mode"] === undefined) {
						argv["protection-mode"] = await promptForRequiredField(
							"protection-mode",
							"The mode for the TCP Flow Protection. Must be one of 'enabled', 'disabled', 'monitoring'."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name of the TCP Flow Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'."
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
							"The scope for the TCP Flow Protection rule."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs tcp flow protection rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/tcp_flow_protection/rules`,
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
										mode: resolveFileToken(
											argv["protection-mode"] as string | undefined,
											"protection-mode",
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					burst_sensitivity: resolveFileToken(
						argv["burst-sensitivity"] as string | undefined,
						"burst-sensitivity",
						"text"
					),
					mode: resolveFileToken(
						argv["protection-mode"] as string | undefined,
						"protection-mode",
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
