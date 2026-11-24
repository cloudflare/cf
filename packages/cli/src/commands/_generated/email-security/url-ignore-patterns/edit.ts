import operation from "../../_operations/email-security/url-ignore-patterns/edit.js";
/**
 * edit command
 * @generated from apis/overlays/email-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit <pattern-id>",
	describe: "Update a URL ignore pattern",
	usage:
		"$0 email-security url-ignore-patterns edit <pattern-id>\n\nUpdates an existing URL rewrite ignore pattern. Only provided fields will be modified.",
	flags: {
		comments: {
			kind: "parsed",
			brief: "Optional note describing the reason for the ignore pattern.",
			optional: true,
			parse: String,
		},
		pattern: {
			kind: "parsed",
			brief: "Regular expression identifying URLs to exempt from rewriting.",
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
			brief:
				"Updates a URL rewrite ignore pattern; modifies only the provided fields.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "pattern-id",
			brief: "URL ignore pattern identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security url-ignore-patterns edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security url-ignore-patterns edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/url_ignore_patterns/${argv["pattern-id"] == null ? "<pattern-id>" : encodeURIComponent(String(argv["pattern-id"]))}`,
						pathParams: { "pattern-id": String(argv["pattern-id"] ?? "") },
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
										pattern: resolveFileToken(
											argv["pattern"] as string | undefined,
											"pattern",
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							pattern_id: argv["pattern-id"],
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
					pattern: resolveFileToken(
						argv["pattern"] as string | undefined,
						"pattern",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						pattern_id: argv["pattern-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
