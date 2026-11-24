import operation from "../../_operations/intel/miscategorizations/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "intel miscategorizations create",
			classification: {
				safeFlags: ["indicator-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf intel miscategorizations create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/miscategorization`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									content_adds: argv["content-adds"],
									content_removes: argv["content-removes"],
									indicator_type: argv["indicator-type"],
									ip: resolveFileToken(
										argv["ip"] as string | undefined,
										"ip",
										"text"
									),
									security_adds: argv["security-adds"],
									security_removes: argv["security-removes"],
									url: resolveFileToken(
										argv["url"] as string | undefined,
										"url",
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

			// Assemble request body from individual flags
			const bodyData = compactBody({
				content_adds: argv["content-adds"],
				content_removes: argv["content-removes"],
				indicator_type: argv["indicator-type"],
				ip: resolveFileToken(argv["ip"] as string | undefined, "ip", "text"),
				security_adds: argv["security-adds"],
				security_removes: argv["security-removes"],
				url: resolveFileToken(argv["url"] as string | undefined, "url", "text"),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
