import operation from "../../_operations/o11y/telemetry/keys.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./keys.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "o11y telemetry keys",
			classification: {
				safeFlags: [
					"key-needle-is-regex",
					"key-needle-match-case",
					"needle-is-regex",
					"needle-match-case",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf o11y telemetry keys",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/telemetry/keys`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									datasets: argv["datasets"],
									filters: parseObjectArray(argv["filters"], "filters"),
									from: argv["from"],
									keyNeedle: {
										isRegex: argv["key-needle-is-regex"],
										matchCase: argv["key-needle-match-case"],
									},
									limit: argv["limit"],
									needle: {
										isRegex: argv["needle-is-regex"],
										matchCase: argv["needle-match-case"],
									},
									to: argv["to"],
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

			// Assemble request body from individual flags
			const bodyData = compactBody({
				datasets: argv["datasets"],
				filters: parseObjectArray(argv["filters"], "filters"),
				from: argv["from"],
				keyNeedle: {
					isRegex: argv["key-needle-is-regex"],
					matchCase: argv["key-needle-match-case"],
				},
				limit: argv["limit"],
				needle: {
					isRegex: argv["needle-is-regex"],
					matchCase: argv["needle-match-case"],
				},
				to: argv["to"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
