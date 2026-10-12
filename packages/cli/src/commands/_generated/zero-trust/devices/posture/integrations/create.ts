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
			"$0 zero-trust devices posture integrations create\n\nCreate a new device posture integration."
		)
		.option("config-api-url", {
			type: "string",
			description:
				"The Workspace One API URL provided in the Workspace One Admin Dashboard.",
		})
		.option("config-auth-url", {
			type: "string",
			description:
				"The Workspace One Authorization URL depending on your region.",
		})
		.option("config-client-id", {
			type: "string",
			description:
				"The Workspace One client ID provided in the Workspace One Admin Dashboard.",
		})
		.option("config-client-secret", {
			type: "string",
			description:
				"The Workspace One client secret provided in the Workspace One Admin Dashboard.",
		})
		.option("config-customer-id", {
			type: "string",
			description: "The Crowdstrike customer ID.",
		})
		.option("config-client-key", {
			type: "string",
			description: "The Uptycs client secret.",
		})
		.option("config-access-client-id", {
			type: "string",
			description:
				"If present, this id will be passed in the `CF-Access-Client-ID` header when hitting the `api_url`.",
		})
		.option("config-access-client-secret", {
			type: "string",
			description:
				"If present, this secret will be passed in the `CF-Access-Client-Secret` header when hitting the `api_url`.",
		})
		.option("interval", {
			type: "string",
			description:
				"The interval between each posture check with the third-party API. Use `m` for minutes (e.g. `5m`) and `h` for hours (e.g. `12h`).",
		})
		.option("name", {
			type: "string",
			description: "The name of the device posture integration.",
		})
		.option("type", {
			type: "string",
			description: "The type of device posture integration.",
			choices: [
				"workspace_one",
				"crowdstrike_s2s",
				"uptycs",
				"intune",
				"kolide",
				"tanium_s2s",
				"sentinelone_s2s",
				"custom_s2s",
			],
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
		})
		.conflicts("config-api-url", [
			"config-customer-id",
			"config-client-id",
			"config-client-secret",
		])
		.conflicts("config-auth-url", [
			"config-customer-id",
			"config-client-key",
			"config-access-client-id",
			"config-access-client-secret",
		])
		.implies("config-auth-url", [
			"config-api-url",
			"config-client-id",
			"config-client-secret",
		])
		.conflicts("config-client-id", [
			"config-client-key",
			"config-customer-id",
			"config-access-client-id",
			"config-access-client-secret",
			"config-api-url",
		])
		.conflicts("config-client-secret", [
			"config-access-client-id",
			"config-access-client-secret",
			"config-api-url",
		])
		.conflicts("config-customer-id", [
			"config-auth-url",
			"config-client-id",
			"config-api-url",
			"config-access-client-id",
			"config-access-client-secret",
		])
		.conflicts("config-client-key", [
			"config-auth-url",
			"config-client-id",
			"config-access-client-id",
			"config-access-client-secret",
		])
		.implies("config-client-key", [
			"config-api-url",
			"config-customer-id",
			"config-client-secret",
		])
		.conflicts("config-access-client-id", [
			"config-auth-url",
			"config-client-id",
			"config-client-secret",
			"config-customer-id",
			"config-client-key",
		])
		.implies("config-access-client-id", [
			"config-api-url",
			"config-access-client-secret",
		])
		.conflicts("config-access-client-secret", [
			"config-auth-url",
			"config-client-id",
			"config-client-secret",
			"config-customer-id",
			"config-client-key",
		])
		.implies("config-access-client-secret", [
			"config-api-url",
			"config-access-client-id",
		]);
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"device-posture-integrations-create-device-posture-integration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create posture integration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices posture integrations create",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices posture integrations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/posture/integration`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											api_url: resolveFileToken(
												argv["config-api-url"] as string | undefined,
												"config-api-url",
												"text"
											),
											auth_url: resolveFileToken(
												argv["config-auth-url"] as string | undefined,
												"config-auth-url",
												"text"
											),
											client_id: resolveFileToken(
												argv["config-client-id"] as string | undefined,
												"config-client-id",
												"text"
											),
											client_secret: resolveFileToken(
												argv["config-client-secret"] as string | undefined,
												"config-client-secret",
												"text"
											),
											customer_id: resolveFileToken(
												argv["config-customer-id"] as string | undefined,
												"config-customer-id",
												"text"
											),
											client_key: resolveFileToken(
												argv["config-client-key"] as string | undefined,
												"config-client-key",
												"text"
											),
											access_client_id: resolveFileToken(
												argv["config-access-client-id"] as string | undefined,
												"config-access-client-id",
												"text"
											),
											access_client_secret: resolveFileToken(
												argv["config-access-client-secret"] as
													| string
													| undefined,
												"config-access-client-secret",
												"text"
											),
										},
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
										type: argv["type"],
									}),
						sensitiveBodyPaths: [
							["config", "client_secret"],
							["config", "client_key"],
							["config", "access_client_secret"],
						],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.devices.posture.integrations.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["interval"] === undefined) {
					argv["interval"] = await promptForRequiredField(
						"interval",
						"The interval between each posture check with the third-party API. Use \`m\` for minutes (e.g. \`5m\`) and \`h\` for hours (e.g. \`12h\`)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the device posture integration."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type of device posture integration.",
						[
							"workspace_one",
							"crowdstrike_s2s",
							"uptycs",
							"intune",
							"kolide",
							"tanium_s2s",
							"sentinelone_s2s",
							"custom_s2s",
						] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: {
						api_url: resolveFileToken(
							argv["config-api-url"] as string | undefined,
							"config-api-url",
							"text"
						),
						auth_url: resolveFileToken(
							argv["config-auth-url"] as string | undefined,
							"config-auth-url",
							"text"
						),
						client_id: resolveFileToken(
							argv["config-client-id"] as string | undefined,
							"config-client-id",
							"text"
						),
						client_secret: resolveFileToken(
							argv["config-client-secret"] as string | undefined,
							"config-client-secret",
							"text"
						),
						customer_id: resolveFileToken(
							argv["config-customer-id"] as string | undefined,
							"config-customer-id",
							"text"
						),
						client_key: resolveFileToken(
							argv["config-client-key"] as string | undefined,
							"config-client-key",
							"text"
						),
						access_client_id: resolveFileToken(
							argv["config-access-client-id"] as string | undefined,
							"config-access-client-id",
							"text"
						),
						access_client_secret: resolveFileToken(
							argv["config-access-client-secret"] as string | undefined,
							"config-access-client-secret",
							"text"
						),
					},
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
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.devices.posture.integrations.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
