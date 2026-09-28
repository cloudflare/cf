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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb integrations update <id>\n\nUpdates an integration's name, permissions, DLP profiles, use cases, or credentials."
		)
		.positional("id", {
			type: "string",
			description: "Integration ID.",
			demandOption: true,
		})
		.option("dlp-profiles", {
			type: "string",
			array: true,
			description: "List of DLP profile IDs to associate with the integration.",
		})
		.option("name", { type: "string", description: "Name of the integration." })
		.option("permissions", {
			type: "string",
			array: true,
			description: "List of permission scopes granted to the integration.",
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
			description: "Serializer for v2 integration PATCH requests.",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <id>",
	describe: "Update integration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb integrations update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb integrations update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/one/integrations/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
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
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/one/integrations/${encodeURIComponent(String(argv["id"]))}`,
							{
								body: fileContent,
								headers: { "Content-Type": "text/plain;charset=UTF-8" },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/one/integrations/${encodeURIComponent(String(argv["id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
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
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/one/integrations/${encodeURIComponent(String(argv["id"]))}`,
						{ body: Object.keys(bodyData).length > 0 ? bodyData : undefined }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
