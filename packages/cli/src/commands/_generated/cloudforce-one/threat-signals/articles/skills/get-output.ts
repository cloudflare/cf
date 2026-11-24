import operation from "../../../../_operations/cloudforce-one/threat-signals/articles/skills/get-output.js";
/**
 * get-output command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get-output <skill-id>",
	describe: "Get Threat Signals article skill output",
	usage:
		"$0 cloudforce-one threat-signals articles skills get-output <skill-id>\n\nRetrieves the stored output of a skill for a Threat Signals article. The custom_output field is parsed JSON when the stored output is valid JSON, otherwise the raw string.",
	flags: {
		"article-id": {
			kind: "parsed",
			brief: "Threat Signals article UUID",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "skill-id",
			brief:
				"Custom Skill UUID or a Managed Default Skill ID (IOC-context: default-ioc-context-skill)",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals articles skills get-output",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-signals articles skills get-output",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles/${argv["article-id"] == null ? "<article-id>" : encodeURIComponent(String(argv["article-id"]))}/skills/${argv["skill-id"] == null ? "<skill-id>" : encodeURIComponent(String(argv["skill-id"]))}/output`,
						pathParams: {
							"article-id": String(argv["article-id"] ?? ""),
							"skill-id": String(argv["skill-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						article_id: argv["article-id"],
						skill_id: argv["skill-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
