import operation from "../_operations/images/direct-upload.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./direct-upload.js";
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
			command: "images direct-upload",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf images direct-upload",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2/direct_upload`,
					pathParams: {},
					bodyKind: "multipart",
					body: {
						body: argv["body"],
						file: argv["file"],
						creator: argv["creator"],
						expiry: argv["expiry"],
						id: argv["id"],
						metadata: argv["metadata"],
						"require-signed-urls": argv["require-signed-urls"],
					},
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (
				argv.file !== undefined ||
				argv.body !== undefined ||
				argv["creator"] !== undefined ||
				argv["expiry"] !== undefined ||
				argv["id"] !== undefined ||
				argv["metadata"] !== undefined ||
				argv["require-signed-urls"] !== undefined
			) {
				const formData = new FormData();
				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					formData.append(
						"file",
						new Blob([fileContent]),
						argv.file.split(/[\\/]/).filter(Boolean).pop()
					);
				} else if (argv.body !== undefined) {
					formData.append("file", argv.body);
				}
				if (argv["creator"] !== undefined)
					formData.append(
						"creator",
						String(
							resolveFileToken(
								argv["creator"] as string | undefined,
								"creator",
								"text"
							) ?? ""
						)
					);
				if (argv["expiry"] !== undefined)
					formData.append(
						"expiry",
						String(
							resolveFileToken(
								argv["expiry"] as string | undefined,
								"expiry",
								"text"
							) ?? ""
						)
					);
				if (argv["id"] !== undefined)
					formData.append(
						"id",
						String(
							resolveFileToken(
								argv["id"] as string | undefined,
								"id",
								"text"
							) ?? ""
						)
					);
				if (argv["metadata"] !== undefined) {
					const v =
						typeof argv["metadata"] === "string"
							? resolveFileToken(argv["metadata"], "metadata", "text")
							: argv["metadata"];
					formData.append(
						"metadata",
						typeof v === "string" ? v : JSON.stringify(v)
					);
				}
				if (argv["require-signed-urls"] !== undefined)
					formData.append(
						"requireSignedURLs",
						String(argv["require-signed-urls"])
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/images/v2/direct_upload`,
						{ body: formData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			if (argv.body !== undefined) {
				// Endpoint does not accept application/json — send --body as raw bytes,
				// resolving @file references as binary file contents.
				const bodyData = resolveFileToken(argv.body, "body", "binary");
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/images/v2/direct_upload`,
						{
							body: bodyData,
							headers: { "Content-Type": "multipart/form-data" },
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
