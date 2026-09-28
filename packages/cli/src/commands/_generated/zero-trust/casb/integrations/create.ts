import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb integrations create\n\nCreates a new integration for the specified application. Integration creation with OAuth is not supported by API at the moment. For other auth methods, use `GET /v2/applications/{application_id}/credential-guide` to see the required credential structure and example payloads for each vendor."
		)
		.option("application", {
			type: "string",
			description:
				"Vendor/application slug (e.g., GOOGLE_WORKSPACE).\n\n* `ANTHROPIC` - ANTHROPIC\n* `AWS` - AWS\n* `BITBUCKET` - BITBUCKET\n* `BOX` - BOX\n* `CONFLUENCE` - CONFLUENCE\n* `DROPBOX` - DROPBOX\n* `GITHUB` - GITHUB\n* `GOOGLE_CLOUD_PLATFORM` - GOOGLE_CLOUD_PLATFORM\n* `GOOGLE_WORKSPACE` - GOOGLE_WORKSPACE\n* `JIRA` - JIRA\n* `MICROSOFT_INTERNAL` - MICROSOFT_INTERNAL\n* `OPENAI` - OPENAI\n* `SALESFORCE` - SALESFORCE\n* `SERVICENOW` - SERVICENOW\n* `SLACK` - SLACK",
			choices: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT_INTERNAL",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
			],
		})
		.option("auth-method", {
			type: "string",
			description: "Authentication method slug (uses default if omitted).",
		})
		.option("dlp-profiles", {
			type: "string",
			array: true,
			description: "List of DLP profile IDs to associate.",
		})
		.option("name", { type: "string", description: "Name of the integration." })
		.option("permissions", {
			type: "string",
			array: true,
			description: "List of permission scopes (uses policy defaults if empty).",
		})
		.option("use-cases", {
			type: "string",
			array: true,
			description:
				"List of use case or feature slugs to enroll (e.g., ['casb', 'ces', 'auto_remediation']).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Serializer for v2 integration create requests.",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create integration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb integrations create",
				classification: {
					safeFlags: ["application", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb integrations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/one/integrations`,
						pathParams: {},
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											application: resolveFileToken(
												argv["application"] as string | undefined,
												"application",
												"text"
											),
											auth_method: resolveFileToken(
												argv["auth-method"] as string | undefined,
												"auth-method",
												"text"
											),
											dlp_profiles: argv["dlp-profiles"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											permissions: argv["permissions"],
											use_cases: argv["use-cases"],
										}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/one/integrations`,
							{
								body: fileContent,
								headers: { "Content-Type": "text/plain;charset=UTF-8" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/one/integrations`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["application"] === undefined) {
					argv["application"] = await promptForRequiredEnumField(
						"application",
						"Vendor/application slug (e.g., GOOGLE_WORKSPACE).  * \`ANTHROPIC\` - ANTHROPIC * \`AWS\` - AWS * \`BITBUCKET\` - BITBUCKET * \`BOX\` - BOX * \`CONFLUENCE\` - CONFLUENCE * \`DROPBOX\` - DROPBOX * \`GITHUB\` - GITHUB * \`GOOGLE_CLOUD_PLATFORM\` - GOOGLE_CLOUD_PLATFORM * \`GOOGLE_WORKSPACE\` - GOOGLE_WORKSPACE * \`JIRA\` - JIRA * \`MICROSOFT_INTERNAL\` - MICROSOFT_INTERNAL * \`OPENAI\` - OPENAI * \`SALESFORCE\` - SALESFORCE * \`SERVICENOW\` - SERVICENOW * \`SLACK\` - SLACK",
						[
							"ANTHROPIC",
							"AWS",
							"BITBUCKET",
							"BOX",
							"CONFLUENCE",
							"DROPBOX",
							"GITHUB",
							"GOOGLE_CLOUD_PLATFORM",
							"GOOGLE_WORKSPACE",
							"JIRA",
							"MICROSOFT_INTERNAL",
							"OPENAI",
							"SALESFORCE",
							"SERVICENOW",
							"SLACK",
						] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the integration."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["application"] !== undefined)
					setNestedValue(
						bodyData,
						["application"],
						resolveFileToken(
							argv["application"] as string | undefined,
							"application",
							"text"
						)
					);
				if (argv["auth-method"] !== undefined)
					setNestedValue(
						bodyData,
						["auth_method"],
						resolveFileToken(
							argv["auth-method"] as string | undefined,
							"auth-method",
							"text"
						)
					);
				if (argv["dlp-profiles"] !== undefined)
					setNestedValue(bodyData, ["dlp_profiles"], argv["dlp-profiles"]);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["permissions"] !== undefined)
					setNestedValue(bodyData, ["permissions"], argv["permissions"]);
				if (argv["use-cases"] !== undefined)
					setNestedValue(bodyData, ["use_cases"], argv["use-cases"]);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/one/integrations`,
						{ body: Object.keys(bodyData).length > 0 ? bodyData : undefined }
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
