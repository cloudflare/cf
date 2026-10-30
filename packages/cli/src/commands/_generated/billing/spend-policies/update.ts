import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing spend-policies update <policy-id>\n\nReplaces the whole spend policy. Every field is required, as on create; there are no partial updates and `PATCH` is not supported. The `If-Match` header must equal the policy's current `version`. On success, `version` goes up by one and the new value is returned in `ETag`."
		)
		.positional("policy-id", {
			type: "string",
			description: "Identifies the spend policy.",
			demandOption: true,
		})
		.option("if-match", {
			type: "string",
			description:
				'The policy `version` the change is based on, as returned in `ETag`. Quoted (`"3"`) and bare (`3`) values are both accepted. Weak ETags (`W/"3"`) and `*` are not.',
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description:
				"The action taken when the threshold is reached. `notification` sends an email to `notification_email`. `usage_block` blocks further usage of the product until the end of the billing period. Raising the threshold above the current balance, disabling the policy, or deleting it lifts the block early.",
			choices: ["notification", "usage_block"],
		})
		.coerce("action", (value) => resolveFileToken(value, "action", "text"))
		.option("enabled", {
			type: "boolean",
			description: "Whether the policy is evaluated.",
		})
		.option("name", {
			type: "string",
			description:
				"Display name of the policy. After surrounding whitespace is trimmed, it must be 1 to 200 bytes long. The value is stored as sent, untrimmed.",
		})
		.option("notification-email", {
			type: "string",
			description:
				"Email address that receives notifications. Required when `action` is `notification`. When set, it must be a bare address (`user@example.com`); display-name forms such as `Name <user@example.com>` are rejected.",
		})
		.option("product-id", {
			type: "string",
			description:
				"The product the policy applies to: `workers` or `durable_objects`. Each product's balance and policies are separate. Both products support `notification` and `usage_block` policies on create and update.",
			choices: ["workers", "durable_objects"],
		})
		.coerce("product-id", (value) =>
			resolveFileToken(value, "product-id", "text")
		)
		.option("threshold-cents", {
			type: "number",
			description:
				"The spend threshold for the current billing period, in US cents. Must be greater than zero.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"A spend policy as sent on create and on full replacement. Unknown fields and trailing JSON are rejected. Only the first 1 MiB of the body is read.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-id>",
	describe: "Update Spend Policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing spend-policies update",
				classification: {
					safeFlags: ["action", "enabled", "product-id", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["if-match"] !== undefined)
					headers["If-Match"] = String(argv["if-match"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing spend-policies update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/spend-policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										enabled: argv["enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										notification_email: resolveFileToken(
											argv["notification-email"] as string | undefined,
											"notification-email",
											"text"
										),
										product_id: argv["product-id"],
										threshold_cents: argv["threshold-cents"],
										if_match: argv["if-match"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/billing/spend-policies/${encodeURIComponent(String(argv["policy-id"]))}`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action taken when the threshold is reached. \`notification\` sends an email to \`notification_email\`. \`usage_block\` blocks further usage of the product until the end of the billing period. Raising the threshold above the current balance, disabling the policy, or deleting it lifts the block early.",
						["notification", "usage_block"] as const
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Display name of the policy. After surrounding whitespace is trimmed, it must be 1 to 200 bytes long. The value is stored as sent, untrimmed."
					);
				}
				if (argv["product-id"] === undefined) {
					argv["product-id"] = await promptForRequiredEnumField(
						"product-id",
						"The product the policy applies to: \`workers\` or \`durable_objects\`. Each product's balance and policies are separate. Both products support \`notification\` and \`usage_block\` policies on create and update.",
						["workers", "durable_objects"] as const
					);
				}
				if (argv["threshold-cents"] === undefined) {
					throw new Error(
						"--threshold-cents is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["action"] !== undefined)
					setNestedValue(bodyData, ["action"], argv["action"]);
				if (argv["enabled"] !== undefined)
					setNestedValue(bodyData, ["enabled"], argv["enabled"]);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["notification-email"] !== undefined)
					setNestedValue(
						bodyData,
						["notification_email"],
						resolveFileToken(
							argv["notification-email"] as string | undefined,
							"notification-email",
							"text"
						)
					);
				if (argv["product-id"] !== undefined)
					setNestedValue(bodyData, ["product_id"], argv["product-id"]);
				if (argv["threshold-cents"] !== undefined)
					setNestedValue(
						bodyData,
						["threshold_cents"],
						argv["threshold-cents"]
					);
				if (argv["if-match"] !== undefined)
					bodyData["if_match"] = argv["if-match"];
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/billing/spend-policies/${encodeURIComponent(String(argv["policy-id"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
