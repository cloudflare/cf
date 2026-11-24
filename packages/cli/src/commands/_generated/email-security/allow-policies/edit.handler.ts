import operation from "../../_operations/email-security/allow-policies/edit.js";
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
			command: "email-security allow-policies edit",
			classification: {
				safeFlags: [
					"is-acceptable-sender",
					"is-exempt-recipient",
					"is-recipient",
					"is-regex",
					"is-sender",
					"is-spoof",
					"is-trusted-sender",
					"pattern-type",
					"verify-sender",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security allow-policies edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/allow_policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
					pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
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
									expires_at: resolveFileToken(
										argv["expires-at"] as string | undefined,
										"expires-at",
										"text"
									),
									is_acceptable_sender: argv["is-acceptable-sender"],
									is_exempt_recipient: argv["is-exempt-recipient"],
									is_recipient: argv["is-recipient"],
									is_regex: argv["is-regex"],
									is_sender: argv["is-sender"],
									is_spoof: argv["is-spoof"],
									is_trusted_sender: argv["is-trusted-sender"],
									pattern: resolveFileToken(
										argv["pattern"] as string | undefined,
										"pattern",
										"text"
									),
									pattern_type: argv["pattern-type"],
									verify_sender: argv["verify-sender"],
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
						policy_id: argv["policy-id"],
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
				expires_at: resolveFileToken(
					argv["expires-at"] as string | undefined,
					"expires-at",
					"text"
				),
				is_acceptable_sender: argv["is-acceptable-sender"],
				is_exempt_recipient: argv["is-exempt-recipient"],
				is_recipient: argv["is-recipient"],
				is_regex: argv["is-regex"],
				is_sender: argv["is-sender"],
				is_spoof: argv["is-spoof"],
				is_trusted_sender: argv["is-trusted-sender"],
				pattern: resolveFileToken(
					argv["pattern"] as string | undefined,
					"pattern",
					"text"
				),
				pattern_type: argv["pattern-type"],
				verify_sender: argv["verify-sender"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					policy_id: argv["policy-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
