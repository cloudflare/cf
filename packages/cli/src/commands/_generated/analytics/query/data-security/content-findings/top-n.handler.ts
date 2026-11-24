import operation from "../../../../_operations/analytics/query/data-security/content-findings/top-n.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./top-n.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "analytics query data-security content-findings top-n",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["filters"] === undefined) {
					throw new Error(
						"--filters is required (or pass --body with this field set)."
					);
				}
				if (argv["from"] === undefined) {
					argv["from"] = await promptForRequiredField(
						"from",
						"Start of the query time range (inclusive). RFC3339."
					);
				}
				if (argv["limit"] === undefined) {
					throw new Error(
						"--limit is required (or pass --body with this field set)."
					);
				}
				if (argv["to"] === undefined) {
					argv["to"] = await promptForRequiredField(
						"to",
						"End of the query time range (exclusive). RFC3339."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf analytics query data-security content-findings top-n",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/analytics/query/data-security/content-findings/top-n`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									filters: parseObjectArray(argv["filters"], "filters"),
									from: resolveFileToken(
										argv["from"] as string | undefined,
										"from",
										"text"
									),
									n: argv["limit"],
									to: resolveFileToken(
										argv["to"] as string | undefined,
										"to",
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				filters: parseObjectArray(argv["filters"], "filters"),
				from: resolveFileToken(
					argv["from"] as string | undefined,
					"from",
					"text"
				),
				n: argv["limit"],
				to: resolveFileToken(argv["to"] as string | undefined, "to", "text"),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
