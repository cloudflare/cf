import operation from "../../../../_operations/zero-trust/dlp/email/rules/bulk-edit.js";
/**
 * bulk-edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "bulk-edit",
	describe: "Update email scanner rule priorities",
	usage:
		"$0 zero-trust dlp email rules bulk-edit\n\nReorders DLP email scanning rules by updating their priority values. Higher priority rules are evaluated first.",
	flags: {
		"new-priorities": {
			kind: "parsed",
			brief:
				'The new_priorities field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": number}.',
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
			brief: "Rule priorities.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp email rules bulk-edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["new-priorities"] === undefined) {
						throw new Error(
							"--new-priorities is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp email rules bulk-edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/rules`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [
										{ path: ["new_priorities"], flag: "new-priorities" },
									])
								: compactBody(
										{
											new_priorities: parseJsonMap(
												argv["new-priorities"],
												"new-priorities",
												true
											),
										},
										[["new_priorities"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? parseBody(argv.body, [
								{ path: ["new_priorities"], flag: "new-priorities" },
							])
						: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						new_priorities: parseJsonMap(
							argv["new-priorities"],
							"new-priorities",
							true
						),
					},
					[["new_priorities"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
