import operation from "../../../../_operations/zero-trust/casb/remediations/jobs/export.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./export.js";
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
			command: "zero-trust casb remediations jobs export",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust casb remediations jobs export",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/remediations/jobs/export`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									integration_id: argv["integration-id"],
									max_updated_at: resolveFileToken(
										argv["max-updated-at"] as string | undefined,
										"max-updated-at",
										"text"
									),
									min_updated_at: resolveFileToken(
										argv["min-updated-at"] as string | undefined,
										"min-updated-at",
										"text"
									),
									orders: parseObjectArray(argv["orders"], "orders"),
									search: resolveFileToken(
										argv["search"] as string | undefined,
										"search",
										"text"
									),
									status: argv["status"],
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
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				integration_id: argv["integration-id"],
				max_updated_at: resolveFileToken(
					argv["max-updated-at"] as string | undefined,
					"max-updated-at",
					"text"
				),
				min_updated_at: resolveFileToken(
					argv["min-updated-at"] as string | undefined,
					"min-updated-at",
					"text"
				),
				orders: parseObjectArray(argv["orders"], "orders"),
				search: resolveFileToken(
					argv["search"] as string | undefined,
					"search",
					"text"
				),
				status: argv["status"],
			});
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
