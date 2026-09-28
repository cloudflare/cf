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
 * test command
 * @generated from apis/overlays/alerting.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 alerting policies test <policy-id>\n\nSend a test notification for a policy to verify delivery mechanisms are working as expected."
		)
		.positional("policy-id", {
			type: "string",
			description: "The unique identifier of a notification policy",
			demandOption: true,
		})
		.option("severity", {
			type: "number",
			description:
				"Severity level for the test alert. Defaults to INFO (1) if omitted.",
		})
		.option("source", {
			type: "string",
			description: "Source identifier for the test alert.",
		})
		.option("state-correlation-id", {
			type: "string",
			description:
				"Correlation ID for stateful test alerts. Required when state_event is set.",
		})
		.option("state-event", {
			type: "number",
			description:
				"State event type for stateful test alerts. Use with state_correlation_id.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Optional configuration for the test notification. When omitted, a default INFO-severity test alert is sent.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"notification-policies-test-a-notification-policy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "test <policy-id>",
	describe: "Test a Notification policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "alerting policies test",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.alerting.policies.test({
							...bodyData,
							account_id: accountId,
							policy_id: argv["policy-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.alerting.policies.test({
						...bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
