import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dlp entries update <entry-id>\n\nUpdates a DLP entry."
		)
		.positional("entry-id", {
			type: "string",
			description: "Entry ID",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("pattern-regex", {
			type: "string",
			description: "The pattern.regex field",
		})
		.option("pattern-validation", {
			type: "string",
			description: "The pattern.validation field",
			choices: ["luhn"],
		})
		.coerce("pattern-validation", (value) =>
			resolveFileToken(value, "pattern-validation", "text")
		)
		.option("type", {
			type: "string",
			description: "The type field",
			choices: ["custom", "predefined", "integration"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Update to be applied to the entry.",
		})
		.check((argv) => {
			const groupSet = ["pattern-regex", "pattern-validation"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["pattern-regex"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --pattern-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-entries-update-entry">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <entry-id>",
	describe: "Update entry",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp entries update",
				classification: {
					safeFlags: ["pattern-validation", "type", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp entries update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/entries/${argv["entry-id"] == null ? "<entry-id>" : encodeURIComponent(String(argv["entry-id"]))}`,
						pathParams: { "entry-id": String(argv["entry-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										pattern: {
											regex: resolveFileToken(
												argv["pattern-regex"] as string | undefined,
												"pattern-regex",
												"text"
											),
											validation: argv["pattern-validation"],
										},
										type: argv["type"],
										enabled: argv["enabled"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.dlp.entries.update({
							body: bodyData,
							account_id: accountId,
							entry_id: argv["entry-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type field",
						["custom", "predefined", "integration"] as const
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					pattern: {
						regex: resolveFileToken(
							argv["pattern-regex"] as string | undefined,
							"pattern-regex",
							"text"
						),
						validation: argv["pattern-validation"],
					},
					type: argv["type"],
					enabled: argv["enabled"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.dlp.entries.update({
						body: bodyData,
						account_id: accountId,
						entry_id: argv["entry-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
