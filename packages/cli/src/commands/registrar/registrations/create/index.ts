import { withTelemetry } from "../../../../lib/telemetry/index.js";
import {
	requireRegistrationAvailability,
	type RegistrationPricing,
} from "./availability.js";
import { resolveRegistrationSchema } from "./extension.js";
import { renderRegistrationReview } from "./review.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { FlagDescriptor, JsonSchema } from "#lib/schema-flags.js";
import type { Argv, CommandModule } from "yargs";
/**
 * Hand-written because registration fields come from a per-extension schema
 * outside the OpenAPI spec.
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
import { resolveFileToken } from "#lib/input-validation.js";
import { NO_LOCAL_EQUIVALENT } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	confirmDelete,
	promptForAcknowledgement,
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { SCHEMA_HELP_TIMEOUT_MS } from "#lib/schema-cache.js";
import {
	assembleBody,
	isFullySupportedJsonSchema,
	missingRequired,
	missingRequiredFromBody,
	renderFlagHelp,
	renderPromptQuestion,
	sanitizeTerminalText,
	schemaToFlags,
	validateFlagValue,
	validateJsonSchema,
} from "#lib/schema-flags.js";
import { theme } from "#lib/ui/theme.js";

/** The domain is cf's positional, not a schema-derived flag. */
const DOMAIN_FIELD = ["domain_name"];
const DOMAIN_QUESTION =
	"Fully qualified domain name to register, e.g. example.travel";

/** Flags this command owns, so they're never read as body fields. */
const OWN_FLAGS = [
	"domain-name",
	"domainName",
	"extension",
	"force",
	"f",
	"prefer",
	"contacts",
];

const CHECK_HINT =
	"cf rechecks availability and pricing before confirmation. Run `cf registrar registrations check --domains <domain>` to inspect them separately.";

interface RegistrationRequirement {
	path: string;
	flag: string;
	question: string;
	description?: string;
	choices?: Array<{ value: string | number | boolean; label: string }>;
	requiredValue?: unknown;
	acknowledgementText?: string;
}

function jsonPointer(path: readonly string[]): string {
	return `/${path
		.map((segment) => segment.replace(/~/g, "~0").replace(/\//g, "~1"))
		.join("/")}`;
}

function hasProvidedFieldBelow(
	root: string,
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>
): boolean {
	return descriptors.some((descriptor) => {
		if (descriptor.path[0] !== root || descriptor.path.length === 1) {
			return false;
		}
		const camelName = descriptor.name.replace(
			/-([a-z0-9])/g,
			(_, character: string) => character.toUpperCase()
		);
		return (
			(Object.hasOwn(argv, descriptor.name) &&
				argv[descriptor.name] !== undefined) ||
			(Object.hasOwn(argv, camelName) && argv[camelName] !== undefined)
		);
	});
}

function typedChoices(
	descriptor: FlagDescriptor
): Array<string | number | boolean> | undefined {
	if (descriptor.choices === undefined) {
		return undefined;
	}
	const values =
		descriptor.schema.enum ??
		(descriptor.schema.oneOf ?? descriptor.schema.anyOf)?.flatMap((variant) =>
			variant.const !== undefined ? [variant.const] : (variant.enum ?? [])
		);
	const scalarValues = values?.filter(
		(value): value is string | number | boolean =>
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
	);
	return scalarValues?.length === descriptor.choices.length
		? scalarValues
		: undefined;
}

function registrationRequirement(
	descriptor: FlagDescriptor
): RegistrationRequirement {
	const acknowledgement =
		descriptor.type === "boolean" && descriptor.schema.const === true;
	const description = descriptor.schema.description;
	const displayDescription =
		description === undefined ? undefined : sanitizeTerminalText(description);
	return {
		path: jsonPointer(descriptor.path),
		flag: `--${descriptor.name}`,
		question: renderPromptQuestion(descriptor),
		description: displayDescription,
		choices: typedChoices(descriptor)?.map((value) => {
			const wireValue = String(value);
			const label =
				descriptor.choiceLabels !== undefined &&
				Object.hasOwn(descriptor.choiceLabels, wireValue)
					? (descriptor.choiceLabels[wireValue] ?? wireValue)
					: wireValue;
			return { value, label: sanitizeTerminalText(label) };
		}),
		requiredValue: descriptor.schema.const,
		acknowledgementText: acknowledgement ? displayDescription : undefined,
	};
}

function reportMissingRegistrationInput(
	domain: string,
	extension: string,
	descriptors: readonly FlagDescriptor[],
	body: Record<string, unknown>,
	validationErrors: string[]
): boolean {
	const missing = missingRequiredFromBody(descriptors, body);
	if (missing.length === 0) {
		return false;
	}
	formatOutput({
		submitted: false,
		reason: "registration_input_required",
		message: "Not submitted. Additional registration input is required.",
		domainName: domain,
		extension,
		missingFields: missing.map(registrationRequirement),
		validationErrors,
	});
	return true;
}

function parseDecimal(
	value: string
): { units: bigint; scale: number } | undefined {
	const match = /^(\d+)(?:\.(\d+))?$/.exec(value);
	if (!match) {
		return undefined;
	}
	const fraction = match[2] ?? "";
	return {
		units: BigInt(`${match[1]}${fraction}`),
		scale: fraction.length,
	};
}

/** First year uses registration cost; later years use the annual renewal cost. */
function totalRegistrationCost(
	pricing: RegistrationPricing,
	years: number
): string | undefined {
	const registration = parseDecimal(pricing.registration_cost);
	const renewal = parseDecimal(pricing.renewal_cost);
	if (!registration || !renewal) {
		return undefined;
	}
	const scale = Math.max(registration.scale, renewal.scale);
	const multiplier = (decimals: number): bigint => 10n ** BigInt(decimals);
	const registrationUnits =
		registration.units * multiplier(scale - registration.scale);
	const renewalUnits = renewal.units * multiplier(scale - renewal.scale);
	const total = registrationUnits + renewalUnits * BigInt(years - 1);
	if (scale === 0) {
		return total.toString();
	}
	const divisor = multiplier(scale);
	return `${total / divisor}.${(total % divisor).toString().padStart(scale, "0")}`;
}

function formatRegistrationQuote(
	pricing: RegistrationPricing,
	years: number
): string {
	const total = totalRegistrationCost(pricing, years);
	if (!total || !/^[A-Z]{3}$/.test(pricing.currency)) {
		throw new Error(
			"The availability check returned invalid pricing, so cf cannot safely confirm this registration."
		);
	}
	return `${pricing.currency} ${total}`;
}

interface PropertySchemaVariants {
	found: boolean;
	bundles: JsonSchema[][];
}

function crossPropertySchemaBundles(
	left: JsonSchema[][],
	right: JsonSchema[][]
): JsonSchema[][] {
	return left.flatMap((leftBundle) =>
		right.map((rightBundle) => [...leftBundle, ...rightBundle])
	);
}

/** Preserve alternatives while collecting each conjunctive property variant. */
function findPropertySchemaVariants(
	schema: JsonSchema,
	property: string,
	body: Record<string, unknown>,
	matchingAlternativesOnly = false,
	candidateValues: readonly unknown[] = []
): PropertySchemaVariants {
	const direct = schema.properties?.[property];
	let found = direct !== undefined;
	let bundles: JsonSchema[][] = [direct === undefined ? [] : [direct]];

	const activeConsequent =
		schema.if &&
		schema.then &&
		isFullySupportedJsonSchema(schema.if) &&
		validateJsonSchema(schema.if, body).length === 0
			? [schema.then]
			: [];
	for (const clause of [...(schema.allOf ?? []), ...activeConsequent]) {
		const nested = findPropertySchemaVariants(
			clause,
			property,
			body,
			matchingAlternativesOnly,
			candidateValues
		);
		if (nested.found) {
			found = true;
			bundles = crossPropertySchemaBundles(bundles, nested.bundles);
		}
	}

	for (const alternatives of [schema.oneOf, schema.anyOf]) {
		if (!alternatives?.length) {
			continue;
		}
		const matchingAlternatives =
			matchingAlternativesOnly && alternatives.every(isFullySupportedJsonSchema)
				? alternatives.filter((clause) =>
						alternativeMatchesWithProperty(
							clause,
							property,
							body,
							candidateValues
						)
					)
				: [];
		const selectedAlternatives =
			matchingAlternatives.length > 0 ? matchingAlternatives : alternatives;
		const branches = selectedAlternatives.map((clause) =>
			findPropertySchemaVariants(
				clause,
				property,
				body,
				matchingAlternativesOnly,
				candidateValues
			)
		);
		if (!branches.some((branch) => branch.found)) {
			continue;
		}
		found = true;
		bundles = crossPropertySchemaBundles(
			bundles,
			branches.flatMap((branch) => branch.bundles)
		);
	}

	return { found, bundles };
}

function conjunctiveKeywordValues(
	schema: JsonSchema,
	keyword: "const" | "default"
): unknown[] {
	const direct = schema[keyword];
	return [
		...(direct === undefined ? [] : [direct]),
		...(schema.allOf ?? []).flatMap((clause) =>
			conjunctiveKeywordValues(clause, keyword)
		),
	];
}

function combineConjunctiveSchemas(schemas: JsonSchema[]): JsonSchema {
	return schemas.length === 0
		? {}
		: schemas.length === 1
			? (schemas[0] ?? {})
			: { allOf: schemas };
}

type RegistrationTermCandidate =
	| { found: true; value: unknown }
	| { found: false };

function minimumRegistrationTerm(schema: JsonSchema): number | undefined {
	const minimums = [
		...(typeof schema.minimum === "number"
			? [
					schema.exclusiveMinimum === true
						? Math.floor(schema.minimum) + 1
						: Math.ceil(schema.minimum),
				]
			: []),
		...(typeof schema.exclusiveMinimum === "number"
			? [Math.floor(schema.exclusiveMinimum) + 1]
			: []),
		...(schema.allOf ?? []).flatMap((clause) => {
			const minimum = minimumRegistrationTerm(clause);
			return minimum === undefined ? [] : [minimum];
		}),
	];
	return minimums.length > 0 ? Math.max(1, ...minimums) : undefined;
}

function registrationTermCandidate(
	schema: JsonSchema
): RegistrationTermCandidate {
	const constants = conjunctiveKeywordValues(schema, "const");
	if (constants.length > 0) {
		return constants.every((value) => Object.is(value, constants[0]))
			? { found: true, value: constants[0] }
			: { found: false };
	}
	const defaults = conjunctiveKeywordValues(schema, "default");
	if (defaults.length > 0) {
		return defaults.every((value) => Object.is(value, defaults[0]))
			? { found: true, value: defaults[0] }
			: { found: false };
	}
	const minimum = minimumRegistrationTerm(schema);
	return minimum === undefined
		? { found: false }
		: { found: true, value: minimum };
}

function expandRegistrationTermAlternatives(schema: JsonSchema): JsonSchema[] {
	const { allOf, anyOf, oneOf, ...direct } = schema;
	let bundles: JsonSchema[][] = [
		Object.keys(direct).length === 0 ? [] : [direct],
	];
	for (const clause of allOf ?? []) {
		bundles = crossPropertySchemaBundles(
			bundles,
			expandRegistrationTermAlternatives(clause).map((variant) => [variant])
		);
	}
	for (const alternatives of [oneOf, anyOf]) {
		if (!alternatives?.length) {
			continue;
		}
		bundles = crossPropertySchemaBundles(
			bundles,
			alternatives.flatMap((alternative) =>
				expandRegistrationTermAlternatives(alternative).map((variant) => [
					variant,
				])
			)
		);
	}
	return bundles.map(combineConjunctiveSchemas);
}

interface RegistrationTermPair {
	schema: JsonSchema;
	candidate: RegistrationTermCandidate;
}

function registrationTermPairs(
	schemas: readonly JsonSchema[]
): RegistrationTermPair[] {
	return schemas.flatMap((schema) =>
		expandRegistrationTermAlternatives(schema).map((candidateSchema) => ({
			schema,
			candidate: registrationTermCandidate(candidateSchema),
		}))
	);
}

function alternativeMatchesWithProperty(
	schema: JsonSchema,
	property: string,
	body: Record<string, unknown>,
	candidates: readonly unknown[]
): boolean {
	const currentErrors = validateJsonSchema(schema, body);
	if (Object.hasOwn(body, property) || currentErrors.length === 0) {
		return currentErrors.length === 0;
	}
	return candidates.some(
		(candidate) =>
			validateJsonSchema(schema, {
				...body,
				[property]: candidate,
			}).length === 0
	);
}

/**
 * Resolve the exact term the API will receive from this extension's schema.
 * Sending the resolved default keeps the reviewed quote and submitted request
 * identical, including for extensions whose minimum is more than one year.
 */
function resolveRegistrationTerm(
	body: Record<string, unknown>,
	schema: JsonSchema
): number {
	const supplied = Object.hasOwn(body, "years");
	const unfilteredVariants = findPropertySchemaVariants(
		schema,
		"years",
		body,
		false
	);
	if (!unfilteredVariants.found) {
		throw new Error(
			"The extension schema returned no registration-term field, so cf cannot safely confirm this registration."
		);
	}
	const unfilteredSchemas = unfilteredVariants.bundles.map(
		combineConjunctiveSchemas
	);
	const candidatePool = supplied
		? []
		: registrationTermPairs(unfilteredSchemas).flatMap(
				({ schema: termSchema, candidate }) =>
					candidate.found &&
					validateJsonSchema(termSchema, candidate.value).length === 0
						? [candidate.value]
						: []
			);
	const variants = findPropertySchemaVariants(
		schema,
		"years",
		body,
		true,
		candidatePool
	);
	if (
		!variants.found ||
		(supplied && variants.bundles.some((bundle) => bundle.length === 0))
	) {
		throw new Error(
			"The extension schema returned no registration-term field, so cf cannot safely confirm this registration."
		);
	}
	const variantSchemas = variants.bundles.map(combineConjunctiveSchemas);
	let declaringSchemas = variantSchemas;
	let invalidDefaultError: string | undefined;

	let years: unknown;
	if (supplied) {
		years = body.years;
	} else {
		let viable = registrationTermPairs(variantSchemas).filter(
			({ schema: termSchema, candidate }) => {
				if (!candidate.found) {
					return true;
				}
				const [error] = validateJsonSchema(termSchema, candidate.value);
				if (error === undefined) {
					return true;
				}
				invalidDefaultError ??= error;
				return false;
			}
		);
		if (isFullySupportedJsonSchema(schema)) {
			const blockers = viable.filter(({ candidate }) => !candidate.found);
			const fullyValid = viable.filter(
				({ candidate }) =>
					candidate.found &&
					validateJsonSchema(schema, {
						...body,
						years: candidate.value,
					}).length === 0
			);
			if (fullyValid.length > 0) {
				viable = [...blockers, ...fullyValid];
			}
		}
		declaringSchemas = viable.map(({ schema: termSchema }) => termSchema);
		const candidates = viable.map(({ candidate }) => candidate);
		const [candidate] = candidates;
		years =
			candidate?.found === true &&
			candidates.every(
				(value) => value.found && Object.is(value.value, candidate.value)
			)
				? candidate.value
				: undefined;
	}
	if (typeof years !== "number" || !Number.isInteger(years) || years <= 0) {
		if (!supplied && declaringSchemas.length === 0 && invalidDefaultError) {
			throw new Error(
				`The extension schema returned an invalid default registration term: ${invalidDefaultError}`
			);
		}
		throw new Error(
			supplied
				? "The requested registration term must be a positive whole number of years."
				: "The extension schema returned no safe default registration term, so cf cannot safely confirm this registration."
		);
	}
	const errors = supplied
		? validateJsonSchema(
				variantSchemas.length === 1
					? (variantSchemas[0] ?? {})
					: { anyOf: variantSchemas },
				years
			)
		: declaringSchemas.flatMap((variant) => validateJsonSchema(variant, years));
	if (errors.length > 0) {
		throw new Error(
			supplied
				? `The requested registration term is invalid: ${errors[0]}`
				: `The extension schema returned an invalid default registration term: ${errors[0]}`
		);
	}

	body.years = years;
	return years;
}

/** Captured so the handler can reuse yargs' own renderer for static help. */
let commandYargs: Argv | undefined;

function resolveDomain(value: string | undefined): string | undefined {
	const resolved = resolveFileToken(value, "domain-name", "text");
	if (resolved !== undefined && typeof resolved !== "string") {
		throw new Error("--domain-name must be a string");
	}
	return resolved;
}

function builder(yargs: Argv<CommonYargsOptions>) {
	commandYargs = yargs;
	return (
		yargs
			.positional("domain-name", {
				type: "string",
				description: "Fully qualified domain name, e.g. example.travel",
			})
			.option("extension", {
				type: "string",
				description:
					"Extension whose registration schema to use (default: derived from the domain)",
			})
			.option("prefer", {
				type: "string",
				description:
					"Set the Prefer header, e.g. `respond-async` to skip the synchronous wait",
			})
			.option("force", {
				type: "boolean",
				alias: "f",
				description: "Skip the registration confirmation prompt",
				default: false,
			})
			.option("contacts", {
				type: "string",
				description:
					"Registrant contacts as inline JSON or @path to a reusable JSON file",
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
			// The extension's schema is the allowlist for input flags. Keep the
			// inherited strict command/positional validation, though: this is a
			// billable operation and must reject surplus positional arguments.
			.strictOptions(false)
			// Yargs renders help before the handler runs, so its built-in help
			// can't include per-extension flags. Handled below instead.
			.help(false)
			.option("help", {
				type: "boolean",
				alias: "h",
				description: "Show help, including this extension's input flags",
			})
			.epilogue(
				`Input flags depend on the extension: run \`cf registrar registrations create <domain> --help\`.\n${CHECK_HINT}`
			)
	);
}

type Args = InferArgs<typeof builder>;

/**
 * Without a domain this must not touch the network, resolve credentials or
 * prompt. With one, the fetch is best-effort and degrades to static help
 * plus a dim line saying why the fields are missing.
 */
async function showHelp(argv: Args): Promise<void> {
	commandYargs?.showHelp("log");

	const domain = resolveDomain(argv["domain-name"]);
	if (!domain) {
		return;
	}
	const displayDomain = sanitizeTerminalText(domain);
	if (argv.local) {
		console.log(
			`\n${theme.muted(`Registration fields are unavailable in local mode.`)}`
		);
		return;
	}

	const deadline = Date.now() + SCHEMA_HELP_TIMEOUT_MS;
	const accountId = await resolveAccountIdForHelp(deadline);
	if (!accountId) {
		console.log(
			`\n${theme.muted(`Set \`CLOUDFLARE_ACCOUNT_ID\` or sign in with \`cf auth login\` to see the registration fields for ${displayDomain}.`)}`
		);
		return;
	}

	const lookup = await resolveRegistrationSchema(
		domain,
		argv.extension,
		accountId,
		() => createCommandClient(argv),
		deadline
	);
	console.log(
		lookup.ok
			? `\n${renderFlagHelp(schemaToFlags(lookup.schema, { exclude: [DOMAIN_FIELD] }), `Registration fields for .${lookup.extension}`)}`
			: `\n${theme.muted(`Could not load the registration fields for ${displayDomain}: ${sanitizeTerminalText(lookup.reason)}.`)}`
	);
}

/** Fill in required fields until the form is complete or cancelled. */
async function promptForMissing(
	descriptors: readonly FlagDescriptor[],
	argv: Record<string, unknown>,
	baseBody?: Record<string, unknown>
): Promise<boolean> {
	// Re-evaluate after every pass: one answer can activate an `if`/`then`
	// requirement such as .uk's company number for company registrants.
	for (;;) {
		const missing = missingRequired(descriptors, argv, baseBody);
		if (missing.length === 0) {
			return true;
		}
		for (const descriptor of missing) {
			const description = descriptor.description ?? "";
			const question = renderPromptQuestion(descriptor);
			if (descriptor.type === "boolean" && descriptor.schema.const === true) {
				// The acknowledgement idiom: the schema's description is the text
				// the registry requires the registrant to agree to.
				const acknowledgement = sanitizeTerminalText(
					descriptor.schema.description ?? description
				);
				if (
					!(await promptForAcknowledgement(descriptor.name, acknowledgement))
				) {
					return false;
				}
				argv[descriptor.name] = true;
			} else if (descriptor.choices?.length) {
				argv[descriptor.name] = await promptForRequiredEnumField(
					descriptor.name,
					question,
					descriptor.choices,
					descriptor.choiceLabels
				);
			} else {
				argv[descriptor.name] = await promptForRequiredField(
					descriptor.name,
					question,
					{ validate: (value) => validateFlagValue(descriptor, value) }
				);
			}
		}
	}
}

function parseRegistrationBody(value: string): Record<string, unknown> {
	const body = parseBody(value);
	if (body === null || typeof body !== "object" || Array.isArray(body)) {
		throw new Error("--body must contain a JSON object");
	}
	return body as Record<string, unknown>;
}

function parseContacts(value: string): Record<string, unknown> {
	let contacts: unknown;
	if (value.startsWith("@")) {
		contacts = resolveFileToken(value, "contacts", "json");
	} else {
		try {
			contacts = JSON.parse(value) as unknown;
		} catch {
			throw new Error(
				"--contacts must contain a JSON object or @path to a JSON file"
			);
		}
	}
	if (
		contacts === null ||
		typeof contacts !== "object" ||
		Array.isArray(contacts)
	) {
		throw new Error(
			"--contacts must contain a JSON object or @path to a JSON file"
		);
	}
	return contacts as Record<string, unknown>;
}

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create [domain-name]",
	describe:
		"Register a domain. Billable and non-refundable — input fields are extension-specific, see `create <domain> --help`",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.help) {
			await showHelp(argv);
			return;
		}
		if (argv.local) {
			throw new Error(NO_LOCAL_EQUIVALENT);
		}

		const headers: Record<string, string> = {};
		if (argv.prefer !== undefined) {
			headers.Prefer = String(argv.prefer);
		}

		let body: Record<string, unknown> | undefined;
		if (argv.body !== undefined) {
			const strayFlags = assembleBody([], argv as Record<string, unknown>, {
				reserved: OWN_FLAGS,
			}).errors.some((error) => error.startsWith("Unknown flag"));
			if (argv.contacts !== undefined || strayFlags) {
				throw new Error(
					"--body cannot be combined with registration field flags. Pass one or the other."
				);
			}
			body = parseRegistrationBody(argv.body);
		}
		const contacts =
			argv.contacts === undefined ? undefined : parseContacts(argv.contacts);

		const positionalDomain = resolveDomain(argv["domain-name"]);
		const bodyDomain = body?.domain_name;
		if (bodyDomain !== undefined && typeof bodyDomain !== "string") {
			throw new Error("--body field domain_name must be a string");
		}
		if (
			positionalDomain !== undefined &&
			bodyDomain !== undefined &&
			positionalDomain !== bodyDomain
		) {
			throw new Error(
				`The positional domain '${sanitizeTerminalText(positionalDomain)}' does not match --body domain_name '${sanitizeTerminalText(bodyDomain)}'`
			);
		}
		let domain = positionalDomain ?? bodyDomain;
		if (!domain) {
			if (body !== undefined) {
				formatOutput({
					submitted: false,
					reason: "registration_input_required",
					message:
						"Not submitted. A domain is required to determine the registration schema.",
					missingFields: [
						{
							path: "/domain_name",
							flag: "--domain-name",
							question: DOMAIN_QUESTION,
						},
					],
					validationErrors: ["`/domain_name` is required"],
				});
				return;
			}
			domain = await promptForRequiredField("domain-name", DOMAIN_QUESTION);
		}
		const displayDomain = sanitizeTerminalText(domain);
		if (body) {
			body.domain_name = domain;
		}

		const accountId = argv.dryRun
			? ((await resolveAccountIdSilent()) ?? "<account-id>")
			: await getAccountId();
		let client: Awaited<ReturnType<typeof createCommandClient>> | undefined;
		const getClient = async (): Promise<
			Awaited<ReturnType<typeof createCommandClient>>
		> => {
			if (!client) {
				client = await createCommandClient(argv);
			}
			return client;
		};
		if (!argv.dryRun) {
			await requireRegistrationAvailability(
				await getClient(),
				accountId,
				domain
			);
		}

		// The schema owns the extension-specific term as well as the form, so
		// load it for --body and dry-run input too. Without it cf cannot know
		// that, for example, .ai defaults to two years.
		const lookup = await resolveRegistrationSchema(
			domain,
			argv.extension,
			accountId,
			getClient
		);
		if (!lookup.ok) {
			throw new Error(
				`Could not load the registration schema for ${displayDomain}: ${sanitizeTerminalText(lookup.reason)}.`
			);
		}
		const displayExtension = sanitizeTerminalText(lookup.extension);
		const registrationSchema = lookup.schema;
		const descriptors = schemaToFlags(lookup.schema, {
			exclude: [DOMAIN_FIELD],
		});
		if (!body) {
			if (
				contacts !== undefined &&
				hasProvidedFieldBelow(
					"contacts",
					descriptors,
					argv as Record<string, unknown>
				)
			) {
				throw new Error(
					"--contacts cannot be combined with --contacts-* fields. Pass one or the other."
				);
			}
			const formArgv = { ...argv } as Record<string, unknown>;
			const baseBody = contacts === undefined ? undefined : { contacts };
			if (baseBody !== undefined) {
				delete formArgv.contacts;
			}
			if (!(await promptForMissing(descriptors, formArgv, baseBody))) {
				return;
			}
			const assembled = assembleBody(descriptors, formArgv, {
				reserved: OWN_FLAGS,
				baseBody,
			});
			if (assembled.errors.length > 0) {
				throw new Error(
					`${assembled.errors.join("\n")}\n\nRun \`cf registrar registrations create ${displayDomain} --help\` for .${displayExtension}'s registration fields.`
				);
			}
			// The domain is cf's positional, so it's excluded from the schema's
			// flags and put back here.
			body = { domain_name: domain, ...assembled.body };
		}

		let years: number;
		try {
			years = resolveRegistrationTerm(body, registrationSchema);
		} catch (error) {
			const errors = validateJsonSchema(registrationSchema, body);
			if (
				reportMissingRegistrationInput(
					domain,
					lookup.extension,
					descriptors,
					body,
					errors
				)
			) {
				return;
			}
			throw error;
		}
		const errors = validateJsonSchema(registrationSchema, body);
		if (
			reportMissingRegistrationInput(
				domain,
				lookup.extension,
				descriptors,
				body,
				errors
			)
		) {
			return;
		}
		if (errors.length > 0) {
			throw new Error(
				`${errors.join("\n")}\n\nRun \`cf registrar registrations create ${displayDomain} --help\` for this extension's registration fields.`
			);
		}

		if (argv.dryRun) {
			formatDryRun({
				command: "cf registrar registrations create",
				method: "POST",
				url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/registrar/registrations`,
				pathParams: {},
				bodyKind: "json",
				body,
			});
			return;
		}

		// Schema lookup and input collection follow the early gate and can take
		// arbitrarily long. Refresh availability immediately before quoting.
		const registrationPricing = await requireRegistrationAvailability(
			await getClient(),
			accountId,
			domain
		);
		const quotedCost = formatRegistrationQuote(registrationPricing, years);
		if (!argv.force) {
			process.stderr.write(
				`${renderRegistrationReview({
					domain,
					accountId,
					years,
					quotedCost,
					pricing: registrationPricing,
					body,
					schema: registrationSchema,
					descriptors,
				})}\n`
			);
		}

		// Registration charges the account's default payment method and is
		// non-refundable once it succeeds, so it gets the same treatment as a
		// destructive operation. `confirmDelete` is cf's generic
		// confirm-unless-`--force` primitive — the one forge's
		// `x-forge-require-confirmation` uses.
		const confirmed = await confirmDelete({
			force: argv.force,
			message: `Registering ${displayDomain} for ${years} ${years === 1 ? "year" : "years"} costs ${quotedCost}, charges the account's default payment method, and cannot be refunded.`,
		});
		if (!confirmed) {
			return;
		}
		if (body.years !== years) {
			throw new Error(
				"The registration term changed after confirmation, so cf will not submit this registration."
			);
		}
		const confirmedPricing = await requireRegistrationAvailability(
			await getClient(),
			accountId,
			domain
		);
		if (
			confirmedPricing.currency !== registrationPricing.currency ||
			confirmedPricing.registration_cost !==
				registrationPricing.registration_cost ||
			confirmedPricing.renewal_cost !== registrationPricing.renewal_cost
		) {
			throw new Error(
				"Availability or pricing changed while awaiting confirmation, so cf will not submit this registration. Re-run the command to review the current quote."
			);
		}

		const registrationClient = await getClient();
		argv.accountId = accountId;
		const result = await withProgress(`Registering`, async () =>
			requestApi<unknown>(
				registrationClient,
				"POST",
				`/accounts/${accountId}/registrar/registrations`,
				{
					body,
					headers: Object.keys(headers).length > 0 ? headers : undefined,
				}
			)
		);
		formatOutput(result, { successLabel: `Registered ${displayDomain}` });
	},
};

export default withTelemetry(command, {
	command: "registrar registrations create",
	recordArgs: false,
});
