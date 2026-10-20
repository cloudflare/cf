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
		.option("configuration-replace-headers", {
			type: "boolean",
			description: "The configuration.replaceHeaders field",
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
		})
		.check((argv) => {
			const groupSet = [
				"configuration-headers",
				"configuration-replace-headers",
				"configuration-type",
				"configuration-url",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"configuration-headers",
					"configuration-type",
					"configuration-url",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --configuration-* flag is set`
					);
				}
			}
			return true;
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
					safeFlags: [
						"configuration-replace-headers",
						"configuration-type",
						"enabled",
						"dry-run",
					],
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
								? parseBody(argv.body)
								: compactBody(
										{
											configuration: {
												headers: parseJsonMap(
													argv["configuration-headers"],
													"configuration-headers"
												),
												replaceHeaders: argv["configuration-replace-headers"],
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
					const bodyData = parseBody(argv.body);
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
								"configuration-headers"
							),
							replaceHeaders: argv["configuration-replace-headers"],
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
