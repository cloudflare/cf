import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./enable.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "r2 buckets sippy enable",
			classification: {
				safeFlags: ["destination-provider", "source-provider", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cf-r2-jurisdiction"] !== undefined)
				headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 buckets sippy enable",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/sippy`,
					pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									destination: {
										accessKeyId: resolveFileToken(
											argv["destination-access-key-id"] as string | undefined,
											"destination-access-key-id",
											"text"
										),
										provider: argv["destination-provider"],
										secretAccessKey: resolveFileToken(
											argv["destination-secret-access-key"] as
												| string
												| undefined,
											"destination-secret-access-key",
											"text"
										),
									},
									source: {
										accessKeyId: resolveFileToken(
											argv["source-access-key-id"] as string | undefined,
											"source-access-key-id",
											"text"
										),
										bucket: resolveFileToken(
											argv["source-bucket"] as string | undefined,
											"source-bucket",
											"text"
										),
										provider: argv["source-provider"],
										region: resolveFileToken(
											argv["source-region"] as string | undefined,
											"source-region",
											"text"
										),
										secretAccessKey: resolveFileToken(
											argv["source-secret-access-key"] as string | undefined,
											"source-secret-access-key",
											"text"
										),
										clientEmail: resolveFileToken(
											argv["source-client-email"] as string | undefined,
											"source-client-email",
											"text"
										),
										privateKey: resolveFileToken(
											argv["source-private-key"] as string | undefined,
											"source-private-key",
											"text"
										),
										bucketUrl: resolveFileToken(
											argv["source-bucket-url"] as string | undefined,
											"source-bucket-url",
											"text"
										),
										accountKey: resolveFileToken(
											argv["source-account-key"] as string | undefined,
											"source-account-key",
											"text"
										),
										accountName: resolveFileToken(
											argv["source-account-name"] as string | undefined,
											"source-account-name",
											"text"
										),
										container: resolveFileToken(
											argv["source-container"] as string | undefined,
											"source-container",
											"text"
										),
										sasToken: resolveFileToken(
											argv["source-sas-token"] as string | undefined,
											"source-sas-token",
											"text"
										),
									},
								}),
					sensitiveBodyPaths: [
						["destination", "secretAccessKey"],
						["source", "secretAccessKey"],
						["source", "privateKey"],
						["source", "accountKey"],
						["source", "sasToken"],
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
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/sippy`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["destination-access-key-id"] !== undefined)
				setNestedValue(
					bodyData,
					["destination", "accessKeyId"],
					resolveFileToken(
						argv["destination-access-key-id"] as string | undefined,
						"destination-access-key-id",
						"text"
					)
				);
			if (argv["destination-provider"] !== undefined)
				setNestedValue(
					bodyData,
					["destination", "provider"],
					argv["destination-provider"]
				);
			if (argv["destination-secret-access-key"] !== undefined)
				setNestedValue(
					bodyData,
					["destination", "secretAccessKey"],
					resolveFileToken(
						argv["destination-secret-access-key"] as string | undefined,
						"destination-secret-access-key",
						"text"
					)
				);
			if (argv["source-access-key-id"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "accessKeyId"],
					resolveFileToken(
						argv["source-access-key-id"] as string | undefined,
						"source-access-key-id",
						"text"
					)
				);
			if (argv["source-bucket"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "bucket"],
					resolveFileToken(
						argv["source-bucket"] as string | undefined,
						"source-bucket",
						"text"
					)
				);
			if (argv["source-provider"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "provider"],
					argv["source-provider"]
				);
			if (argv["source-region"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "region"],
					resolveFileToken(
						argv["source-region"] as string | undefined,
						"source-region",
						"text"
					)
				);
			if (argv["source-secret-access-key"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "secretAccessKey"],
					resolveFileToken(
						argv["source-secret-access-key"] as string | undefined,
						"source-secret-access-key",
						"text"
					)
				);
			if (argv["source-client-email"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "clientEmail"],
					resolveFileToken(
						argv["source-client-email"] as string | undefined,
						"source-client-email",
						"text"
					)
				);
			if (argv["source-private-key"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "privateKey"],
					resolveFileToken(
						argv["source-private-key"] as string | undefined,
						"source-private-key",
						"text"
					)
				);
			if (argv["source-bucket-url"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "bucketUrl"],
					resolveFileToken(
						argv["source-bucket-url"] as string | undefined,
						"source-bucket-url",
						"text"
					)
				);
			if (argv["source-account-key"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "accountKey"],
					resolveFileToken(
						argv["source-account-key"] as string | undefined,
						"source-account-key",
						"text"
					)
				);
			if (argv["source-account-name"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "accountName"],
					resolveFileToken(
						argv["source-account-name"] as string | undefined,
						"source-account-name",
						"text"
					)
				);
			if (argv["source-container"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "container"],
					resolveFileToken(
						argv["source-container"] as string | undefined,
						"source-container",
						"text"
					)
				);
			if (argv["source-sas-token"] !== undefined)
				setNestedValue(
					bodyData,
					["source", "sasToken"],
					resolveFileToken(
						argv["source-sas-token"] as string | undefined,
						"source-sas-token",
						"text"
					)
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/sippy`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
