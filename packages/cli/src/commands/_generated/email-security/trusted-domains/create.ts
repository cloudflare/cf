import operation from "../../_operations/email-security/trusted-domains/create.js";
/**
 * create command
 * @generated from apis/overlays/email-security.ts
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
	command: "create",
	describe: "Create trusted email domain",
	usage:
		"$0 email-security trusted-domains create\n\nCreates a new trusted domain pattern. Use for partner domains or approved senders that should bypass recent domain registration and similarity checks. Configure whether it prevents recent domain or spoof dispositions.",
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		"is-recent": {
			kind: "boolean",
			brief:
				"Select to prevent recently registered domains from triggering a Suspicious or Malicious disposition.",
			optional: true,
		},
		"is-regex": {
			kind: "boolean",
			brief:
				"Whether `pattern` is a regular expression instead of a literal domain.",
			optional: true,
		},
		"is-similarity": {
			kind: "boolean",
			brief:
				"Select for partner or other approved domains that have similar spelling to your connected domains. Prevents listed domains from triggering a Spoof disposition.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief: "The domain pattern to trust, e.g. `example.com`.",
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
			brief: "Create a trusted domain.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security trusted-domains create",
				classification: {
					safeFlags: ["is-recent", "is-regex", "is-similarity", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["is-recent"] === undefined) {
						throw new Error(
							"--is-recent is required (or pass --body with this field set)."
						);
					}
					if (argv["is-regex"] === undefined) {
						throw new Error(
							"--is-regex is required (or pass --body with this field set)."
						);
					}
					if (argv["is-similarity"] === undefined) {
						throw new Error(
							"--is-similarity is required (or pass --body with this field set)."
						);
					}
					if (argv["pattern"] === undefined) {
						argv["pattern"] = await promptForRequiredField(
							"pattern",
							"The domain pattern to trust, e.g. \`example.com\`."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security trusted-domains create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/trusted_domains`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comments: resolveFileToken(
											argv["comments"] as string | undefined,
											"comments",
											"text"
										),
										is_recent: argv["is-recent"],
										is_regex: argv["is-regex"],
										is_similarity: argv["is-similarity"],
										pattern: resolveFileToken(
											argv["pattern"] as string | undefined,
											"pattern",
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					is_recent: argv["is-recent"],
					is_regex: argv["is-regex"],
					is_similarity: argv["is-similarity"],
					pattern: resolveFileToken(
						argv["pattern"] as string | undefined,
						"pattern",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
