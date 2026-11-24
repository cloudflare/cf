import operation from "../../_operations/registrar/registrations/check.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./check.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "registrar registrations check",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf registrar registrations check",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar/domain-check`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? mergeBodyPositionals(parseBody(argv.body), [
									{ name: "domains", field: "domains", value: argv["domains"] },
								])
							: compactBody({
									domains: argv["domains"],
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? mergeBodyPositionals(parseBody(argv.body), [
							{ name: "domains", field: "domains", value: argv["domains"] },
						])
					: undefined;
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
				domains: argv["domains"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
