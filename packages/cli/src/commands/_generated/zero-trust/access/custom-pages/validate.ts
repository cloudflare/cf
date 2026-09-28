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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * validate command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access custom-pages validate\n\nValidate a Liquid template and return its errors and warnings without persisting it."
		)
		.option("template", {
			type: "string",
			description: "The Liquid template to validate.",
		})
		.option("type", {
			type: "string",
			description: "Custom page type.",
			choices: ["identity_denied", "forbidden", "login", "interstitial"],
		})
		.option("version", {
			type: "number",
			description: "Contract version to validate against; omit for the latest.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "A template to validate without persisting it.",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"access-custom-pages-validate-a-custom-page-template">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "validate",
	describe: "Validate a custom page template",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access custom-pages validate",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access custom-pages validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/custom_pages/validate`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										template: resolveFileToken(
											argv["template"] as string | undefined,
											"template",
											"text"
										),
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
										version: argv["version"],
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
						client.zeroTrust.access.customPages.validate({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["template"] === undefined) {
					argv["template"] = await promptForRequiredField(
						"template",
						"The Liquid template to validate."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Custom page type.",
						["identity_denied", "forbidden", "login", "interstitial"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					template: resolveFileToken(
						argv["template"] as string | undefined,
						"template",
						"text"
					),
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
					version: argv["version"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.access.customPages.validate({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
