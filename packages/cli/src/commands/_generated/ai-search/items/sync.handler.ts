import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./sync.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-search items sync",
			classification: {
				safeFlags: ["next-action", "wait-for-completion", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["next-action"] === undefined) {
					argv["next-action"] = await promptForRequiredEnumField(
						"next-action",
						"The next_action field",
						["INDEX"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-search items sync",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/items/${argv["item-id"] == null ? "<item-id>" : encodeURIComponent(String(argv["item-id"]))}`,
					pathParams: {
						namespace: String(argv["namespace"] ?? ""),
						"instance-id": String(argv["instance-id"] ?? ""),
						"item-id": String(argv["item-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									next_action: argv["next-action"],
									wait_for_completion: argv["wait-for-completion"],
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
						"PATCH",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items/${encodeURIComponent(String(argv["item-id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["next-action"] !== undefined)
				setNestedValue(bodyData, ["next_action"], argv["next-action"]);
			if (argv["wait-for-completion"] !== undefined)
				setNestedValue(
					bodyData,
					["wait_for_completion"],
					argv["wait-for-completion"]
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PATCH",
					`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items/${encodeURIComponent(String(argv["item-id"]))}`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
