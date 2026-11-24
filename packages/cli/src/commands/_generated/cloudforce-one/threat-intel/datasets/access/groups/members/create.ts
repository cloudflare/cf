import operation from "../../../../../../_operations/cloudforce-one/threat-intel/datasets/access/groups/members/create.js";
/**
 * create command
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
	command: "create <group-id>",
	describe: "Add an account to a group",
	usage:
		"$0 cloudforce-one threat-intel datasets access groups members create <group-id>\n\nAdds an account to an account group. Identify the account by `accountId` or `accountTag`.",
	flags: {
		"account-id-body": {
			kind: "parsed",
			brief: "The accountId field",
			optional: true,
			parse: String,
		},
		"account-tag": {
			kind: "parsed",
			brief: "The accountTag field",
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
	operands: [{ placeholder: "group-id", brief: "Group ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"cloudforce-one threat-intel datasets access groups members create",
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
							"cf cloudforce-one threat-intel datasets access groups members create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/-/groups/${argv["group-id"] == null ? "<group-id>" : encodeURIComponent(String(argv["group-id"]))}/members`,
						pathParams: { "group-id": String(argv["group-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										accountId: resolveFileToken(
											argv["account-id-body"] as string | undefined,
											"account-id-body",
											"text"
										),
										accountTag: resolveFileToken(
											argv["account-tag"] as string | undefined,
											"account-tag",
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							group_id: argv["group-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					accountId: resolveFileToken(
						argv["account-id-body"] as string | undefined,
						"account-id-body",
						"text"
					),
					accountTag: resolveFileToken(
						argv["account-tag"] as string | undefined,
						"account-tag",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						group_id: argv["group-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
