import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/custom-pages.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 custom-pages account-custom-pages preview-tokens create\n\nCreates a signed JWT for previewing an account or zone-level custom page before it is published."
		)
		.option("act", {
			type: "string",
			description:
				'The preview action type. Required for request parsing but not used in token generation. Typically set to "preview".',
		})
		.option("target", {
			type: "string",
			description:
				'The target custom page type to preview (e.g. "block:waf"). Encoded as the "endpoint" claim in the resulting JWT.',
		})
		.option("url", {
			type: "string",
			description:
				'The URL of the custom page content to preview. Encoded as the "zone" claim in the resulting JWT.',
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

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/custom_pages/preview_tokens">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a preview token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-pages account-custom-pages preview-tokens create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command:
							"cf custom-pages account-custom-pages preview-tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/custom_pages/preview_tokens`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										act: resolveFileToken(
											argv["act"] as string | undefined,
											"act",
											"text"
										),
										target: resolveFileToken(
											argv["target"] as string | undefined,
											"target",
											"text"
										),
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.customPages.accountCustomPages.previewTokens.create({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["act"] === undefined) {
					argv["act"] = await promptForRequiredField(
						"act",
						'The preview action type. Required for request parsing but not used in token generation. Typically set to "preview".'
					);
				}
				if (argv["target"] === undefined) {
					argv["target"] = await promptForRequiredField(
						"target",
						'The target custom page type to preview (e.g. "block:waf"). Encoded as the "endpoint" claim in the resulting JWT.'
					);
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField(
						"url",
						'The URL of the custom page content to preview. Encoded as the "zone" claim in the resulting JWT.'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					act: resolveFileToken(
						argv["act"] as string | undefined,
						"act",
						"text"
					),
					target: resolveFileToken(
						argv["target"] as string | undefined,
						"target",
						"text"
					),
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.customPages.accountCustomPages.previewTokens.create({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
