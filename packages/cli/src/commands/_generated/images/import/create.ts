import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/images.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 images import create\n\nCreate a pending CF Images import from a configured source."
		)
		.option("conflict-behaviour", {
			type: "string",
			description:
				"How to handle objects that already exist at the destination.",
			choices: ["skip", "overwrite"],
			default: "skip",
		})
		.coerce("conflict-behaviour", (value) =>
			resolveFileToken(value, "conflict-behaviour", "text")
		)
		.option("excluded-content-types", {
			type: "string",
			array: true,
			description: "Content types to skip during migration.",
		})
		.option("path-prefix", {
			type: "string",
			description: "Prefix to prepend to image custom IDs.",
		})
		.option("root-directory", {
			type: "string",
			description:
				"Only import objects under this prefix in the source bucket.",
		})
		.option("source-id", {
			type: "string",
			description: "The identifier of the source to migrate from.",
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

type Request = SdkRequest<"cloudflare-images-sourcingkit-create-migration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a sourcing kit migration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images import create",
				classification: {
					safeFlags: ["conflict-behaviour", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images import create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2/sourcingkit/migrations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										conflictBehaviour: argv["conflict-behaviour"],
										excludedContentTypes: argv["excluded-content-types"],
										pathPrefix: resolveFileToken(
											argv["path-prefix"] as string | undefined,
											"path-prefix",
											"text"
										),
										rootDirectory: resolveFileToken(
											argv["root-directory"] as string | undefined,
											"root-directory",
											"text"
										),
										sourceId: resolveFileToken(
											argv["source-id"] as string | undefined,
											"source-id",
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
					const result = await withProgress(`Creating`, async () =>
						client.images.import.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["source-id"] === undefined) {
					argv["source-id"] = await promptForRequiredField(
						"source-id",
						"The identifier of the source to migrate from."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					conflictBehaviour: argv["conflict-behaviour"],
					excludedContentTypes: argv["excluded-content-types"],
					pathPrefix: resolveFileToken(
						argv["path-prefix"] as string | undefined,
						"path-prefix",
						"text"
					),
					rootDirectory: resolveFileToken(
						argv["root-directory"] as string | undefined,
						"root-directory",
						"text"
					),
					sourceId: resolveFileToken(
						argv["source-id"] as string | undefined,
						"source-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.images.import.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
