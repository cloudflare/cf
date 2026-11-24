import operation from "../../../../_operations/zero-trust/cws/tenant-structures/nodes/bulk-apply.js";
/**
 * bulk-apply command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "Apply a batch of tenant node mutations",
	usage:
		"$0 zero-trust cws tenant-structures nodes bulk-apply\n\nAtomically validates and applies 1 to 500 unordered node operations. Creates may reference new parents but cannot reuse a native_id deleted in the same batch. Maximum body size: 1 MiB.",
	flags: {
		"structure-id": {
			kind: "parsed",
			brief: "ID of the parent tenant structure",
			parse: String,
		},
		creates: {
			kind: "parsed",
			brief:
				'Nodes to create; parents may be created elsewhere in this request. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"native_id": string, "node_kind": string, "name"?: string, "parent"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		deletes: {
			kind: "parsed",
			brief:
				'Nodes to delete; every descendant that will not be reparented must also be deleted. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		updates: {
			kind: "parsed",
			brief:
				'Nodes whose mutable fields should be fully replaced. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "name"?: string, "parent"?: string}]. ? marks optional keys.',
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
		),
});

export default command;
