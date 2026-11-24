import operation from "../../../_operations/r2/super-slurper/connectivity-precheck/source.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./source.js";
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
			command: "r2 super-slurper connectivity-precheck source",
			classification: {
				safeFlags: ["vendor", "jurisdiction", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["bucket"] === undefined) {
					argv["bucket"] = await promptForRequiredField(
						"bucket",
						"The bucket field"
					);
				}
				if (argv["vendor"] === undefined) {
					argv["vendor"] = await promptForRequiredEnumField(
						"vendor",
						"The vendor field",
						["s3", "gcs", "r2"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 super-slurper connectivity-precheck source",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/source/connectivity-precheck`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									bucket: resolveFileToken(
										argv["bucket"] as string | undefined,
										"bucket",
										"text"
									),
									endpoint: resolveFileToken(
										argv["endpoint"] as string | undefined,
										"endpoint",
										"text"
									),
									keys: argv["keys"],
									pathPrefix: resolveFileToken(
										argv["path-prefix"] as string | undefined,
										"path-prefix",
										"text"
									),
									region: resolveFileToken(
										argv["region"] as string | undefined,
										"region",
										"text"
									),
									secret: {
										accessKeyId: resolveFileToken(
											argv["secret-access-key-id"] as string | undefined,
											"secret-access-key-id",
											"text"
										),
										secretAccessKey: resolveFileToken(
											argv["secret-secret-access-key"] as string | undefined,
											"secret-secret-access-key",
											"text"
										),
										clientEmail: resolveFileToken(
											argv["secret-client-email"] as string | undefined,
											"secret-client-email",
											"text"
										),
										privateKey: resolveFileToken(
											argv["secret-private-key"] as string | undefined,
											"secret-private-key",
											"text"
										),
									},
									vendor: argv["vendor"],
									jurisdiction: argv["jurisdiction"],
								}),
					sensitiveBodyPaths: [
						["secret", "secretAccessKey"],
						["secret", "privateKey"],
					],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				bucket: resolveFileToken(
					argv["bucket"] as string | undefined,
					"bucket",
					"text"
				),
				endpoint: resolveFileToken(
					argv["endpoint"] as string | undefined,
					"endpoint",
					"text"
				),
				keys: argv["keys"],
				pathPrefix: resolveFileToken(
					argv["path-prefix"] as string | undefined,
					"path-prefix",
					"text"
				),
				region: resolveFileToken(
					argv["region"] as string | undefined,
					"region",
					"text"
				),
				secret: {
					accessKeyId: resolveFileToken(
						argv["secret-access-key-id"] as string | undefined,
						"secret-access-key-id",
						"text"
					),
					secretAccessKey: resolveFileToken(
						argv["secret-secret-access-key"] as string | undefined,
						"secret-secret-access-key",
						"text"
					),
					clientEmail: resolveFileToken(
						argv["secret-client-email"] as string | undefined,
						"secret-client-email",
						"text"
					),
					privateKey: resolveFileToken(
						argv["secret-private-key"] as string | undefined,
						"secret-private-key",
						"text"
					),
				},
				vendor: argv["vendor"],
				jurisdiction: argv["jurisdiction"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
