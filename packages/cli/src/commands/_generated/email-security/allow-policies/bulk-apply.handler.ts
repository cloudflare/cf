import operation from "../../_operations/email-security/allow-policies/bulk-apply.js";
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
			command: "email-security allow-policies bulk-apply",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["deletes"] === undefined) {
					throw new Error(
						"--deletes is required (or pass --body with this field set)."
					);
				}
				if (argv["patches"] === undefined) {
					throw new Error(
						"--patches is required (or pass --body with this field set)."
					);
				}
				if (argv["posts"] === undefined) {
					throw new Error(
						"--posts is required (or pass --body with this field set)."
					);
				}
				if (argv["puts"] === undefined) {
					throw new Error(
						"--puts is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security allow-policies bulk-apply",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/allow_policies/batch`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									deletes: parseObjectArray(argv["deletes"], "deletes"),
									patches: parseObjectArray(argv["patches"], "patches"),
									posts: parseObjectArray(argv["posts"], "posts"),
									puts: parseObjectArray(argv["puts"], "puts"),
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
					message: `This operation may delete the selected allow policies and restore normal security scanning and disposition actions for matching emails.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				deletes: parseObjectArray(argv["deletes"], "deletes"),
				patches: parseObjectArray(argv["patches"], "patches"),
				posts: parseObjectArray(argv["posts"], "posts"),
				puts: parseObjectArray(argv["puts"], "puts"),
			});
			const result = await withProgress(`Processing`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
