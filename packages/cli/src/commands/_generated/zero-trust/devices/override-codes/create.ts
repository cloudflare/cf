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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust devices override-codes create\n\nGenerates an account-wide or device-specific uninstall protection override code."
		)
		.option("device-id", {
			type: "string",
			description:
				"Physical device ID. Required when scope is device and forbidden when scope is account.",
		})
		.option("duration-hours", {
			type: "number",
			description:
				"Number of hours for which the override code should remain valid.",
		})
		.option("scope", {
			type: "string",
			description:
				"Whether the code applies to every device in the account or one physical device.",
			choices: ["account", "device"],
		})
		.coerce("scope", (value: string | undefined) =>
			resolveFileToken(value, "scope", "text")
		)
		.option("type", {
			type: "string",
			description: "The feature that the override code applies to.",
			choices: ["uninstall_protection"],
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
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

type Request = SdkRequest<"create-override-code">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Generate an uninstall protection override code",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices override-codes create",
				classification: {
					safeFlags: ["scope", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices override-codes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/override_codes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										device_id: resolveFileToken(
											argv["device-id"] as string | undefined,
											"device-id",
											"text"
										),
										duration_hours: argv["duration-hours"],
										scope: argv["scope"],
										type: argv["type"],
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
						client.zeroTrust.devices.overrideCodes.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["duration-hours"] === undefined) {
					throw new Error(
						"--duration-hours is required (or pass --body with this field set)."
					);
				}
				if (argv["scope"] === undefined) {
					argv["scope"] = await promptForRequiredEnumField(
						"scope",
						"Whether the code applies to every device in the account or one physical device.",
						["account", "device"] as const
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The feature that the override code applies to.",
						["uninstall_protection"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					device_id: resolveFileToken(
						argv["device-id"] as string | undefined,
						"device-id",
						"text"
					),
					duration_hours: argv["duration-hours"],
					scope: argv["scope"],
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.devices.overrideCodes.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
