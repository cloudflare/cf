import operation from "../../_operations/email-routing/rules/plan.js";
/**
 * plan command
 * @generated from apis/overlays/email-routing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "plan",
	describe: "Plan account routing rule changes",
	usage:
		"$0 email-routing rules plan\n\nComputes the Email Routing rule changes that would be needed to reconcile a Wrangler-managed desired ruleset. This endpoint is read-only and does not create, update, or delete rules.",
	flags: {
		"catch-all-rules": {
			kind: "parsed",
			brief:
				'Desired catch-all Email Routing rules managed by the deploying Worker. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"rule": {...}, "target": string}].',
			optional: true,
			parse: String,
		},
		"owner-worker-tag": {
			kind: "parsed",
			brief:
				"Public tag (script_tag) of the Worker that owns this rule. Required when\n`source` is `wrangler`.\n",
			optional: true,
			parse: String,
		},
		rules: {
			kind: "parsed",
			brief:
				'Desired normal Email Routing rules managed by the deploying Worker. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"actions": [{...}], "matchers": [{...}], "enabled"?: true | false}]. ? marks optional keys.',
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing rules plan",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["owner-worker-tag"] === undefined) {
						argv["owner-worker-tag"] = await promptForRequiredField(
							"owner-worker-tag",
							"Public tag (script_tag) of the Worker that owns this rule. Required when \`source\` is \`wrangler\`. "
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-routing rules plan",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/routing/rules/plan`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										catch_all_rules: parseObjectArray(
											argv["catch-all-rules"],
											"catch-all-rules"
										),
										owner_worker_tag: resolveFileToken(
											argv["owner-worker-tag"] as string | undefined,
											"owner-worker-tag",
											"text"
										),
										rules: parseObjectArray(argv["rules"], "rules"),
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
					catch_all_rules: parseObjectArray(
						argv["catch-all-rules"],
						"catch-all-rules"
					),
					owner_worker_tag: resolveFileToken(
						argv["owner-worker-tag"] as string | undefined,
						"owner-worker-tag",
						"text"
					),
					rules: parseObjectArray(argv["rules"], "rules"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
