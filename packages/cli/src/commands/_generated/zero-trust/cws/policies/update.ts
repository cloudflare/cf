import operation from "../../../_operations/zero-trust/cws/policies/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws policies update <policy-id>\n\nReplaces the policy's configuration. Omit tags or use {} to clear them."
		)
		.positional("policy-id", {
			type: "string",
			description: "ID of the policy to update",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "Optional free-form description.",
		})
		.option("entrypoint", {
			type: "string",
			description:
				"Non-function rule declared in rego_source. Evaluation uses data.<package_path>.<entrypoint>.",
		})
		.option("filter", {
			type: "string",
			description:
				"Filter expression that determines whether this policy applies. Maximum 4096 UTF-8 bytes.",
		})
		.option("name", { type: "string", description: "Name of the policy" })
		.option("rego-source", {
			type: "string",
			description:
				'Inline Rego source with a package beginning with "policy." Maximum 16384 UTF-8 bytes.',
		})
		.option("tags", {
			type: "string",
			description:
				"Replacement tag set. Omit or use {} to clear. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-id>",
	describe: "Update a policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws policies update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws policies update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											entrypoint: resolveFileToken(
												argv["entrypoint"] as string | undefined,
												"entrypoint",
												"text"
											),
											filter: resolveFileToken(
												argv["filter"] as string | undefined,
												"filter",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											rego_source: resolveFileToken(
												argv["rego-source"] as string | undefined,
												"rego-source",
												"text"
											),
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
									),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
				if (argv["entrypoint"] === undefined) {
					argv["entrypoint"] = await promptForRequiredField(
						"entrypoint",
						"Non-function rule declared in rego_source. Evaluation uses data.<package_path>.<entrypoint>."
					);
				}
				if (argv["filter"] === undefined) {
					argv["filter"] = await promptForRequiredField(
						"filter",
						"Filter expression that determines whether this policy applies. Maximum 4096 UTF-8 bytes."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the policy"
					);
				}
				if (argv["rego-source"] === undefined) {
					argv["rego-source"] = await promptForRequiredField(
						"rego-source",
						'Inline Rego source with a package beginning with "policy." Maximum 16384 UTF-8 bytes.'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						entrypoint: resolveFileToken(
							argv["entrypoint"] as string | undefined,
							"entrypoint",
							"text"
						),
						filter: resolveFileToken(
							argv["filter"] as string | undefined,
							"filter",
							"text"
						),
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						rego_source: resolveFileToken(
							argv["rego-source"] as string | undefined,
							"rego-source",
							"text"
						),
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
