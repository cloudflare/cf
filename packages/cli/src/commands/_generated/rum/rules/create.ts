import operation from "../../_operations/rum/rules/create.js";
/**
 * create command
 * @generated from apis/overlays/rum.ts
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
	command: "create <ruleset-id>",
	describe: "Create a Web Analytics rule",
	usage:
		"$0 rum rules create <ruleset-id>\n\nCreates a new rule in a Web Analytics ruleset.",
	flags: {
		host: {
			kind: "parsed",
			brief: "The host field",
			optional: true,
			parse: String,
		},
		inclusive: {
			kind: "boolean",
			brief:
				"Whether the rule includes or excludes traffic from being measured.",
			optional: true,
		},
		"is-paused": {
			kind: "boolean",
			brief: "Whether the rule is paused or not.",
			optional: true,
		},
		paths: {
			kind: "parsed",
			brief: "The paths field",
			variadic: true,
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
			placeholder: "ruleset-id",
			brief: "The Web Analytics ruleset identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rum rules create",
				classification: {
					safeFlags: ["inclusive", "is-paused", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rum rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rum/v2/${argv["ruleset-id"] == null ? "<ruleset-id>" : encodeURIComponent(String(argv["ruleset-id"]))}/rule`,
						pathParams: { "ruleset-id": String(argv["ruleset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										inclusive: argv["inclusive"],
										is_paused: argv["is-paused"],
										paths: argv["paths"],
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							ruleset_id: argv["ruleset-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					inclusive: argv["inclusive"],
					is_paused: argv["is-paused"],
					paths: argv["paths"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						ruleset_id: argv["ruleset-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
