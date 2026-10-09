import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/turnstile.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 turnstile widgets create\n\nCreates a Turnstile widget for an account."
		)
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page.",
		})
		.option("order", {
			type: "string",
			description: "Field to order widgets by.",
			choices: ["id", "sitekey", "name", "created_on", "modified_on"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order widgets.",
			choices: ["asc", "desc"],
		})
		.option("filter", {
			type: "string",
			description:
				"Filter widgets by field. The `name` field uses case-insensitive\nsubstring matching; `sitekey` uses exact matching.\nFormat: `field:value`\n\nSupported fields:\n- `name` - Filter by widget name (e.g., `filter=name:login-form`)\n- `sitekey` - Filter by sitekey (e.g., `filter=sitekey:0x4AAA`)\n\nReturns 400 Bad Request if the field is unsupported or format is invalid.\nAn empty filter value returns all results.",
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
		.coerce("clearance-level", (value: string | undefined) =>
			resolveFileToken(value, "clearance-level", "text")
		)
		.option("domains", {
			type: "string",
			array: true,
			description: "The domains field",
		})
		.option("ephemeral-id", {
			type: "boolean",
			description: "Return the Ephemeral ID in /siteverify (ENT only).\n",
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
			default: "world",
		})
		.coerce("region", (value: string | undefined) =>
			resolveFileToken(value, "region", "text")
		)
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

type Request = SdkRequest<"accounts-turnstile-widget-create">;
type Body = Request;
type Query = SdkQuery<"accounts-turnstile-widget-create">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a Turnstile Widget",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "turnstile widgets create",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"bot-fight-mode",
						"clearance-level",
						"ephemeral-id",
						"offlabel",
						"region",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					filter: argv["filter"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf turnstile widgets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/challenges/widgets`,
						pathParams: {},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bot_fight_mode: argv["bot-fight-mode"],
										clearance_level: argv["clearance-level"],
										domains: argv["domains"],
										ephemeral_id: argv["ephemeral-id"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										offlabel: argv["offlabel"],
										region: argv["region"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.turnstile.widgets.create({
							...bodyData,
							account_id: accountId,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["domains"] === undefined) {
					throw new Error(
						"--domains is required (or pass --body with this field set)."
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
					clearance_level: argv["clearance-level"],
					domains: argv["domains"],
					ephemeral_id: argv["ephemeral-id"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					offlabel: argv["offlabel"],
					region: argv["region"],
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.turnstile.widgets.create({
						...bodyData,
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
