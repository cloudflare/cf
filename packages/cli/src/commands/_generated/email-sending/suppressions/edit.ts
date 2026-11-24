import operation from "../../_operations/email-sending/suppressions/edit.js";
/**
 * edit command
 * @generated from apis/overlays/email-sending.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <suppression-id>",
	describe: "Update account Email Sending suppression",
	usage:
		"$0 email-sending suppressions edit <suppression-id>\n\nUpdates expiry or advisory note fields. Scope cannot be changed.",
	flags: {
		"expires-at": {
			kind: "parsed",
			brief:
				"New expiry. Send `null` to make the suppression permanent; omit to leave it unchanged.",
			optional: true,
			parse: String,
		},
		note: {
			kind: "parsed",
			brief:
				"Replacement advisory note. Send an empty string to clear it; omit to leave it unchanged.",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief:
				'Not editable. Scope is fixed when the suppression is created; any value returns 400 with code `scope_immutable`. Delete and recreate the suppression to change it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "suppression-id",
			brief: "The suppression's identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending suppressions edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-sending suppressions edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions/${argv["suppression-id"] == null ? "<suppression-id>" : encodeURIComponent(String(argv["suppression-id"]))}`,
						pathParams: {
							"suppression-id": String(argv["suppression-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											expires_at: resolveFileToken(
												argv["expires-at"] as string | undefined,
												"expires-at",
												"text"
											),
											note: resolveFileToken(
												argv["note"] as string | undefined,
												"note",
												"text"
											),
											scope: parseJsonMap(argv["scope"], "scope"),
										},
										[["scope"]]
									),
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
							suppression_id: argv["suppression-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						expires_at: resolveFileToken(
							argv["expires-at"] as string | undefined,
							"expires-at",
							"text"
						),
						note: resolveFileToken(
							argv["note"] as string | undefined,
							"note",
							"text"
						),
						scope: parseJsonMap(argv["scope"], "scope"),
					},
					[["scope"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						suppression_id: argv["suppression-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
