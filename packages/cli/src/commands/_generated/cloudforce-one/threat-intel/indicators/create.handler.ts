import operation from "../../../_operations/cloudforce-one/threat-intel/indicators/create.js";
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
			command: "cloudforce-one threat-intel indicators create",
			classification: {
				safeFlags: ["auto-create-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["indicator-type"] === undefined) {
					argv["indicator-type"] = await promptForRequiredField(
						"indicator-type",
						"The indicatorType field"
					);
				}
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredField(
						"value",
						"The value field"
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel indicators create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/create`,
					pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									autoCreateType: argv["auto-create-type"],
									indicatorType: resolveFileToken(
										argv["indicator-type"] as string | undefined,
										"indicator-type",
										"text"
									),
									relatedEvents: parseObjectArray(
										argv["related-events"],
										"related-events"
									),
									tlp: resolveFileToken(
										argv["tlp"] as string | undefined,
										"tlp",
										"text"
									),
									value: resolveFileToken(
										argv["value"] as string | undefined,
										"value",
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				autoCreateType: argv["auto-create-type"],
				indicatorType: resolveFileToken(
					argv["indicator-type"] as string | undefined,
					"indicator-type",
					"text"
				),
				relatedEvents: parseObjectArray(
					argv["related-events"],
					"related-events"
				),
				tlp: resolveFileToken(argv["tlp"] as string | undefined, "tlp", "text"),
				value: resolveFileToken(
					argv["value"] as string | undefined,
					"value",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					dataset_id: argv["dataset-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
