import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 turnstile widgets update <sitekey>\n\nUpdates the configuration of a Turnstile widget."
		)
		.positional("sitekey", {
			type: "string",
			description: "Unique identifier for a Turnstile widget.",
			demandOption: true,
		})
		.option("bot-fight-mode", {
			type: "boolean",
			description:
				"If bot_fight_mode is set to `true`, Cloudflare issues computationally\nexpensive challenges in response to malicious bots (ENT only).\n",
		})
		.option("clearance-level", {
			type: "string",
			description:
				"If Turnstile is embedded on a Cloudflare site and the widget should grant challenge clearance,\nthis setting can determine the clearance level to be set\n",
			choices: ["no_clearance", "jschallenge", "managed", "interactive"],
		})
		.option("domains", {
			type: "string",
			array: true,
			description: "The domains field",
		})
		.option("ephemeral-id", {
			type: "boolean",
			description: "Return the Ephemeral ID in /siteverify (ENT only).\n",
		})
		.option("widget-mode", {
			type: "string",
			description: "Widget Mode",
			choices: ["non-interactive", "invisible", "managed"],
		})
		.option("name", {
			type: "string",
			description:
				"Human readable widget name. Not unique. Cloudflare suggests that you\nset this to a meaningful string to make it easier to identify your\nwidget, and where it is used.\n",
		})
		.option("offlabel", {
			type: "boolean",
			description:
				"Do not show any Cloudflare branding on the widget (ENT only).\n",
		})
		.option("region", {
			type: "string",
			description:
				"Region where this widget can be used. This cannot be changed after creation.\n",
			choices: ["world", "china"],
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

type Request = SdkRequest<"accounts-turnstile-widget-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <sitekey>",
	describe: "Update a Turnstile Widget",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "turnstile widgets update",
				classification: {
					safeFlags: [
						"bot-fight-mode",
						"clearance-level",
						"ephemeral-id",
						"widget-mode",
						"offlabel",
						"region",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf turnstile widgets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/challenges/widgets/${argv["sitekey"] == null ? "<sitekey>" : encodeURIComponent(String(argv["sitekey"]))}`,
						pathParams: { sitekey: String(argv["sitekey"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bot_fight_mode: argv["bot-fight-mode"],
										clearance_level: resolveFileToken(
											argv["clearance-level"] as string | undefined,
											"clearance-level",
											"text"
										),
										domains: argv["domains"],
										ephemeral_id: argv["ephemeral-id"],
										mode: resolveFileToken(
											argv["widget-mode"] as string | undefined,
											"widget-mode",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										offlabel: argv["offlabel"],
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
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
						client.turnstile.widgets.update({
							...bodyData,
							account_id: accountId,
							sitekey: argv["sitekey"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["domains"] === undefined) {
					throw new Error(
						"--domains is required (or pass --body with this field set)."
					);
				}
				if (argv["widget-mode"] === undefined) {
					argv["widget-mode"] = await promptForRequiredEnumField(
						"widget-mode",
						"Widget Mode",
						["non-interactive", "invisible", "managed"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Human readable widget name. Not unique. Cloudflare suggests that you set this to a meaningful string to make it easier to identify your widget, and where it is used. "
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					bot_fight_mode: argv["bot-fight-mode"],
					clearance_level: resolveFileToken(
						argv["clearance-level"] as string | undefined,
						"clearance-level",
						"text"
					),
					domains: argv["domains"],
					ephemeral_id: argv["ephemeral-id"],
					mode: resolveFileToken(
						argv["widget-mode"] as string | undefined,
						"widget-mode",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					offlabel: argv["offlabel"],
					region: resolveFileToken(
						argv["region"] as string | undefined,
						"region",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.turnstile.widgets.update({
						...bodyData,
						account_id: accountId,
						sitekey: argv["sitekey"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
