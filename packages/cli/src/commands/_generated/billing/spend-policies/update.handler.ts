import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "billing spend-policies update",
			classification: {
				safeFlags: ["action", "enabled", "product-id", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["if-match"] !== undefined)
				headers["If-Match"] = String(argv["if-match"]);
			const resolveRequiredFields = async (): Promise<void> => {
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
			await resolveRequiredFields();

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
				setNestedValue(bodyData, ["threshold_cents"], argv["threshold-cents"]);
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
	);
}
