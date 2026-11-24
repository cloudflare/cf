import operation from "../../../../_operations/cloudforce-one/threat-signals/articles/skills/run.js";
/**
 * run command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "run <skill-id>",
	describe: "Run and persist skill output for a Threat Signals article",
	usage:
		"$0 cloudforce-one threat-signals articles skills run <skill-id>\n\nRun an active Custom Skill assigned to the article's feed, or run a managed default skill. Requires a paid Threat Signals subscription and the Cloudforce One Write permission. Always persists output; rerunning overwrites the previous result. Does not expose diagnostic model data or accept server-preview inputs.",
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "skill-id",
			brief:
				"UUID of an active Custom Skill that is assigned to the article's feed, or a managed default skill ID. Requires a paid Threat Signals subscription and the Cloudforce One Write permission. Always persists output; rerunning overwrites the previous result. No diagnostic or server-preview inputs.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals articles skills run",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals articles skills run",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles/${argv["article-id"] == null ? "<article-id>" : encodeURIComponent(String(argv["article-id"]))}/skills/${argv["skill-id"] == null ? "<skill-id>" : encodeURIComponent(String(argv["skill-id"]))}/run`,
						pathParams: {
							"article-id": String(argv["article-id"] ?? ""),
							"skill-id": String(argv["skill-id"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							article_id: argv["article-id"],
							skill_id: argv["skill-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/cloudforce-one/v2/threat-signals/articles/${encodeURIComponent(String(argv["article-id"]))}/skills/${encodeURIComponent(String(argv["skill-id"]))}/run`
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
