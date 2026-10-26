import operation from "../../../_operations/cloudforce-one/threat-signals/skills/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals skills create\n\nCreates a Custom Skill for the account. Free Threat Signals accounts cannot create Custom Skills."
		)
		.option("name", {
			type: "string",
			description: "Custom Skill name (1–100 characters).",
		})
		.option("output-schema", {
			type: "string",
			description: "JSON Schema serialized as a string (max 4096 characters).",
		})
		.option("prompt", {
			type: "string",
			description:
				"AI prompt (1–4000 characters) defining the skill's instructions.",
		})
		.option("type", {
			type: "string",
			description:
				'Optional label; does not affect execution. Defaults to "summary".',
			choices: ["summary", "tags"],
			default: "summary",
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
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
	command: "create",
	describe: "Create Threat Signals skill",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals skills create",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals skills create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/skills`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										output_schema: resolveFileToken(
											argv["output-schema"] as string | undefined,
											"output-schema",
											"text"
										),
										prompt: resolveFileToken(
											argv["prompt"] as string | undefined,
											"prompt",
											"text"
										),
										type: argv["type"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Custom Skill name (1–100 characters)."
					);
				}
				if (argv["output-schema"] === undefined) {
					argv["output-schema"] = await promptForRequiredField(
						"output-schema",
						"JSON Schema serialized as a string (max 4096 characters)."
					);
				}
				if (argv["prompt"] === undefined) {
					argv["prompt"] = await promptForRequiredField(
						"prompt",
						"AI prompt (1–4000 characters) defining the skill's instructions."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					output_schema: resolveFileToken(
						argv["output-schema"] as string | undefined,
						"output-schema",
						"text"
					),
					prompt: resolveFileToken(
						argv["prompt"] as string | undefined,
						"prompt",
						"text"
					),
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
