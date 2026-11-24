import operation from "../../_operations/turnstile/widgets/rotate-secret.js";
/**
 * rotate-secret command
 * @generated from apis/overlays/turnstile.ts
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "rotate-secret <sitekey>",
	describe: "Rotate Secret for a Turnstile Widget",
	usage:
		"$0 turnstile widgets rotate-secret <sitekey>\n\nGenerates a new secret key for this widget. If `invalidate_immediately` is set to `false`, the previous secret remains valid for 2 hours. Note that secrets cannot be rotated again during the grace period.",
	flags: {
		"invalidate-immediately": {
			kind: "boolean",
			brief:
				"If `invalidate_immediately` is set to `false`, the previous secret will\nremain valid for two hours. Otherwise, the secret is immediately\ninvalidated, and requests using it will be rejected.\n",
			default: false,
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
			placeholder: "sitekey",
			brief: "Unique identifier for a Turnstile widget.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "turnstile widgets rotate-secret",
				classification: {
					safeFlags: ["invalidate-immediately", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf turnstile widgets rotate-secret",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/challenges/widgets/${argv["sitekey"] == null ? "<sitekey>" : encodeURIComponent(String(argv["sitekey"]))}/rotate_secret`,
						pathParams: { sitekey: String(argv["sitekey"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										invalidate_immediately: argv["invalidate-immediately"],
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
							sitekey: argv["sitekey"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					invalidate_immediately: argv["invalidate-immediately"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						sitekey: argv["sitekey"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
