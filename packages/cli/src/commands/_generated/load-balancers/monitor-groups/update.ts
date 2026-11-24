import operation from "../../_operations/load-balancers/monitor-groups/update.js";
/**
 * update command
 * @generated from apis/overlays/load-balancers.ts
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
	command: "update <monitor-group-id>",
	describe: "Update Monitor Group",
	usage:
		"$0 load-balancers monitor-groups update <monitor-group-id>\n\nModify a configured monitor group.",
	flags: {
		description: {
			kind: "parsed",
			brief: "A short description of the monitor group",
			optional: true,
			parse: String,
		},
		members: {
			kind: "parsed",
			brief:
				'List of monitors in this group. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"enabled": boolean, "monitor_id": string, "monitoring_only": boolean, "must_be_healthy": boolean}].',
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
			placeholder: "monitor-group-id",
			brief: "Monitor group ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "load-balancers monitor-groups update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["description"] === undefined) {
						argv["description"] = await promptForRequiredField(
							"description",
							"A short description of the monitor group"
						);
					}
					if (argv["members"] === undefined) {
						throw new Error(
							"--members is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf load-balancers monitor-groups update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/load_balancers/monitor_groups/${argv["monitor-group-id"] == null ? "<monitor-group-id>" : encodeURIComponent(String(argv["monitor-group-id"]))}`,
						pathParams: {
							"monitor-group-id": String(argv["monitor-group-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										members: parseObjectArray(argv["members"], "members"),
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
							monitor_group_id: argv["monitor-group-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					members: parseObjectArray(argv["members"], "members"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						monitor_group_id: argv["monitor-group-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
