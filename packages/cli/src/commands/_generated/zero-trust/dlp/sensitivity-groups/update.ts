import operation from "../../../_operations/zero-trust/dlp/sensitivity-groups/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <sensitivity-group-id>",
	describe: "Update the attributes of a single sensitivity group.",
	usage:
		"$0 zero-trust dlp sensitivity-groups update <sensitivity-group-id>\n\nUpdates a sensitivity group and its levels.",
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		levels: {
			kind: "parsed",
			brief:
				'The desired final state of levels.\n- `None` (omitted): no level changes.\n- `Some([])`: delete all levels.\n- `Some([...])`: desired final set + order. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [({"description"?: (string | null), "name"?: (string | null)} & {"id"?: (string | null)})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
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
			brief: "Attributes of the sensitivity group to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "sensitivity-group-id",
			brief: "Sensitivity group ID",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp sensitivity-groups update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp sensitivity-groups update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/sensitivity_groups/${argv["sensitivity-group-id"] == null ? "<sensitivity-group-id>" : encodeURIComponent(String(argv["sensitivity-group-id"]))}`,
						pathParams: {
							"sensitivity-group-id": String(
								argv["sensitivity-group-id"] ?? ""
							),
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
										levels: parseObjectArray(argv["levels"], "levels", true),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
							sensitivity_group_id: argv["sensitivity-group-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					levels: parseObjectArray(argv["levels"], "levels", true),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						sensitivity_group_id: argv["sensitivity-group-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
