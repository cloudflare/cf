import operation from "../../../_operations/artifacts/namespaces/repos/fork.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./fork.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "artifacts namespaces repos fork",
			classification: {
				safeFlags: ["default-branch-only", "read-only", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf artifacts namespaces repos fork",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/repos/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/fork`,
					pathParams: {
						namespace: String(argv["namespace"] ?? ""),
						name: String(argv["name"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									default_branch_only: argv["default-branch-only"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									read_only: argv["read-only"],
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
						namespace: argv["namespace"],
						name: argv["name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				default_branch_only: argv["default-branch-only"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				read_only: argv["read-only"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					namespace: argv["namespace"],
					name: argv["name"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
