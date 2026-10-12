import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/email-sending.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-sending suppressions edit <suppression-id>\n\nUpdates expiry or advisory note fields without changing legacy internal zone memberships. Scope cannot be changed."
		)
		.positional("suppression-id", {
			type: "string",
			description: "The suppression's identifier.",
			demandOption: true,
		})
		.option("expires-at", {
			type: "string",
			description:
				"New expiry. Send `null` to make the suppression permanent; omit to leave it unchanged.",
		})
		.option("note", {
			type: "string",
			description:
				"Replacement advisory note. Send an empty string to clear it; omit to leave it unchanged.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"patch_publicUpdateSendingSuppression">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <suppression-id>",
	describe: "Update account Email Sending suppression",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending suppressions edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-sending suppressions edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/sending/suppressions/${argv["suppression-id"] == null ? "<suppression-id>" : encodeURIComponent(String(argv["suppression-id"]))}`,
						pathParams: {
							"suppression-id": String(argv["suppression-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										note: resolveFileToken(
											argv["note"] as string | undefined,
											"note",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.emailSending.suppressions.edit({
							...bodyData,
							account_id: accountId,
							suppression_id: argv["suppression-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					note: resolveFileToken(
						argv["note"] as string | undefined,
						"note",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailSending.suppressions.edit({
						...bodyData,
						account_id: accountId,
						suppression_id: argv["suppression-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
