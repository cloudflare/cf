import operation from "../../_operations/pipelines/streams/create.js";
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
			command: "pipelines streams create",
			classification: {
				safeFlags: [
					"format-decimal-encoding",
					"format-timestamp-format",
					"format-unstructured",
					"format-type",
					"format-compression",
					"http-authentication",
					"http-enabled",
					"schema-inferred",
					"worker-binding-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Specifies the name of the Stream."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf pipelines streams create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/streams`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									format: {
										decimal_encoding: argv["format-decimal-encoding"],
										timestamp_format: argv["format-timestamp-format"],
										unstructured: argv["format-unstructured"],
										type: argv["format-type"],
										compression: argv["format-compression"],
										row_group_bytes: argv["format-row-group-bytes"],
									},
									http: {
										authentication: argv["http-authentication"],
										cors: {
											origins: argv["http-cors-origins"],
										},
										enabled: argv["http-enabled"],
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									schema: {
										fields: parseObjectArray(
											argv["schema-fields"],
											"schema-fields"
										),
										inferred: argv["schema-inferred"],
									},
									worker_binding: {
										enabled: argv["worker-binding-enabled"],
									},
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
				format: {
					decimal_encoding: argv["format-decimal-encoding"],
					timestamp_format: argv["format-timestamp-format"],
					unstructured: argv["format-unstructured"],
					type: argv["format-type"],
					compression: argv["format-compression"],
					row_group_bytes: argv["format-row-group-bytes"],
				},
				http: {
					authentication: argv["http-authentication"],
					cors: {
						origins: argv["http-cors-origins"],
					},
					enabled: argv["http-enabled"],
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				schema: {
					fields: parseObjectArray(argv["schema-fields"], "schema-fields"),
					inferred: argv["schema-inferred"],
				},
				worker_binding: {
					enabled: argv["worker-binding-enabled"],
				},
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
