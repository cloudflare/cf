import operation from "../../_operations/alerting/policies/test.js";
/**
 * test command
 * @generated from apis/overlays/alerting.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "test <policy-id>",
	describe: "Test a Notification policy",
	usage:
		"$0 alerting policies test <policy-id>\n\nSend a test notification for a policy to verify delivery mechanisms are working as expected.",
	flags: {
		severity: {
			kind: "parsed",
			brief:
				"Severity level for the test alert. Defaults to INFO (1) if omitted.",
			optional: true,
			parse: Number,
		},
		source: {
			kind: "parsed",
			brief: "Source identifier for the test alert.",
			optional: true,
			parse: String,
		},
		"state-correlation-id": {
			kind: "parsed",
			brief:
				"Correlation ID for stateful test alerts. Required when state_event is set.",
			optional: true,
			parse: String,
		},
		"state-event": {
			kind: "parsed",
			brief:
				"State event type for stateful test alerts. Use with state_correlation_id.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Optional configuration for the test notification. When omitted, a default INFO-severity test alert is sent.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "The unique identifier of a notification policy",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "alerting policies test",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf alerting policies test",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/alerting/v3/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}/test`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										severity: argv["severity"],
										source: resolveFileToken(
											argv["source"] as string | undefined,
											"source",
											"text"
										),
										state_correlation_id: resolveFileToken(
											argv["state-correlation-id"] as string | undefined,
											"state-correlation-id",
											"text"
										),
										state_event: argv["state-event"],
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							policy_id: argv["policy-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					severity: argv["severity"],
					source: resolveFileToken(
						argv["source"] as string | undefined,
						"source",
						"text"
					),
					state_correlation_id: resolveFileToken(
						argv["state-correlation-id"] as string | undefined,
						"state-correlation-id",
						"text"
					),
					state_event: argv["state-event"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
