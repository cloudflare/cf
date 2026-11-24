import operation from "../../_operations/resource-sharing/resources/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "resource-sharing resources update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["meta"] === undefined) {
					throw new Error(
						"--meta is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf resource-sharing resources update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/resources/${argv["share-resource-id"] == null ? "<share-resource-id>" : encodeURIComponent(String(argv["share-resource-id"]))}`,
					pathParams: {
						"share-id": String(argv["share-id"] ?? ""),
						"share-resource-id": String(argv["share-resource-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body, [{ path: ["meta"], flag: "meta" }])
							: compactBody(
									{
										meta: parseJsonMap(argv["meta"], "meta", true),
									},
									[["meta"]]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? parseBody(argv.body, [{ path: ["meta"], flag: "meta" }])
					: undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						share_id: argv["share-id"],
						share_resource_id: argv["share-resource-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					meta: parseJsonMap(argv["meta"], "meta", true),
				},
				[["meta"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					share_id: argv["share-id"],
					share_resource_id: argv["share-resource-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
