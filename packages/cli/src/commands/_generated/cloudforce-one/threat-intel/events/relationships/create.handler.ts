import operation from "../../../../_operations/cloudforce-one/threat-intel/events/relationships/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one threat-intel events relationships create",
			classification: {
				safeFlags: ["relationship-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["child-ids"] === undefined) {
					throw new Error(
						"--child-ids is required (or pass --body with this field set)."
					);
				}
				if (argv["dataset-id"] === undefined) {
					argv["dataset-id"] = await promptForRequiredField(
						"dataset-id",
						"Dataset identifier where the events are stored"
					);
				}
				if (argv["parent-id"] === undefined) {
					argv["parent-id"] = await promptForRequiredField(
						"parent-id",
						"UUID of the parent event that will be the source of the relationship"
					);
				}
				if (argv["relationship-type"] === undefined) {
					argv["relationship-type"] = await promptForRequiredEnumField(
						"relationship-type",
						"Type of relationship to create between parent and child events",
						["related_to", "caused_by", "attributed_to"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events relationships create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/relationships/create`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									childIds: argv["child-ids"],
									datasetId: resolveFileToken(
										argv["dataset-id"] as string | undefined,
										"dataset-id",
										"text"
									),
									parentId: resolveFileToken(
										argv["parent-id"] as string | undefined,
										"parent-id",
										"text"
									),
									relationshipType: argv["relationship-type"],
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
				childIds: argv["child-ids"],
				datasetId: resolveFileToken(
					argv["dataset-id"] as string | undefined,
					"dataset-id",
					"text"
				),
				parentId: resolveFileToken(
					argv["parent-id"] as string | undefined,
					"parent-id",
					"text"
				),
				relationshipType: argv["relationship-type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
