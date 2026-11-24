import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	setNestedValue,
} from "#lib/body-parser.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust casb integrations create",
			classification: {
				safeFlags: ["application", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["application"] === undefined) {
					argv["application"] = await promptForRequiredEnumField(
						"application",
						"Vendor/application slug (e.g., GOOGLE_WORKSPACE).  * \`ANTHROPIC\` - ANTHROPIC * \`AWS\` - AWS * \`BITBUCKET\` - BITBUCKET * \`BOX\` - BOX * \`CONFLUENCE\` - CONFLUENCE * \`DROPBOX\` - DROPBOX * \`GITHUB\` - GITHUB * \`GOOGLE_CLOUD_PLATFORM\` - GOOGLE_CLOUD_PLATFORM * \`GOOGLE_WORKSPACE\` - GOOGLE_WORKSPACE * \`JIRA\` - JIRA * \`MICROSOFT_INTERNAL\` - MICROSOFT_INTERNAL * \`OPENAI\` - OPENAI * \`SALESFORCE\` - SALESFORCE * \`SERVICENOW\` - SERVICENOW * \`SLACK\` - SLACK * \`ZOOM\` - ZOOM",
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
							"ZOOM",
						] as const
					);
				}
				if (argv["credentials"] === undefined) {
					throw new Error(
						"--credentials is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the integration."
					);
				}
				if (argv["use-cases"] === undefined) {
					throw new Error(
						"--use-cases is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined && argv.file === undefined) {
					await resolveRequiredFields();
				}
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
								? parseBody(argv.body, [
										{ path: ["credentials"], flag: "credentials" },
									])
								: compactBody(
										{
											application: argv["application"],
											auth_method: resolveFileToken(
												argv["auth-method"] as string | undefined,
												"auth-method",
												"text"
											),
											credentials: parseJsonMap(
												argv["credentials"],
												"credentials",
												true
											),
											dlp_profiles: argv["dlp-profiles"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											permissions: argv["permissions"],
											use_cases: argv["use-cases"],
										},
										[["credentials"]]
									),
				});
				return;
			}
			const parsedBody =
				argv.file !== undefined
					? undefined
					: argv.body !== undefined
						? parseBody(argv.body, [
								{ path: ["credentials"], flag: "credentials" },
							])
						: undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.file !== undefined) {
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

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
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
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["application"] !== undefined)
				setNestedValue(bodyData, ["application"], argv["application"]);
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
			if (argv["credentials"] !== undefined)
				setNestedValue(
					bodyData,
					["credentials"],
					parseJsonMap(argv["credentials"], "credentials", true)
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
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
