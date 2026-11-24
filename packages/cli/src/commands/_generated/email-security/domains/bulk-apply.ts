import operation from "../../_operations/email-security/domains/bulk-apply.js";
/**
 * bulk-apply command
 * @generated from apis/overlays/email-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "bulk-apply",
	describe: "Batch domain operations",
	usage:
		"$0 email-security domains bulk-apply\n\nExecutes multiple domain operations in a single request. All four operation arrays (deletes, patches, puts, posts) are required and executed in order. Send empty arrays for unused operations.",
	flags: {
		deletes: {
			kind: "parsed",
			brief:
				'IDs of the domains to remove protection from. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		patches: {
			kind: "parsed",
			brief:
				'Partial updates to apply — each entry carries the domain\'s ID and only the fields to change. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"allowed_delivery_modes"?: ["DIRECT" | "BCC" | "JOURNAL" | ...more], "drop_dispositions"?: ["MALICIOUS" | "MALICIOUS-BEC" | "SUSPICIOUS" | ...more], "folder"?: ("AllItems" | "Inbox" | null), ...more} & {"id": string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		posts: {
			kind: "parsed",
			brief:
				'Domains to add protection for. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"allowed_delivery_modes": ["DIRECT" | "BCC" | "JOURNAL" | ...more], "domain": string, "drop_dispositions": ["MALICIOUS" | "MALICIOUS-BEC" | "SUSPICIOUS" | ...more], "ip_restrictions": [string], ...more}].',
			optional: true,
			parse: String,
		},
		puts: {
			kind: "parsed",
			brief:
				'Full replacements to apply — each entry carries the domain\'s ID and every field of its new value. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"allowed_delivery_modes": ["DIRECT" | "BCC" | "JOURNAL" | ...more], "drop_dispositions": ["MALICIOUS" | "MALICIOUS-BEC" | "SUSPICIOUS" | ...more], "ip_restrictions": [string], ...more} & {"id": string})].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security domains bulk-apply",
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
						command: "cf email-security domains bulk-apply",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/domains/batch`,
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
						message: `This operation may permanently delete protection for the selected email domains. Emails for those domains will no longer be processed by Email Security.`,
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
		),
});

export default command;
