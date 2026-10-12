import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust gateway logging update\n\nUpdate logging settings for the current Zero Trust account."
		)
		.option("redact-pii", {
			type: "boolean",
			description:
				"Indicate whether to redact personally identifiable information from activity logging (PII fields include source IP, user email, user ID, device ID, URL, referrer, and user agent).",
		})
		.option("settings-by-rule-type-dns-log-all", {
			type: "boolean",
			description: "Specify whether to log all requests to this service.",
		})
		.option("settings-by-rule-type-dns-log-blocks", {
			type: "boolean",
			description:
				"Specify whether to log only blocking requests to this service.",
		})
		.option("settings-by-rule-type-http-log-all", {
			type: "boolean",
			description: "Specify whether to log all requests to this service.",
		})
		.option("settings-by-rule-type-http-log-blocks", {
			type: "boolean",
			description:
				"Specify whether to log only blocking requests to this service.",
		})
		.option("settings-by-rule-type-l4-log-all", {
			type: "boolean",
			description: "Specify whether to log all requests to this service.",
		})
		.option("settings-by-rule-type-l4-log-blocks", {
			type: "boolean",
			description:
				"Specify whether to log only blocking requests to this service.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"zero-trust-accounts-update-logging-settings-for-the-zero-trust-account">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zero Trust account logging settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway logging update",
				classification: {
					safeFlags: [
						"redact-pii",
						"settings-by-rule-type-dns-log-all",
						"settings-by-rule-type-dns-log-blocks",
						"settings-by-rule-type-http-log-all",
						"settings-by-rule-type-http-log-blocks",
						"settings-by-rule-type-l4-log-all",
						"settings-by-rule-type-l4-log-blocks",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway logging update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/logging`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										redact_pii: argv["redact-pii"],
										settings_by_rule_type: {
											dns: {
												log_all: argv["settings-by-rule-type-dns-log-all"],
												log_blocks:
													argv["settings-by-rule-type-dns-log-blocks"],
											},
											http: {
												log_all: argv["settings-by-rule-type-http-log-all"],
												log_blocks:
													argv["settings-by-rule-type-http-log-blocks"],
											},
											l4: {
												log_all: argv["settings-by-rule-type-l4-log-all"],
												log_blocks: argv["settings-by-rule-type-l4-log-blocks"],
											},
										},
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
						client.zeroTrust.gateway.logging.update({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					redact_pii: argv["redact-pii"],
					settings_by_rule_type: {
						dns: {
							log_all: argv["settings-by-rule-type-dns-log-all"],
							log_blocks: argv["settings-by-rule-type-dns-log-blocks"],
						},
						http: {
							log_all: argv["settings-by-rule-type-http-log-all"],
							log_blocks: argv["settings-by-rule-type-http-log-blocks"],
						},
						l4: {
							log_all: argv["settings-by-rule-type-l4-log-all"],
							log_blocks: argv["settings-by-rule-type-l4-log-blocks"],
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.gateway.logging.update({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
