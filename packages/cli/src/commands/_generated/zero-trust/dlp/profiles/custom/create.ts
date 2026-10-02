import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
			"$0 zero-trust dlp profiles custom create\n\nCreates a DLP custom profile."
		)
		.option("ai-context-enabled", {
			type: "boolean",
			description: "The ai_context_enabled field",
			default: false,
		})
		.option("allowed-match-count", {
			type: "number",
			description:
				"Related DLP policies will trigger when the match count exceeds the number set.",
			default: 0,
		})
		.option("confidence-threshold", {
			type: "string",
			description: "The confidence_threshold field",
			default: "low",
		})
		.option("context-awareness-enabled", {
			type: "boolean",
			description:
				"If true, scan the context of predefined entries to only return matches surrounded by keywords.",
		})
		.option("context-awareness-skip-files", {
			type: "boolean",
			description:
				"If the content type is a file, skip context analysis and return all matches.",
		})
		.option("data-classes", {
			type: "string",
			array: true,
			description: "Data class IDs to associate with the profile.",
		})
		.option("data-tags", {
			type: "string",
			array: true,
			description: "Data tag IDs to associate with the profile.",
		})
		.option("description", {
			type: "string",
			description: "The description of the profile.",
		})
		.option("entries", {
			type: "string",
			description:
				"The entries field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("ocr-enabled", {
			type: "boolean",
			description: "The ocr_enabled field",
			default: false,
		})
		.option("sensitivity-levels", {
			type: "string",
			description:
				"Sensitivity levels to associate with the profile. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("shared-entries", {
			type: "string",
			description:
				"Entries from other profiles (e.g. pre-defined Cloudflare profiles, or your Microsoft Information Protection profiles). Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "A new profile to create.",
		})
		.check((argv) => {
			const groupSet = [
				"context-awareness-enabled",
				"context-awareness-skip-files",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"context-awareness-enabled",
					"context-awareness-skip-files",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --context_awareness-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-profiles-create-custom-profiles">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create custom profile",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp profiles custom create",
				classification: {
					safeFlags: [
						"ai-context-enabled",
						"context-awareness-enabled",
						"context-awareness-skip-files",
						"ocr-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp profiles custom create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/profiles/custom`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ai_context_enabled: argv["ai-context-enabled"],
										allowed_match_count: argv["allowed-match-count"],
										confidence_threshold: resolveFileToken(
											argv["confidence-threshold"] as string | undefined,
											"confidence-threshold",
											"text"
										),
										context_awareness: {
											enabled: argv["context-awareness-enabled"],
											skip: {
												files: argv["context-awareness-skip-files"],
											},
										},
										data_classes: argv["data-classes"],
										data_tags: argv["data-tags"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										entries: parseObjectArray(argv["entries"], "entries"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										ocr_enabled: argv["ocr-enabled"],
										sensitivity_levels: parseObjectArray(
											argv["sensitivity-levels"],
											"sensitivity-levels"
										),
										shared_entries: parseObjectArray(
											argv["shared-entries"],
											"shared-entries"
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
						client.zeroTrust.dlp.profiles.custom.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ai_context_enabled: argv["ai-context-enabled"],
					allowed_match_count: argv["allowed-match-count"],
					confidence_threshold: resolveFileToken(
						argv["confidence-threshold"] as string | undefined,
						"confidence-threshold",
						"text"
					),
					context_awareness: {
						enabled: argv["context-awareness-enabled"],
						skip: {
							files: argv["context-awareness-skip-files"],
						},
					},
					data_classes: argv["data-classes"],
					data_tags: argv["data-tags"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					entries: parseObjectArray(argv["entries"], "entries"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					ocr_enabled: argv["ocr-enabled"],
					sensitivity_levels: parseObjectArray(
						argv["sensitivity-levels"],
						"sensitivity-levels"
					),
					shared_entries: parseObjectArray(
						argv["shared-entries"],
						"shared-entries"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.dlp.profiles.custom.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
