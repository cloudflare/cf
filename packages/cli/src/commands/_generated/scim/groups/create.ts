/**
 * create command
 * @generated from apis/overlays/scim.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create SCIM Group",
	usage:
		"$0 scim groups create\n\nCreates a new SCIM Group (user group) for the account. The `displayName` must not be empty and must not begin with `CF` (reserved for system groups).",
	flags: {
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "scim groups create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined && argv.file === undefined) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf scim groups create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/scim/v2/Groups`,
						pathParams: {},
						bodyKind: "octet-stream",
						body: argv.file !== undefined ? { file: argv.file } : argv.body,
					});
					return;
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: resolveFileToken(argv.body, "body", "binary");
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/scim/v2/Groups`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/scim+json" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/scim/v2/Groups`,
							{
								body: bodyData,
								headers: { "Content-Type": "application/scim+json" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
			}
		),
});

export default command;
