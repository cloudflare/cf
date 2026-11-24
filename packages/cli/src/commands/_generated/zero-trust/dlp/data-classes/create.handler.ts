import operation from "../../../_operations/zero-trust/dlp/data-classes/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "zero-trust dlp data-classes create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["data-tags"] === undefined) {
					throw new Error(
						"--data-tags is required (or pass --body with this field set)."
					);
				}
				if (argv["expression"] === undefined) {
					argv["expression"] = await promptForRequiredField(
						"expression",
						"The expression field"
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
				if (argv["sensitivity-levels"] === undefined) {
					throw new Error(
						"--sensitivity-levels is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust dlp data-classes create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/data_classes`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									data_tags: argv["data-tags"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									expression: resolveFileToken(
										argv["expression"] as string | undefined,
										"expression",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									sensitivity_levels: parseObjectArray(
										argv["sensitivity-levels"],
										"sensitivity-levels"
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
				data_tags: argv["data-tags"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				expression: resolveFileToken(
					argv["expression"] as string | undefined,
					"expression",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				sensitivity_levels: parseObjectArray(
					argv["sensitivity-levels"],
					"sensitivity-levels"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
