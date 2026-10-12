import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one priority-intelligence interests create\n\nCreates a structured account interest used by Priority Intelligence Option 2 evaluations. Interests are evaluated independently from free-form PIR requirements."
		)
		.option("dimension", {
			type: "string",
			description: "The dimension field",
			choices: [
				"actor",
				"targetIndustry",
				"category",
				"country",
				"attackerCountry",
				"targetCountry",
				"mitreAttack",
				"killChain",
				"mitreCapec",
			],
		})
		.coerce("dimension", (value) =>
			resolveFileToken(value, "dimension", "text")
		)
		.option("enabled", {
			type: "boolean",
			description: "The enabled field",
			default: true,
		})
		.option("value", { type: "string", description: "The value field" })
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

type Request = SdkRequest<"post_PirInterestCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an account interest for PIR Option 2",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence interests create",
				classification: {
					safeFlags: ["dimension", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence interests create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/interests`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dimension: argv["dimension"],
										enabled: argv["enabled"],
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
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
					const result = await withProgress(`Creating`, async () =>
						client.cloudforceOne.priorityIntelligence.interests.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["dimension"] === undefined) {
					argv["dimension"] = await promptForRequiredEnumField(
						"dimension",
						"The dimension field",
						[
							"actor",
							"targetIndustry",
							"category",
							"country",
							"attackerCountry",
							"targetCountry",
							"mitreAttack",
							"killChain",
							"mitreCapec",
						] as const
					);
				}
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredField(
						"value",
						"The value field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					dimension: argv["dimension"],
					enabled: argv["enabled"],
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.priorityIntelligence.interests.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
