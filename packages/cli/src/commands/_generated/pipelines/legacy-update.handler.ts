import operation from "../_operations/pipelines/legacy-update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./legacy-update.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "pipelines legacy-update",
			classification: {
				safeFlags: [
					"destination-compression-type",
					"destination-format",
					"destination-type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["destination-format"] === undefined) {
					argv["destination-format"] = await promptForRequiredEnumField(
						"destination-format",
						"Specifies the format of data to deliver.",
						["json"] as const
					);
				}
				if (argv["destination-path-bucket"] === undefined) {
					argv["destination-path-bucket"] = await promptForRequiredField(
						"destination-path-bucket",
						"Specifies the R2 Bucket to store files."
					);
				}
				if (argv["destination-type"] === undefined) {
					argv["destination-type"] = await promptForRequiredEnumField(
						"destination-type",
						"Specifies the type of destination.",
						["r2"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Defines the name of the pipeline."
					);
				}
				if (argv["source"] === undefined) {
					throw new Error(
						"--source is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf pipelines legacy-update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/${argv["pipeline-name"] == null ? "<pipeline-name>" : encodeURIComponent(String(argv["pipeline-name"]))}`,
					pathParams: { "pipeline-name": String(argv["pipeline-name"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									destination: {
										batch: {
											max_bytes: argv["destination-batch-max-bytes"],
											max_duration_s: argv["destination-batch-max-duration-s"],
											max_rows: argv["destination-batch-max-rows"],
										},
										compression: {
											type: argv["destination-compression-type"],
										},
										credentials: {
											access_key_id: resolveFileToken(
												argv["destination-credentials-access-key-id"] as
													| string
													| undefined,
												"destination-credentials-access-key-id",
												"text"
											),
											endpoint: resolveFileToken(
												argv["destination-credentials-endpoint"] as
													| string
													| undefined,
												"destination-credentials-endpoint",
												"text"
											),
											secret_access_key: resolveFileToken(
												argv["destination-credentials-secret-access-key"] as
													| string
													| undefined,
												"destination-credentials-secret-access-key",
												"text"
											),
										},
										format: argv["destination-format"],
										path: {
											bucket: resolveFileToken(
												argv["destination-path-bucket"] as string | undefined,
												"destination-path-bucket",
												"text"
											),
											filename: resolveFileToken(
												argv["destination-path-filename"] as string | undefined,
												"destination-path-filename",
												"text"
											),
											filepath: resolveFileToken(
												argv["destination-path-filepath"] as string | undefined,
												"destination-path-filepath",
												"text"
											),
											prefix: resolveFileToken(
												argv["destination-path-prefix"] as string | undefined,
												"destination-path-prefix",
												"text"
											),
										},
										type: argv["destination-type"],
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									source: parseObjectArray(argv["source"], "source"),
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
						pipeline_name: argv["pipeline-name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				destination: {
					batch: {
						max_bytes: argv["destination-batch-max-bytes"],
						max_duration_s: argv["destination-batch-max-duration-s"],
						max_rows: argv["destination-batch-max-rows"],
					},
					compression: {
						type: argv["destination-compression-type"],
					},
					credentials: {
						access_key_id: resolveFileToken(
							argv["destination-credentials-access-key-id"] as
								| string
								| undefined,
							"destination-credentials-access-key-id",
							"text"
						),
						endpoint: resolveFileToken(
							argv["destination-credentials-endpoint"] as string | undefined,
							"destination-credentials-endpoint",
							"text"
						),
						secret_access_key: resolveFileToken(
							argv["destination-credentials-secret-access-key"] as
								| string
								| undefined,
							"destination-credentials-secret-access-key",
							"text"
						),
					},
					format: argv["destination-format"],
					path: {
						bucket: resolveFileToken(
							argv["destination-path-bucket"] as string | undefined,
							"destination-path-bucket",
							"text"
						),
						filename: resolveFileToken(
							argv["destination-path-filename"] as string | undefined,
							"destination-path-filename",
							"text"
						),
						filepath: resolveFileToken(
							argv["destination-path-filepath"] as string | undefined,
							"destination-path-filepath",
							"text"
						),
						prefix: resolveFileToken(
							argv["destination-path-prefix"] as string | undefined,
							"destination-path-prefix",
							"text"
						),
					},
					type: argv["destination-type"],
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				source: parseObjectArray(argv["source"], "source"),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					pipeline_name: argv["pipeline-name"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
