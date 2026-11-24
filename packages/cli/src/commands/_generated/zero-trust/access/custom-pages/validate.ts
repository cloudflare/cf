import operation from "../../../_operations/zero-trust/access/custom-pages/validate.js";
/**
 * validate command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "validate",
	describe: "Validate a custom page template",
	usage:
		"$0 zero-trust access custom-pages validate\n\nValidate a Liquid template and return its errors and warnings without persisting it.",
	flags: {
		template: {
			kind: "parsed",
			brief: "The Liquid template to validate.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Custom page type.",
			optional: true,
			choices: ["identity_denied", "forbidden", "login", "interstitial"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"contract-version": {
			kind: "parsed",
			brief: "Contract version to validate against; omit for the latest.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "A template to validate without persisting it.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access custom-pages validate",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["template"] === undefined) {
						argv["template"] = await promptForRequiredField(
							"template",
							"The Liquid template to validate."
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"Custom page type.",
							["identity_denied", "forbidden", "login", "interstitial"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access custom-pages validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/custom_pages/validate`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										template: resolveFileToken(
											argv["template"] as string | undefined,
											"template",
											"text"
										),
										type: argv["type"],
										version: argv["contract-version"],
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
					const result = await withProgress(`Validating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Validated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					template: resolveFileToken(
						argv["template"] as string | undefined,
						"template",
						"text"
					),
					type: argv["type"],
					version: argv["contract-version"],
				});
				const result = await withProgress(`Validating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Validated` });
			}
		),
});

export default command;
