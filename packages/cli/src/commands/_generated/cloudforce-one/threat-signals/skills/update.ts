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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals skills update <skill-id>\n\nUpdate Threat Signals skill."
		)
		.positional("skill-id", {
			type: "string",
			description: "Skill ID",
			demandOption: true,
		})
		.option("config", { type: "string", description: "The config field" })
		.option("is-active", {
			type: "boolean",
			description: "The is_active field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("output-schema", {
			type: "string",
			description: "The output_schema field",
		})
		.option("prompt", { type: "string", description: "The prompt field" })
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

type Request = SdkRequest<"rssSkillUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <skill-id>",
	describe: "Update Threat Signals skill",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals skills update",
				classification: {
					safeFlags: ["is-active", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals skills update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/skills/${argv["skill-id"] == null ? "<skill-id>" : encodeURIComponent(String(argv["skill-id"]))}`,
						pathParams: { "skill-id": String(argv["skill-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: resolveFileToken(
											argv["config"] as string | undefined,
											"config",
											"text"
										),
										is_active: argv["is-active"],
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.threatSignals.skills.update({
							...bodyData,
							account_id: accountId,
							skill_id: argv["skill-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: resolveFileToken(
						argv["config"] as string | undefined,
						"config",
						"text"
					),
					is_active: argv["is-active"],
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.threatSignals.skills.update({
						...bodyData,
						account_id: accountId,
						skill_id: argv["skill-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
