import operation from "../../_operations/o11y/telemetry/values.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./values.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "o11y telemetry values",
			classification: {
				safeFlags: ["needle-is-regex", "needle-match-case", "type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["datasets"] === undefined) {
					throw new Error(
						"--datasets is required (or pass --body with this field set)."
					);
				}
				if (argv["key"] === undefined) {
					argv["key"] = await promptForRequiredField("key", "The key field");
				}
				if (argv["timeframe-from"] === undefined) {
					throw new Error(
						"--timeframe-from is required (or pass --body with this field set)."
					);
				}
				if (argv["timeframe-to"] === undefined) {
					throw new Error(
						"--timeframe-to is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type field",
						["string", "boolean", "number"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf o11y telemetry values",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/values`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									datasets: argv["datasets"],
									filters: parseObjectArray(argv["filters"], "filters"),
									key: resolveFileToken(
										argv["key"] as string | undefined,
										"key",
										"text"
									),
									limit: argv["limit"],
									needle: {
										isRegex: argv["needle-is-regex"],
										matchCase: argv["needle-match-case"],
									},
									timeframe: {
										from: argv["timeframe-from"],
										to: argv["timeframe-to"],
									},
									type: argv["type"],
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
				datasets: argv["datasets"],
				filters: parseObjectArray(argv["filters"], "filters"),
				key: resolveFileToken(argv["key"] as string | undefined, "key", "text"),
				limit: argv["limit"],
				needle: {
					isRegex: argv["needle-is-regex"],
					matchCase: argv["needle-match-case"],
				},
				timeframe: {
					from: argv["timeframe-from"],
					to: argv["timeframe-to"],
				},
				type: argv["type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
