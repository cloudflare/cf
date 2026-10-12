import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * rotate-secret command
 * @generated from apis/overlays/turnstile.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 turnstile widgets rotate-secret <sitekey>\n\nGenerates a new secret key for this widget. If `invalidate_immediately` is set to `false`, the previous secret remains valid for 2 hours. Note that secrets cannot be rotated again during the grace period."
		)
		.positional("sitekey", {
			type: "string",
			description: "Unique identifier for a Turnstile widget.",
			demandOption: true,
		})
		.option("invalidate-immediately", {
			type: "boolean",
			description:
				"If `invalidate_immediately` is set to `false`, the previous secret will\nremain valid for two hours. Otherwise, the secret is immediately\ninvalidated, and requests using it will be rejected.\n",
			default: false,
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

type Request = SdkRequest<"accounts-turnstile-widget-rotate-secret">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "rotate-secret <sitekey>",
	describe: "Rotate Secret for a Turnstile Widget",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "turnstile widgets rotate-secret",
				classification: {
					safeFlags: ["invalidate-immediately", "dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.turnstile.widgets.rotateSecret({
							...bodyData,
							account_id: accountId,
							sitekey: argv["sitekey"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					invalidate_immediately: argv["invalidate-immediately"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.turnstile.widgets.rotateSecret({
						...bodyData,
						account_id: accountId,
						sitekey: argv["sitekey"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
