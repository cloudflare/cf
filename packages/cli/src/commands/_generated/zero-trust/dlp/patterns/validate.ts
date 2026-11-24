import operation from "../../../_operations/zero-trust/dlp/patterns/validate.js";
/**
 * validate command
 * @generated from apis/overlays/zero-trust.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "validate",
	describe: "Validate a DLP regex pattern",
	usage:
		"$0 zero-trust dlp patterns validate\n\nValidates whether this pattern is a valid regular expression. Rejects it if the regular expression is too complex or can match an unbounded-length string. The regex will be rejected if it uses `*` or `+`. Bound the maximum number of characters that can be matched using a range, e.g. `{1,100}`.",
	flags: {
		"max-match-bytes": {
			kind: "parsed",
			brief:
				"Maximum number of bytes that the regular expression can match.\n\nIf this is `null` then there is no limit on the length. Patterns can use\n`*` and `+`. Otherwise repeats should use a range `{m,n}` to restrict\npatterns to the length. If this field is missing, then a default length\nlimit is used.\n\nNote that the length is specified in bytes. Since regular expressions\nuse UTF-8 the pattern `.` can match up to 4 bytes. Hence `.{1,256}`\nhas a maximum length of 1024 bytes.",
			optional: true,
			parse: Number,
		},
		regex: {
			kind: "parsed",
			brief: "The regex field",
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
			brief: "Validation query.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp patterns validate",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["regex"] === undefined) {
						argv["regex"] = await promptForRequiredField(
							"regex",
							"The regex field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp patterns validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/patterns/validate`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										max_match_bytes: argv["max-match-bytes"],
										regex: resolveFileToken(
											argv["regex"] as string | undefined,
											"regex",
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
					const result = await withProgress(`Validating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Validated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					max_match_bytes: argv["max-match-bytes"],
					regex: resolveFileToken(
						argv["regex"] as string | undefined,
						"regex",
						"text"
					),
				});
				const result = await withProgress(`Validating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Validated` });
			}
		),
});

export default command;
