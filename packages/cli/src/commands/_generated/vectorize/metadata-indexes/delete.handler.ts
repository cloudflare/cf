import operation from "../../_operations/vectorize/metadata-indexes/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
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
import { confirmDelete, promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "vectorize metadata-indexes delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["property-name"] === undefined) {
					argv["property-name"] = await promptForRequiredField(
						"property-name",
						"Specifies the metadata property for which the index must be deleted."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf vectorize metadata-indexes delete",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/metadata_index/delete`,
					pathParams: { "index-name": String(argv["index-name"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									propertyName: resolveFileToken(
										argv["property-name"] as string | undefined,
										"property-name",
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

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation deletes a metadata index destructively.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				propertyName: resolveFileToken(
					argv["property-name"] as string | undefined,
					"property-name",
					"text"
				),
			});
			const result = await withProgress(`Processing`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					index_name: argv["index-name"],
				})
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
