import operation from "../../../_operations/cloudforce-one/threat-signals/skills/update.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <skill-id>",
	describe: "Update Threat Signals skill",
	usage:
		"$0 cloudforce-one threat-signals skills update <skill-id>\n\nUpdates a Custom Skill. Managed Default Skills cannot be updated. Free Threat Signals accounts cannot update Custom Skills.",
	flags: {
		"skill-config": {
			kind: "parsed",
			brief:
				"Optional skill configuration (stored but not currently interpreted).",
			optional: true,
			parse: String,
		},
		"is-active": {
			kind: "boolean",
			brief: "Whether the skill is active and eligible for feed assignment.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Custom Skill name (1–100 characters).",
			optional: true,
			parse: String,
		},
		"output-schema": {
			kind: "parsed",
			brief: "JSON Schema serialized as a string (max 4096 characters).",
			optional: true,
			parse: String,
		},
		prompt: {
			kind: "parsed",
			brief: "AI prompt (1–4000 characters) defining the skill's instructions.",
			optional: true,
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
			brief: "Custom Skill UUID or a Managed Default Skill ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals skills update",
				classification: {
					safeFlags: ["is-active", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals skills update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/skills/${argv["skill-id"] == null ? "<skill-id>" : encodeURIComponent(String(argv["skill-id"]))}`,
						pathParams: { "skill-id": String(argv["skill-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: resolveFileToken(
											argv["skill-config"] as string | undefined,
											"skill-config",
											"text"
										),
										is_active: argv["is-active"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										output_schema: resolveFileToken(
											argv["output-schema"] as string | undefined,
											"output-schema",
											"text"
										),
										prompt: resolveFileToken(
											argv["prompt"] as string | undefined,
											"prompt",
											"text"
										),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							skill_id: argv["skill-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config: resolveFileToken(
						argv["skill-config"] as string | undefined,
						"skill-config",
						"text"
					),
					is_active: argv["is-active"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					output_schema: resolveFileToken(
						argv["output-schema"] as string | undefined,
						"output-schema",
						"text"
					),
					prompt: resolveFileToken(
						argv["prompt"] as string | undefined,
						"prompt",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						skill_id: argv["skill-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
