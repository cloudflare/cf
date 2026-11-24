import operation from "../../../_operations/cloudforce-one/threat-intel/events/copy.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./copy.js";
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
			command: "cloudforce-one threat-intel events copy",
			classification: {
				safeFlags: ["keep-raw-data", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				keepRawData: argv["keep-raw-data"],
			};
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["dest-dataset-id"] === undefined) {
					argv["dest-dataset-id"] = await promptForRequiredField(
						"dest-dataset-id",
						"The destDatasetId field"
					);
				}
				if (argv["event-ids"] === undefined) {
					throw new Error(
						"--event-ids is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events copy",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/copy`,
					pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									destDatasetId: resolveFileToken(
										argv["dest-dataset-id"] as string | undefined,
										"dest-dataset-id",
										"text"
									),
									eventIds: argv["event-ids"],
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
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				destDatasetId: resolveFileToken(
					argv["dest-dataset-id"] as string | undefined,
					"dest-dataset-id",
					"text"
				),
				eventIds: argv["event-ids"],
			});
			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					dataset_id: argv["dataset-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
