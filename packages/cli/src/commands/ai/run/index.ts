import { withTelemetry } from "../../../lib/telemetry/index.js";
import { getModelInputSchema } from "./schema.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { SdkRequest } from "#sdk";
import type { Argv, CommandModule } from "yargs";
/**
 * `cf ai run` — run inference on a Workers AI model.
 *
 * Hand-written rather than generated, and a documented exception to the
 * rule that `src/` holds no API knowledge (AGENTS.md, "Critical
 * Invariants"). `/ai/run/{model_name}` takes a different request body for
 * every model, keyed by the path parameter and only knowable at runtime
 * from `/ai/models/schema` — some of it only for entitled accounts — so a
 * generated command can only offer the union of a few models' fields,
 * which is accurate for none of them. `generator/hand-written-overrides.ts`
 * wires this module in place of the
 * generated leaf.
 *
 * The operation accepts the model in the request body and nests the model's
 * own fields under `input`; this command keeps the friendlier positional
 * model plus dynamically generated input flags. `__tests__/ai-run.test.ts`
 * carries a drift guard, since nothing
 * regenerates this command when the spec moves.
 */
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdForHelp,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { NO_LOCAL_EQUIVALENT } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { writeRawOutput } from "#lib/raw-fetch.js";
import { SCHEMA_HELP_TIMEOUT_MS } from "#lib/schema-cache.js";
import {
	assembleBody,
	flagArgNames,
	isFullySupportedJsonSchema,
	missingRequired,
	renderFlagHelp,
	renderPromptQuestion,
	schemaToFlags,
	unknownFlagNames,
	validateJsonSchema,
	validateSupportedJsonSchema,
} from "#lib/schema-flags.js";
import { theme } from "#lib/ui/theme.js";
type Request = SdkRequest<"workers-ai-post-run-generic">;

const MODELS_HINT = "Run `cf ai models list` to see the models you can run.";

/** The positional is cf's; the model's schema never mentions it. */
const OWN_FLAGS = ["model-name", "modelName"];

/**
 * Captured so the handler can reuse yargs' own renderer for the static
 * half of `--help` instead of reimplementing the usage block.
 */
let commandYargs: Argv | undefined;

function builder(yargs: Argv<CommonYargsOptions>) {
	commandYargs = yargs;
	return (
		yargs
			.positional("model-name", {
				type: "string",
				description: "Model ID, e.g. @cf/meta/llama-3.1-8b-instruct",
			})
			.option("body", {
				type: "string",
				description: "Raw JSON request body, or @path to a JSON file",
			})
			.option("dry-run", {
				type: "boolean",
				description: "Validate and show what would happen without executing",
				default: false,
			})
			// The model's schema is the allowlist for input flags, so strict
			// option validation is disabled — the fields aren't known at
			// registration time. See `#lib/schema-flags.js`.
			.strictOptions(false)
			// Yargs renders help before the handler runs, so its built-in help
			// can't include per-model flags. Handled below instead.
			.help(false)
			.option("help", {
				type: "boolean",
				alias: "h",
				description: "Show help, including this model's input flags",
			})
			.epilogue(
				`Input flags depend on the model: run \`cf ai run <model> --help\`.\n${MODELS_HINT}`
			)
	);
}

type Args = InferArgs<typeof builder>;

/**
 * Without a model this must not touch the network, resolve credentials or
 * prompt — help is offline and instant everywhere else in cf. With one,
 * the fetch is best-effort and every failure degrades to static help plus
 * a dim line saying why.
 */
async function showHelp(argv: Args): Promise<void> {
	if (argv.local) {
		console.log(`${NO_LOCAL_EQUIVALENT}\n`);
	}
	commandYargs?.showHelp("log");

	const model = argv["model-name"];
	if (!model || argv.local) {
		return;
	}

	const deadline = Date.now() + SCHEMA_HELP_TIMEOUT_MS;
	const accountId = await resolveAccountIdForHelp(deadline);
	if (!accountId) {
		console.log(
			`\n${theme.muted(`Set \`CLOUDFLARE_ACCOUNT_ID\` or sign in with \`cf auth login\` to see the input flags for ${model}.`)}`
		);
		return;
	}

	const lookup = await getModelInputSchema(
		model,
		accountId,
		() => createCommandClient(argv),
		deadline
	);
	console.log(
		lookup.ok
			? `\n${renderFlagHelp(schemaToFlags(lookup.schema), `Input flags for ${model}`)}`
			: `\n${theme.muted(`Could not load the input flags for ${model}: ${lookup.reason}.`)}`
	);
}

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "run [model-name]",
	describe:
		"Run inference on a Workers AI model. Input flags are model-specific — see `cf ai run <model> --help`",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.help) {
			await showHelp(argv);
			return;
		}
		if (argv.local) {
			throw new Error(NO_LOCAL_EQUIVALENT);
		}

		const model = argv["model-name"];
		if (!model) {
			// The positional is optional so `cf ai run --help` can be answered
			// rather than rejected; requiredness is enforced here.
			throw new Error(`A model is required: cf ai run <model>. ${MODELS_HINT}`);
		}
		const accountId = argv.dryRun
			? ((await resolveAccountIdSilent()) ?? "<account-id>")
			: await getAccountId();
		let body: unknown;
		if (argv.body !== undefined) {
			if (
				unknownFlagNames(argv as Record<string, unknown>, OWN_FLAGS).length > 0
			) {
				throw new Error(
					"--body cannot be combined with model input flags. Pass one or the other."
				);
			}
			body = parseBody(argv.body);
		} else {
			const lookup = await getModelInputSchema(model, accountId, () =>
				createCommandClient(argv)
			);
			if (!lookup.ok) {
				throw new Error(
					`Could not load the input schema for ${model}: ${lookup.reason}.\n` +
						`Pass the request body directly instead: cf ai run ${model} --body '{…}'`
				);
			}
			const descriptors = schemaToFlags(lookup.schema);
			const unknown = unknownFlagNames(argv as Record<string, unknown>, [
				...OWN_FLAGS,
				...flagArgNames(descriptors),
			]);
			if (unknown.length > 0) {
				throw new Error(
					`${unknown.map((name) => `Unknown flag --${name}`).join("\n")}\n\nRun \`cf ai run ${model} --help\` for this model's input flags.`
				);
			}
			const attemptedPrompts = new Set<string>();
			for (;;) {
				// Re-evaluate after every answer: a required selector can activate an
				// `if`/`then` requirement that was not missing before the prompt.
				// Descriptors without a supported prompt type are left for validation,
				// and the attempted set prevents a non-progressing prompt from looping.
				const descriptor = missingRequired(
					descriptors,
					argv as Record<string, unknown>
				).find(
					(candidate) =>
						!attemptedPrompts.has(candidate.name) &&
						(candidate.choices !== undefined || candidate.type === "string")
				);
				if (!descriptor) {
					break;
				}
				attemptedPrompts.add(descriptor.name);
				if (descriptor.choices) {
					argv[descriptor.name] = await promptForRequiredEnumField(
						descriptor.name,
						renderPromptQuestion(descriptor),
						descriptor.choices,
						descriptor.choiceLabels
					);
				} else {
					argv[descriptor.name] = await promptForRequiredField(
						descriptor.name,
						renderPromptQuestion(descriptor)
					);
				}
			}
			const fullySupportedSchema = isFullySupportedJsonSchema(lookup.schema);
			const assembled = assembleBody(
				descriptors,
				argv as Record<string, unknown>,
				{ reserved: OWN_FLAGS }
			);
			const errors =
				assembled.errors.length === 0
					? fullySupportedSchema
						? validateJsonSchema(lookup.schema, assembled.body)
						: validateSupportedJsonSchema(lookup.schema, assembled.body)
					: assembled.errors;
			if (errors.length > 0) {
				throw new Error(
					`${errors.join("\n")}\n\nRun \`cf ai run ${model} --help\` for this model's input flags.`
				);
			}
			body = assembled.body;
		}

		if (argv.dryRun) {
			const requestBody = {
				model,
				input: body as Request["input"],
			} satisfies Omit<Request, "account_id">;
			formatDryRun({
				command: "cf ai run",
				method: "POST",
				url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`,
				pathParams: {},
				bodyKind: "json",
				body: requestBody,
			});
			return;
		}

		const client = await createCommandClient(argv);
		argv.accountId = accountId;
		const result = await withProgress(`Running`, async () =>
			requestApi<Record<string, unknown> | Buffer>(
				client,
				"POST",
				`/accounts/${accountId}/ai/run`,
				{
					body: {
						model,
						input: body as Request["input"],
					} satisfies Omit<Request, "account_id">,
					preserveNonJsonBytes: true,
				}
			)
		);
		if (Buffer.isBuffer(result)) {
			writeRawOutput(result);
			return;
		}
		formatOutput(result, { successLabel: `Ran` });
	},
};

export default withTelemetry(command, {
	command: "ai run",
	recordArgs: false,
});
