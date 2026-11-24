import operation from "../../../../_operations/magic-transit/advanced-tcp-protection/configs/prefixes/create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "magic-transit advanced-tcp-protection configs prefixes create",
			classification: {
				safeFlags: ["excluded", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["comment"] === undefined) {
					argv["comment"] = await promptForRequiredField(
						"comment",
						"A comment describing the prefix."
					);
				}
				if (argv["excluded"] === undefined) {
					throw new Error(
						"--excluded is required (or pass --body with this field set)."
					);
				}
				if (argv["prefix"] === undefined) {
					argv["prefix"] = await promptForRequiredField(
						"prefix",
						"The prefix to add in CIDR format."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf magic-transit advanced-tcp-protection configs prefixes create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/prefixes`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									comment: resolveFileToken(
										argv["comment"] as string | undefined,
										"comment",
										"text"
									),
									excluded: argv["excluded"],
									prefix: resolveFileToken(
										argv["prefix"] as string | undefined,
										"prefix",
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
				comment: resolveFileToken(
					argv["comment"] as string | undefined,
					"comment",
					"text"
				),
				excluded: argv["excluded"],
				prefix: resolveFileToken(
					argv["prefix"] as string | undefined,
					"prefix",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
