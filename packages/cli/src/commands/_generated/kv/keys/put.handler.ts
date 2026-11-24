import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./put.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "kv keys put",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				expiration: argv["expiration"],
				expiration_ttl: argv["expiration-ttl"],
			};
			if (
				argv.body === undefined &&
				argv.file === undefined &&
				argv["metadata"] === undefined
			) {
				throw new Error(
					"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
				);
			}
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf kv keys put",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/values/${argv["key-name"] == null ? "<key-name>" : encodeURIComponent(String(argv["key-name"]))}`,
					pathParams: {
						"namespace-id": String(argv["namespace-id"] ?? ""),
						"key-name": String(argv["key-name"] ?? ""),
					},
					query: queryParams,
					bodyKind:
						argv["metadata"] !== undefined ? "multipart" : "octet-stream",
					body:
						argv["metadata"] !== undefined
							? {
									body: argv["body"],
									file: argv["file"],
									metadata: argv["metadata"],
								}
							: argv.body,
				});
				return;
			}
			const parsedBody =
				argv["metadata"] !== undefined || argv.file !== undefined
					? undefined
					: resolveFileToken(argv.body, "body", "binary");
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv["metadata"] !== undefined) {
				const formData = new FormData();
				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					formData.append(
						"value",
						new Blob([fileContent]),
						argv.file.split(/[\\/]/).filter(Boolean).pop()
					);
				} else if (argv.body !== undefined) {
					formData.append("value", argv.body);
				}
				if (argv["metadata"] !== undefined)
					formData.append(
						"metadata",
						String(
							resolveFileToken(
								argv["metadata"] as string | undefined,
								"metadata",
								"text"
							) ?? ""
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}`,
						{ body: formData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			if (argv.file !== undefined) {
				const fileContent = readFileForFlag(argv.file);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}`,
						{
							body: fileContent,
							headers: { "Content-Type": "application/octet-stream" },
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}${qs ? "?" + qs : ""}`,
						{
							body: bodyData,
							headers: { "Content-Type": "application/octet-stream" },
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
		}
	);
}
