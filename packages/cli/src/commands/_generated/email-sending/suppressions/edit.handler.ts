import operation from "../../_operations/email-sending/suppressions/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-sending suppressions edit",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-sending suppressions edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions/${argv["suppression-id"] == null ? "<suppression-id>" : encodeURIComponent(String(argv["suppression-id"]))}`,
					pathParams: {
						"suppression-id": String(argv["suppression-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										note: resolveFileToken(
											argv["note"] as string | undefined,
											"note",
											"text"
										),
										scope: parseJsonMap(argv["scope"], "scope"),
									},
									[["scope"]]
								),
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
						suppression_id: argv["suppression-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					note: resolveFileToken(
						argv["note"] as string | undefined,
						"note",
						"text"
					),
					scope: parseJsonMap(argv["scope"], "scope"),
				},
				[["scope"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					suppression_id: argv["suppression-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
