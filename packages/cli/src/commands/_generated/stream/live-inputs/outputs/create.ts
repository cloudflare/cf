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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 stream live-inputs outputs create <live-input-identifier>\n\nCreates a new output that can be used to simulcast or restream live video to other RTMP or SRT destinations. Outputs are always linked to a specific live input — one live input can have many outputs."
		)
		.positional("live-input-identifier", {
			type: "string",
			description: "A unique identifier for a live input.",
			demandOption: true,
		})
		.option("enabled", {
			type: "boolean",
			description:
				"When enabled, live video streamed to the associated live input will be sent to the output URL. When disabled, live video will not be sent to the output URL, even when streaming to the associated live input. Use this to control precisely when you start and stop simulcasting to specific destinations like YouTube and Twitch.",
			default: true,
		})
		.option("stream-key", {
			type: "string",
			description:
				"The streamKey used to authenticate against an output's target.",
		})
		.option("url", {
			type: "string",
			description: "The URL an output uses to restream.",
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
	SdkRequest<"stream-live-inputs-create-a-new-output,-connected-to-a-live-input">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <live-input-identifier>",
	describe: "Create a new output, connected to a live input",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream live-inputs outputs create",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream live-inputs outputs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs/${argv["live-input-identifier"] == null ? "<live-input-identifier>" : encodeURIComponent(String(argv["live-input-identifier"]))}/outputs`,
						pathParams: {
							"live-input-identifier": String(
								argv["live-input-identifier"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										streamKey: resolveFileToken(
											argv["stream-key"] as string | undefined,
											"stream-key",
											"text"
										),
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
									}),
						sensitiveBodyPaths: [["streamKey"], ["url"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.stream.liveInputs.outputs.create({
							...bodyData,
							account_id: accountId,
							live_input_identifier: argv["live-input-identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["stream-key"] === undefined) {
					argv["stream-key"] = await promptForRequiredField(
						"stream-key",
						"The streamKey used to authenticate against an output's target.",
						{ kind: "secret" }
					);
				}
				if (argv["url"] === undefined) {
					argv["url"] = await promptForRequiredField(
						"url",
						"The URL an output uses to restream.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enabled: argv["enabled"],
					streamKey: resolveFileToken(
						argv["stream-key"] as string | undefined,
						"stream-key",
						"text"
					),
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.stream.liveInputs.outputs.create({
						...bodyData,
						account_id: accountId,
						live_input_identifier: argv["live-input-identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
