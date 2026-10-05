import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/cps.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cps update\n\nSet one or more communication preferences for the authenticated user. Supply a map of preference keys to subscription states, and an optional language locale. This endpoint does not modify email verification settings. Callers authenticate with standard Cloudflare API tokens or keys."
		)
		.option("language-locale", {
			type: "string",
			description:
				"The user's preferred language locale for communications. If omitted, the language locale does not change.",
			choices: [
				"en-US",
				"es-ES",
				"de-DE",
				"fr-FR",
				"it-IT",
				"ja-JP",
				"ko-KR",
				"pt-BR",
				"zh-CN",
				"zh-TW",
			],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for updating communication preferences. An email field in the payload is ignored; email verification state is managed separately, so the field is excluded from this schema.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"user-communication-preferences-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update communication preferences",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cps update",
				classification: {
					safeFlags: ["language-locale", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cps update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/user/communication_preferences`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										"language-locale": resolveFileToken(
											argv["language-locale"] as string | undefined,
											"language-locale",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.cps.update({ ...bodyData } satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					"language-locale": resolveFileToken(
						argv["language-locale"] as string | undefined,
						"language-locale",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cps.update({ ...bodyData } satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
