import operation from "../../../_operations/zero-trust/casb/content/export.js";
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
			command: "zero-trust casb content export",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["dlp-profile-information"] === undefined) {
					throw new Error(
						"--dlp-profile-information is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust casb content export",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/content/export`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									dlp_profile_id: argv["dlp-profile-id"],
									dlp_profile_information: parseObjectArray(
										argv["dlp-profile-information"],
										"dlp-profile-information"
									),
									integration_id: argv["integration-id"],
									max_affliction_date: resolveFileToken(
										argv["max-affliction-date"] as string | undefined,
										"max-affliction-date",
										"text"
									),
									min_affliction_date: resolveFileToken(
										argv["min-affliction-date"] as string | undefined,
										"min-affliction-date",
										"text"
									),
									orders: parseObjectArray(argv["orders"], "orders"),
									search: resolveFileToken(
										argv["search"] as string | undefined,
										"search",
										"text"
									),
									vendors: argv["vendors"],
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
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				dlp_profile_id: argv["dlp-profile-id"],
				dlp_profile_information: parseObjectArray(
					argv["dlp-profile-information"],
					"dlp-profile-information"
				),
				integration_id: argv["integration-id"],
				max_affliction_date: resolveFileToken(
					argv["max-affliction-date"] as string | undefined,
					"max-affliction-date",
					"text"
				),
				min_affliction_date: resolveFileToken(
					argv["min-affliction-date"] as string | undefined,
					"min-affliction-date",
					"text"
				),
				orders: parseObjectArray(argv["orders"], "orders"),
				search: resolveFileToken(
					argv["search"] as string | undefined,
					"search",
					"text"
				),
				vendors: argv["vendors"],
			});
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
