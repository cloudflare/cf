import operation from "../../../../_operations/zero-trust/dlp/validators/worker/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseScalarValue } from "#lib/body-parser.js";
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
			command: "zero-trust dlp validators worker update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A name for this validator, at most 50 characters."
					);
				}
				if (argv["script-tag"] === undefined) {
					argv["script-tag"] = await promptForRequiredField(
						"script-tag",
						"The public script tag of the customer's Worker that scores matches."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust dlp validators worker update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/validators/worker/${argv["validator-id"] == null ? "<validator-id>" : encodeURIComponent(String(argv["validator-id"]))}`,
					pathParams: { "validator-id": String(argv["validator-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									default: parseScalarValue(argv["default"], "default"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									script_tag: resolveFileToken(
										argv["script-tag"] as string | undefined,
										"script-tag",
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						validator_id: argv["validator-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				default: parseScalarValue(argv["default"], "default"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				script_tag: resolveFileToken(
					argv["script-tag"] as string | undefined,
					"script-tag",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					validator_id: argv["validator-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
