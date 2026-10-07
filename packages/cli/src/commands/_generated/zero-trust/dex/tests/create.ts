import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
		.usage("$0 zero-trust dex tests create\n\nCreate a DEX test.")
		.option("data-host", {
			type: "string",
			description: "The desired endpoint to test.",
		})
		.option("data-kind", {
			type: "string",
			description: "The type of test.",
			choices: ["http", "traceroute"],
		})
		.option("data-method", {
			type: "string",
			description: "The HTTP request method type.",
			choices: ["GET"],
		})
		.option("description", {
			type: "string",
			description: "Additional details about the test.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Determines whether or not the test is active.",
		})
		.option("interval", {
			type: "string",
			description: "How often the test will run.",
		})
		.option("name", {
			type: "string",
			description: "The name of the DEX test. Must be unique.",
		})
		.option("target-policies", {
			type: "string",
			description:
				"DEX rules targeted by this test. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("targeted", { type: "boolean", description: "The targeted field" })
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

type Request = SdkRequest<"device-dex-test-create-device-dex-test">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Device DEX test",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex tests create",
				classification: {
					safeFlags: [
						"data-kind",
						"data-method",
						"enabled",
						"targeted",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex tests create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/devices/dex_tests`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										data: {
											host: resolveFileToken(
												argv["data-host"] as string | undefined,
												"data-host",
												"text"
											),
											kind: resolveFileToken(
												argv["data-kind"] as string | undefined,
												"data-kind",
												"text"
											),
											method: resolveFileToken(
												argv["data-method"] as string | undefined,
												"data-method",
												"text"
											),
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										interval: resolveFileToken(
											argv["interval"] as string | undefined,
											"interval",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										target_policies: parseObjectArray(
											argv["target-policies"],
											"target-policies"
										),
										targeted: argv["targeted"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.dex.tests.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["data-host"] === undefined) {
					argv["data-host"] = await promptForRequiredField(
						"data-host",
						"The desired endpoint to test."
					);
				}
				if (argv["data-kind"] === undefined) {
					argv["data-kind"] = await promptForRequiredEnumField(
						"data-kind",
						"The type of test.",
						["http", "traceroute"] as const
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["interval"] === undefined) {
					argv["interval"] = await promptForRequiredField(
						"interval",
						"How often the test will run."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the DEX test. Must be unique."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					data: {
						host: resolveFileToken(
							argv["data-host"] as string | undefined,
							"data-host",
							"text"
						),
						kind: resolveFileToken(
							argv["data-kind"] as string | undefined,
							"data-kind",
							"text"
						),
						method: resolveFileToken(
							argv["data-method"] as string | undefined,
							"data-method",
							"text"
						),
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					interval: resolveFileToken(
						argv["interval"] as string | undefined,
						"interval",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					target_policies: parseObjectArray(
						argv["target-policies"],
						"target-policies"
					),
					targeted: argv["targeted"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.dex.tests.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
