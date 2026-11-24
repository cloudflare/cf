import operation from "../../../../_operations/zero-trust/cws/tenant-structures/nodes/bulk-apply.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-apply.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust cws tenant-structures nodes bulk-apply",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["creates"] === undefined) {
					throw new Error(
						"--creates is required (or pass --body with this field set)."
					);
				}
				if (argv["deletes"] === undefined) {
					throw new Error(
						"--deletes is required (or pass --body with this field set)."
					);
				}
				if (argv["updates"] === undefined) {
					throw new Error(
						"--updates is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust cws tenant-structures nodes bulk-apply",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/tenant-structures/${argv["structure-id"] == null ? "<structure-id>" : encodeURIComponent(String(argv["structure-id"]))}/nodes/batch`,
					pathParams: { "structure-id": String(argv["structure-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									creates: parseObjectArray(argv["creates"], "creates"),
									deletes: parseObjectArray(argv["deletes"], "deletes"),
									updates: parseObjectArray(argv["updates"], "updates"),
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
					message: `Apply this tenant node batch?`,
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
						structure_id: argv["structure-id"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				creates: parseObjectArray(argv["creates"], "creates"),
				deletes: parseObjectArray(argv["deletes"], "deletes"),
				updates: parseObjectArray(argv["updates"], "updates"),
			});
			const result = await withProgress(`Processing`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					structure_id: argv["structure-id"],
				})
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
