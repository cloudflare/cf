import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one requests messages create",
			classification: {
				safeFlags: ["publish", "tlp", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["idempotency-key"] !== undefined)
				headers["Idempotency-Key"] = String(argv["idempotency-key"]);
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["content"] === undefined) {
					argv["content"] = await promptForRequiredField(
						"content",
						"The content field"
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one requests messages create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/messages/new`,
					pathParams: {
						"project-type": String(argv["project-type"] ?? ""),
						"request-id": String(argv["request-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									attachment_asset_ids: argv["attachment-asset-ids"],
									author_id: resolveFileToken(
										argv["author-id"] as string | undefined,
										"author-id",
										"text"
									),
									author_name: resolveFileToken(
										argv["author-name"] as string | undefined,
										"author-name",
										"text"
									),
									content: resolveFileToken(
										argv["content"] as string | undefined,
										"content",
										"text"
									),
									publish: argv["publish"],
									tlp: argv["tlp"],
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
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/cloudforce-one/v2/requests/${encodeURIComponent(String(argv["project-type"]))}/${encodeURIComponent(String(argv["request-id"]))}/messages/new`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["attachment-asset-ids"] !== undefined)
				setNestedValue(
					bodyData,
					["attachment_asset_ids"],
					argv["attachment-asset-ids"]
				);
			if (argv["author-id"] !== undefined)
				setNestedValue(
					bodyData,
					["author_id"],
					resolveFileToken(
						argv["author-id"] as string | undefined,
						"author-id",
						"text"
					)
				);
			if (argv["author-name"] !== undefined)
				setNestedValue(
					bodyData,
					["author_name"],
					resolveFileToken(
						argv["author-name"] as string | undefined,
						"author-name",
						"text"
					)
				);
			if (argv["content"] !== undefined)
				setNestedValue(
					bodyData,
					["content"],
					resolveFileToken(
						argv["content"] as string | undefined,
						"content",
						"text"
					)
				);
			if (argv["publish"] !== undefined)
				setNestedValue(bodyData, ["publish"], argv["publish"]);
			if (argv["tlp"] !== undefined)
				setNestedValue(bodyData, ["tlp"], argv["tlp"]);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/cloudforce-one/v2/requests/${encodeURIComponent(String(argv["project-type"]))}/${encodeURIComponent(String(argv["request-id"]))}/messages/new`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
