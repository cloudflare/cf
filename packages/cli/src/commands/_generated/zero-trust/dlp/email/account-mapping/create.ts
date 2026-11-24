import operation from "../../../../_operations/zero-trust/dlp/email/account-mapping/create.js";
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
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["auth_requirements"],
		selector: "type",
		variants: [
			{
				values: ["Org"],
				schema: {
					type: "object",
					properties: {
						allowed_microsoft_organizations: {
							type: "array",
							items: { type: "string" },
						},
						type: { enum: ["Org"] },
					},
					required: ["allowed_microsoft_organizations", "type"],
					additionalProperties: false,
				},
			},
			{
				values: ["NoAuth"],
				schema: {
					type: "object",
					properties: { type: { enum: ["NoAuth"] } },
					required: ["type"],
					additionalProperties: false,
				},
			},
		],
	},
];

const command = apiCommand({
	command: "create",
	describe: "Create mapping",
	usage:
		"$0 zero-trust dlp email account-mapping create\n\nCreates a mapping between a Cloudflare account and an email provider for DLP email scanning integration.",
	flags: {
		"auth-requirements-allowed-microsoft-organizations": {
			kind: "parsed",
			brief: "The auth_requirements.allowed_microsoft_organizations field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"auth-requirements-type": {
			kind: "parsed",
			brief: "The auth_requirements.type field",
			optional: true,
			choices: ["Org", "NoAuth"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "auth-requirements-type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Account mapping.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp email account-mapping create",
				classification: {
					safeFlags: ["auth-requirements-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["auth-requirements-type"] === undefined) {
						argv["auth-requirements-type"] = await promptForRequiredEnumField(
							"auth-requirements-type",
							"The auth_requirements.type field",
							["Org", "NoAuth"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp email account-mapping create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/account_mapping`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: validateBodyUnions(
										compactBody({
											auth_requirements: {
												allowed_microsoft_organizations:
													argv[
														"auth-requirements-allowed-microsoft-organizations"
													],
												type: argv["auth-requirements-type"],
											},
										}),
										bodyUnions
									),
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
					auth_requirements: {
						allowed_microsoft_organizations:
							argv["auth-requirements-allowed-microsoft-organizations"],
						type: argv["auth-requirements-type"],
					},
				});
				validateBodyUnions(bodyData, bodyUnions);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
