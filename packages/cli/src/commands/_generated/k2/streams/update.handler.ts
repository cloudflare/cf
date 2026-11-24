import operation from "../../_operations/k2/streams/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "k2 streams update",
			classification: {
				safeFlags: [
					"http-authentication",
					"http-enabled",
					"worker-binding-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf k2 streams update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/k2/streams/${argv["stream-id"] == null ? "<stream-id>" : encodeURIComponent(String(argv["stream-id"]))}`,
					pathParams: { "stream-id": String(argv["stream-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									http: {
										authentication: argv["http-authentication"],
										cors: {
											origins: argv["http-cors-origins"],
										},
										enabled: argv["http-enabled"],
									},
									retention_seconds: argv["retention-seconds"],
									worker_binding: {
										enabled: argv["worker-binding-enabled"],
									},
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
						stream_id: argv["stream-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				http: {
					authentication: argv["http-authentication"],
					cors: {
						origins: argv["http-cors-origins"],
					},
					enabled: argv["http-enabled"],
				},
				retention_seconds: argv["retention-seconds"],
				worker_binding: {
					enabled: argv["worker-binding-enabled"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					stream_id: argv["stream-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
