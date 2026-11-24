import operation from "../../_operations/email-security/impersonation-registry/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-security impersonation-registry edit",
			classification: {
				safeFlags: ["is-email-regex", "provenance", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security impersonation-registry edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/impersonation_registry/${argv["impersonation-registry-id"] == null ? "<impersonation-registry-id>" : encodeURIComponent(String(argv["impersonation-registry-id"]))}`,
					pathParams: {
						"impersonation-registry-id": String(
							argv["impersonation-registry-id"] ?? ""
						),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									comments: resolveFileToken(
										argv["comments"] as string | undefined,
										"comments",
										"text"
									),
									directory_id: argv["directory-id"],
									directory_node_id: argv["directory-node-id"],
									email: resolveFileToken(
										argv["email"] as string | undefined,
										"email",
										"text"
									),
									external_directory_node_id: resolveFileToken(
										argv["external-directory-node-id"] as string | undefined,
										"external-directory-node-id",
										"text"
									),
									is_email_regex: argv["is-email-regex"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									provenance: argv["provenance"],
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
						impersonation_registry_id: argv["impersonation-registry-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				comments: resolveFileToken(
					argv["comments"] as string | undefined,
					"comments",
					"text"
				),
				directory_id: argv["directory-id"],
				directory_node_id: argv["directory-node-id"],
				email: resolveFileToken(
					argv["email"] as string | undefined,
					"email",
					"text"
				),
				external_directory_node_id: resolveFileToken(
					argv["external-directory-node-id"] as string | undefined,
					"external-directory-node-id",
					"text"
				),
				is_email_regex: argv["is-email-regex"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				provenance: argv["provenance"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					impersonation_registry_id: argv["impersonation-registry-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
