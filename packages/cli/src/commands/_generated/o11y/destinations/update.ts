import operation from "../../_operations/o11y/destinations/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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
			"$0 o11y destinations update <slug>\n\nUpdate an existing Workers Observability Telemetry Destination."
		)
		.positional("slug", {
			type: "string",
			description: "Slug",
			demandOption: true,
		})
		.option("configuration-headers", {
			type: "string",
			description:
				"The configuration.headers field. Provide as a JSON object or @path/to/file.json.",
		})
		.option("configuration-type", {
			type: "string",
			description: "The configuration.type field",
			choices: ["logpush"],
		})
		.coerce("configuration-type", (value) =>
			resolveFileToken(value, "configuration-type", "text")
		)
		.option("configuration-url", {
			type: "string",
			description: "The configuration.url field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <slug>",
	describe: "Update Destination",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y destinations update",
				classification: {
					safeFlags: ["configuration-type", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y destinations update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/destinations/${argv["slug"] == null ? "<slug>" : encodeURIComponent(String(argv["slug"]))}`,
						pathParams: { slug: String(argv["slug"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [
										{
											path: ["configuration", "headers"],
											flag: "configuration-headers",
										},
									])
								: compactBody(
										{
											configuration: {
												headers: parseJsonMap(
													argv["configuration-headers"],
													"configuration-headers",
													true
												),
												type: argv["configuration-type"],
												url: resolveFileToken(
													argv["configuration-url"] as string | undefined,
													"configuration-url",
													"text"
												),
											},
											enabled: argv["enabled"],
										},
										[["configuration", "headers"]]
									),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body, [
						{
							path: ["configuration", "headers"],
							flag: "configuration-headers",
						},
					]);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							slug: argv["slug"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["configuration-headers"] === undefined) {
					throw new Error(
						"--configuration-headers is required (or pass --body with this field set)."
					);
				}
				if (argv["configuration-type"] === undefined) {
					argv["configuration-type"] = await promptForRequiredEnumField(
						"configuration-type",
						"The configuration.type field",
						["logpush"] as const
					);
				}
				if (argv["configuration-url"] === undefined) {
					argv["configuration-url"] = await promptForRequiredField(
						"configuration-url",
						"The configuration.url field"
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						configuration: {
							headers: parseJsonMap(
								argv["configuration-headers"],
								"configuration-headers",
								true
							),
							type: argv["configuration-type"],
							url: resolveFileToken(
								argv["configuration-url"] as string | undefined,
								"configuration-url",
								"text"
							),
						},
						enabled: argv["enabled"],
					},
					[["configuration", "headers"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						slug: argv["slug"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
