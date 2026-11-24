import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "r2 buckets domains custom create",
			classification: {
				safeFlags: ["enabled", "min-tls", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cf-r2-jurisdiction"] !== undefined)
				headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["domain"] === undefined) {
					argv["domain"] = await promptForRequiredField(
						"domain",
						"Name of the custom domain to be added."
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["zone-id"] === undefined) {
					argv["zone-id"] = await promptForRequiredField(
						"zone-id",
						"Zone ID of the custom domain."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 buckets domains custom create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/domains/custom`,
					pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									ciphers: argv["ciphers"],
									domain: resolveFileToken(
										argv["domain"] as string | undefined,
										"domain",
										"text"
									),
									enabled: argv["enabled"],
									minTLS: argv["min-tls"],
									zoneId: resolveFileToken(
										argv["zone-id"] as string | undefined,
										"zone-id",
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
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["ciphers"] !== undefined)
				setNestedValue(bodyData, ["ciphers"], argv["ciphers"]);
			if (argv["domain"] !== undefined)
				setNestedValue(
					bodyData,
					["domain"],
					resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					)
				);
			if (argv["enabled"] !== undefined)
				setNestedValue(bodyData, ["enabled"], argv["enabled"]);
			if (argv["min-tls"] !== undefined)
				setNestedValue(bodyData, ["minTLS"], argv["min-tls"]);
			if (argv["zone-id"] !== undefined)
				setNestedValue(
					bodyData,
					["zoneId"],
					resolveFileToken(
						argv["zone-id"] as string | undefined,
						"zone-id",
						"text"
					)
				);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
