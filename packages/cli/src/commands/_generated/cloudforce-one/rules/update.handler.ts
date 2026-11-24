import operation from "../../_operations/cloudforce-one/rules/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one rules update",
			classification: {
				safeFlags: ["enabled", "is-public", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one rules update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
					pathParams: { id: String(argv["id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									commit_message: resolveFileToken(
										argv["commit-message"] as string | undefined,
										"commit-message",
										"text"
									),
									content: resolveFileToken(
										argv["content"] as string | undefined,
										"content",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									enabled: argv["enabled"],
									is_public: argv["is-public"],
									meta: parseObjectArray(argv["meta"], "meta"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									namespaces: argv["namespaces"],
									path: resolveFileToken(
										argv["path"] as string | undefined,
										"path",
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				commit_message: resolveFileToken(
					argv["commit-message"] as string | undefined,
					"commit-message",
					"text"
				),
				content: resolveFileToken(
					argv["content"] as string | undefined,
					"content",
					"text"
				),
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				enabled: argv["enabled"],
				is_public: argv["is-public"],
				meta: parseObjectArray(argv["meta"], "meta"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				namespaces: argv["namespaces"],
				path: resolveFileToken(
					argv["path"] as string | undefined,
					"path",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					id: argv["id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
