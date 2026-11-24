import operation from "../../../_operations/zero-trust/devices/override-codes/create.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Generate an uninstall protection override code",
	usage:
		"$0 zero-trust devices override-codes create\n\nGenerates an account-wide or device-specific uninstall protection override code.",
	flags: {
		"device-id": {
			kind: "parsed",
			brief:
				"Physical device ID. Required when scope is device and forbidden when scope is account.",
			optional: true,
			parse: String,
		},
		"duration-hours": {
			kind: "parsed",
			brief: "Number of hours for which the override code should remain valid.",
			optional: true,
			parse: Number,
		},
		scope: {
			kind: "parsed",
			brief:
				"Whether the code applies to every device in the account or one physical device.",
			optional: true,
			choices: ["account", "device"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
		},
		type: {
			kind: "parsed",
			brief: "The feature that the override code applies to.",
			optional: true,
			choices: ["uninstall_protection"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
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
				command: "zero-trust devices override-codes create",
				classification: {
					safeFlags: ["scope", "type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
