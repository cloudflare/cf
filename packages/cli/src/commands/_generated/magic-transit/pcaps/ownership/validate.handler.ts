import operation from "../../../_operations/magic-transit/pcaps/ownership/validate.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./validate.js";
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
			command: "magic-transit pcaps ownership validate",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["destination-conf"] === undefined) {
					argv["destination-conf"] = await promptForRequiredField(
						"destination-conf",
						"The full URI for the bucket. This field only applies to \`full\` packet captures."
					);
				}
				if (argv["ownership-challenge"] === undefined) {
					argv["ownership-challenge"] = await promptForRequiredField(
						"ownership-challenge",
						"The ownership challenge filename stored in the bucket."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit pcaps ownership validate",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pcaps/ownership/validate`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									destination_conf: resolveFileToken(
										argv["destination-conf"] as string | undefined,
										"destination-conf",
										"text"
									),
									ownership_challenge: resolveFileToken(
										argv["ownership-challenge"] as string | undefined,
										"ownership-challenge",
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
				const result = await withProgress(`Validating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Validated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				destination_conf: resolveFileToken(
					argv["destination-conf"] as string | undefined,
					"destination-conf",
					"text"
				),
				ownership_challenge: resolveFileToken(
					argv["ownership-challenge"] as string | undefined,
					"ownership-challenge",
					"text"
				),
			});
			const result = await withProgress(`Validating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Validated` });
		}
	);
}
