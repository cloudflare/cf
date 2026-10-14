import operation from "../../../../_operations/zero-trust/cws/tenant-structures/nodes/batch.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * batch command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws tenant-structures nodes batch <structure-id>\n\nAtomically validates and applies 1 to 500 unordered node operations. Creates may reference new parents but cannot reuse a native_id deleted in the same batch. Maximum body size: 1 MiB."
		)
		.positional("structure-id", {
			type: "string",
			description: "ID of the parent tenant structure",
			demandOption: true,
		})
		.option("creates", {
			type: "string",
			description:
				"Nodes to create; parents may be created elsewhere in this request. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("deletes", {
			type: "string",
			description:
				"Nodes to delete; every descendant that will not be reparented must also be deleted. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("updates", {
			type: "string",
			description:
				"Nodes whose mutable fields should be fully replaced. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "batch <structure-id>",
	describe: "Apply a batch of tenant node mutations",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws tenant-structures nodes batch",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws tenant-structures nodes batch",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Apply this tenant node batch?`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							structure_id: argv["structure-id"],
						})
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					creates: parseObjectArray(argv["creates"], "creates"),
					deletes: parseObjectArray(argv["deletes"], "deletes"),
					updates: parseObjectArray(argv["updates"], "updates"),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						structure_id: argv["structure-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
