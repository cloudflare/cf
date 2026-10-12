import { readFileSync, writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	extensionCandidates,
	resolveRegistrationSchema,
} from "../../commands/registrar/registrations/create/extension.js";
import { writeCachedSchema } from "../../lib/schema-cache.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
// These integration tests need the real client. Collect its cold import graph
// before per-test timers start; lightweight tests must not inherit this import.
import "../../lib/auth.js";
import type { Cloudflare } from "../../lib/auth.js";
import type * as PromptModule from "../../lib/prompt.js";

const promptForAcknowledgementMock = vi.hoisted(() => vi.fn());
const promptForRequiredFieldMock = vi.hoisted(() => vi.fn());
const confirmDeleteMock = vi.hoisted(() => vi.fn());
vi.mock("#lib/prompt.js", async (importOriginal) => {
	const original = await importOriginal<typeof PromptModule>();
	return {
		...original,
		confirmDelete: confirmDeleteMock,
		promptForAcknowledgement: promptForAcknowledgementMock,
		promptForRequiredField: (
			...args: Parameters<typeof original.promptForRequiredField>
		) => {
			promptForRequiredFieldMock(...args);
			return original.promptForRequiredField(...args);
		},
	};
});

/**
 * `cf registrar registrations create` is hand-written for the same reason
 * `cf ai run` is: the real request body is described by a JSON Schema
 * behind a sibling endpoint. The shared machinery is covered by
 * `ai-run.test.ts`, so this file concentrates on what's specific to
 * registrar — deriving the extension from the domain, nested fields,
 * `const: true` acknowledgements, the schema's own constraints, and the
 * confirmation gate on a billable operation.
 */

const DOMAIN = "example.travel";

/** Trimmed shape of a real `.travel` registration schema. */
const REGISTRATION_SCHEMA = {
	type: "object",
	required: ["domain_name", "acknowledgements"],
	properties: {
		domain_name: { type: "string", minLength: 1 },
		years: { type: "integer", minimum: 1, maximum: 10, default: 1 },
		privacy_mode: {
			type: "string",
			enum: ["off", "redaction"],
			default: "redaction",
		},
		contacts: {
			type: "object",
			required: ["registrant"],
			properties: {
				registrant: {
					type: "object",
					required: ["email", "phone", "postal_info"],
					properties: {
						email: { type: "string", description: "Registrant email" },
						phone: {
							type: "string",
							pattern: "^\\+[0-9]+\\.[0-9]+$",
							description: "E.164 phone",
						},
						postal_info: {
							type: "object",
							required: ["name"],
							properties: {
								name: { type: "string", description: "Full legal name" },
								organization: { type: "string" },
							},
						},
					},
				},
			},
		},
		acknowledgements: {
			type: "object",
			required: ["travel_industry"],
			properties: {
				travel_industry: {
					type: "boolean",
					const: true,
					description:
						"I am engaged in or plan to engage in activities related to travel.\nI understand that the registry may verify this claim.",
				},
			},
		},
		optional_acknowledgement: {
			type: "boolean",
			const: true,
			description: "An optional acknowledgement",
		},
	},
};

/** The live `.ai` schema uses a two-year default and minimum. */
const MULTI_YEAR_REGISTRATION_SCHEMA = {
	...REGISTRATION_SCHEMA,
	properties: {
		...REGISTRATION_SCHEMA.properties,
		years: { type: "integer", minimum: 2, maximum: 10, default: 2 },
	},
};

/** A TLD which can use the account's default contact without extra input. */
const NO_FORM_REGISTRATION_SCHEMA = {
	type: "object",
	required: ["domain_name"],
	properties: {
		domain_name: { type: "string", minLength: 1 },
		years: { type: "integer", minimum: 1, maximum: 10, default: 1 },
		privacy_mode: {
			type: "string",
			enum: ["off", "redaction"],
			default: "redaction",
		},
	},
};

/** The choice and conditional-requirement shapes returned for `.uk`. */
const UK_REGISTRATION_SCHEMA = {
	type: "object",
	required: ["domain_name", "contact_extensions"],
	properties: {
		domain_name: {
			type: "string",
			pattern: "^([a-z0-9-]+\\.)+[a-z]{2,}$",
		},
		years: { type: "integer", minimum: 1, maximum: 10, default: 1 },
		contact_extensions: {
			type: "object",
			required: ["registrant_type"],
			properties: {
				registrant_type: {
					title: "Registrant Type",
					oneOf: [
						{ type: "string", const: "LTD", title: "UK Limited Company" },
						{
							type: "string",
							const: "IND",
							title: "UK Individual (representing self)",
						},
					],
				},
				company_number: { type: "string" },
			},
			allOf: [
				{
					if: {
						required: ["registrant_type"],
						properties: { registrant_type: { enum: ["LTD"] } },
					},
					// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
					then: { required: ["company_number"] },
				},
			],
		},
	},
};

/** Choice and acknowledgement data an agent must collect for `.ca`. */
const CA_REGISTRATION_SCHEMA = {
	type: "object",
	required: ["domain_name", "contact_extensions", "acknowledgements"],
	properties: {
		domain_name: { type: "string" },
		years: { type: "integer", minimum: 1, maximum: 10, default: 1 },
		contact_extensions: {
			type: "object",
			required: ["ca_legal_type"],
			properties: {
				ca_legal_type: {
					title: "Canadian Legal Type",
					description: "Identifies the registrant's Canadian legal type",
					oneOf: [
						{
							type: "string",
							const: "CCT",
							title: "Canadian Citizen",
						},
						{
							type: "string",
							const: "CCO",
							title: "Canadian Corporation",
						},
					],
				},
			},
		},
		acknowledgements: {
			type: "object",
			required: ["cira_agreement"],
			properties: {
				cira_agreement: {
					type: "boolean",
					const: true,
					description:
						"I certify that the registrant satisfies the CIRA presence requirements.",
				},
			},
		},
	},
};

/** A complete set of registration fields, as CLI flags. */
const REQUIRED = [
	"--contacts-registrant-email",
	"owner@example.com",
	"--contacts-registrant-phone",
	"+1.5555555555",
	"--contacts-registrant-postal-info-name",
	"Ada Lovelace",
	"--acknowledgements-travel-industry",
];
const REQUIRED_CONTACTS = REQUIRED.slice(0, -1);

describe("cf registrar registrations create", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCT = `${TEST_BASE_URL}/accounts/test-account`;

	let output: ReturnType<typeof captureOutput>;
	let extensionRequests: string[];
	let registrations: unknown[];
	let availabilityChecks: unknown[];

	beforeEach(() => {
		output = captureOutput();
		extensionRequests = [];
		registrations = [];
		availabilityChecks = [];
		server.use(domainCheckHandler());
		confirmDeleteMock.mockReset();
		confirmDeleteMock.mockImplementation(
			async (
				options: { force?: boolean; message?: string } = {}
			): Promise<boolean> => {
				if (options.force) {
					return true;
				}
				process.stderr.write(`? ${options.message} Continue?\n`);
				return false;
			}
		);
		promptForAcknowledgementMock.mockReset();
		promptForAcknowledgementMock.mockResolvedValue(true);
		promptForRequiredFieldMock.mockClear();
	});

	afterEach(() => vi.restoreAllMocks());

	const stdout = () => output.stdout();
	const stderr = () => output.stderr();
	function create(...args: string[]) {
		return runCf(["registrar", "registrations", "create", ...args], ENV);
	}

	/**
	 * Extension endpoint. `known` is the set that exists; everything else
	 * 404s, which is how the candidate walk narrows a multi-label suffix.
	 */
	function extensionHandler(
		known: string[] = ["travel"],
		registrationSchema: unknown = REGISTRATION_SCHEMA
	) {
		return http.get(`${ACCT}/registrar/extensions/:name`, ({ params }) => {
			const name = String(params.name);
			extensionRequests.push(name);
			return known.includes(name)
				? HttpResponse.json({
						success: true,
						errors: [],
						result: {
							metadata: { name, tld: name },
							registration_schema: registrationSchema,
						},
					})
				: HttpResponse.json(
						{ success: false, errors: [{ code: 1003, message: "not found" }] },
						{ status: 404 }
					);
		});
	}

	function registrationHandler() {
		return http.post(`${ACCT}/registrar/registrations`, async ({ request }) => {
			registrations.push(await request.json());
			return HttpResponse.json({
				success: true,
				errors: [],
				result: { domain_name: DOMAIN, state: "succeeded" },
			});
		});
	}

	type DomainCheckResult = {
		name?: string;
		registrable: unknown;
		reason?: string;
		tier?: string;
		pricing?: {
			currency: string;
			registration_cost: string;
			renewal_cost: string;
		};
	};

	function domainCheckHandler(
		resultOrResults: DomainCheckResult | DomainCheckResult[] = {
			registrable: true,
			pricing: {
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
		}
	) {
		const results = Array.isArray(resultOrResults)
			? resultOrResults
			: [resultOrResults];
		let resultIndex = 0;
		return http.post(`${ACCT}/registrar/domain-check`, async ({ request }) => {
			const body = (await request.json()) as { domains: string[] };
			availabilityChecks.push(body);
			const result = results[Math.min(resultIndex, results.length - 1)];
			resultIndex++;
			return HttpResponse.json({
				success: true,
				errors: [],
				result: {
					domains: [{ name: body.domains[0], tier: "standard", ...result }],
				},
			});
		});
	}

	it("registers using the extension's own nested fields", async () => {
		server.use(extensionHandler(), registrationHandler());

		const { exitCode } = await create(
			DOMAIN,
			...REQUIRED,
			"--years",
			"2",
			"--force"
		);

		expect(exitCode).toBe(0);
		expect(extensionRequests).toEqual(["travel"]);
		expect(availabilityChecks).toEqual([
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
		]);
		expect(registrations).toEqual([
			{
				domain_name: DOMAIN,
				years: 2,
				contacts: {
					registrant: {
						email: "owner@example.com",
						phone: "+1.5555555555",
						postal_info: { name: "Ada Lovelace" },
					},
				},
				acknowledgements: { travel_industry: true },
			},
		]);
	});

	it("requires the acknowledgement the extension declares", async () => {
		server.use(extensionHandler());
		promptForAcknowledgementMock.mockRejectedValue(
			new Error(
				"--acknowledgements-travel-industry is required and must be true"
			)
		);

		await expect(
			create(DOMAIN, ...REQUIRED.slice(0, 6), "--force")
		).rejects.toThrow(/--acknowledgements-travel-industry is required/);
		expect(registrations).toEqual([]);
	});

	it("shows the complete registry acknowledgement before accepting it", async () => {
		server.use(extensionHandler(), registrationHandler());

		await create(DOMAIN, ...REQUIRED.slice(0, 6), "--force");

		expect(promptForAcknowledgementMock).toHaveBeenCalledWith(
			"acknowledgements-travel-industry",
			"I am engaged in or plan to engage in activities related to travel. I understand that the registry may verify this claim."
		);
		expect(registrations).toHaveLength(1);
	});

	it("does not require fields beneath optional objects or optional constants", async () => {
		server.use(extensionHandler(), registrationHandler());

		const { exitCode } = await create(
			DOMAIN,
			"--acknowledgements-travel-industry",
			"--force"
		);

		expect(exitCode).toBe(0);
		expect(registrations).toEqual([
			{
				domain_name: DOMAIN,
				years: 1,
				acknowledgements: { travel_industry: true },
			},
		]);
	});

	it("requires an optional object's required fields once it is supplied", async () => {
		server.use(extensionHandler());

		await expect(
			create(
				DOMAIN,
				"--contacts-registrant-email",
				"owner@example.com",
				"--acknowledgements-travel-industry",
				"--force"
			)
		).rejects.toThrow(/--contacts-registrant-phone is required/);
		expect(registrations).toEqual([]);
	});

	it("rejects a valueless dynamic string flag before registration", async () => {
		server.use(extensionHandler(), registrationHandler());

		await expect(
			create(
				DOMAIN,
				"--contacts-registrant-email",
				"--contacts-registrant-phone",
				"+1.5555555555",
				"--contacts-registrant-postal-info-name",
				"Ada Lovelace",
				"--acknowledgements-travel-industry",
				"--force"
			)
		).rejects.toThrow(
			/--contacts-registrant-email expects a string \(got 'true'\)/
		);
		expect(registrations).toEqual([]);
	});

	it("enforces the schema's pattern, bounds and enum", async () => {
		server.use(extensionHandler());

		await expect(
			create(
				DOMAIN,
				...REQUIRED,
				"--contacts-registrant-phone",
				"555-5555",
				"--force"
			)
		).rejects.toThrow(/--contacts-registrant-phone does not match/);
		await expect(
			create(DOMAIN, ...REQUIRED, "--years", "25", "--force")
		).rejects.toThrow(/--years must be at most 10/);
		await expect(
			create(DOMAIN, ...REQUIRED, "--years", "1.5", "--force")
		).rejects.toThrow(/--years expects an integer/);
		await expect(
			create(DOMAIN, ...REQUIRED, "--privacy-mode", "maximum", "--force")
		).rejects.toThrow(/--privacy-mode must be one of: off, redaction/);
	});

	it("validates .uk choices and conditional fields before registration", async () => {
		server.use(
			extensionHandler(["uk"], UK_REGISTRATION_SCHEMA),
			registrationHandler()
		);

		await expect(
			create(
				"example.uk",
				"--contact-extensions-registrant-type",
				"LTD",
				"--force"
			)
		).rejects.toThrow(/--contact-extensions-company-number is required/);
		expect(registrations).toEqual([]);

		const { exitCode } = await create(
			"example.uk",
			"--contact-extensions-registrant-type",
			"IND",
			"--force"
		);
		expect(exitCode).toBe(0);
		expect(registrations).toEqual([
			{
				domain_name: "example.uk",
				years: 1,
				contact_extensions: { registrant_type: "IND" },
			},
		]);
	});

	it("rejects a field the extension doesn't declare", async () => {
		server.use(extensionHandler());

		await expect(
			create(DOMAIN, ...REQUIRED, "--vat-number", "GB123", "--force")
		).rejects.toThrow(/Unknown flag --vat-number/);
	});

	it("rejects extra positional arguments before making a request", async () => {
		server.use(extensionHandler(), registrationHandler());

		await expect(create(DOMAIN, "unintended", "--force")).rejects.toThrow(
			/Unknown command: unintended/
		);
		expect(extensionRequests).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("walks candidate suffixes, and honours --extension", async () => {
		server.use(extensionHandler(["co.uk", "travel"]), registrationHandler());

		await create("example.co.uk", ...REQUIRED, "--force");
		// Longest candidate first, so `co.uk` wins before `uk` is tried.
		expect(extensionRequests).toEqual(["co.uk"]);

		await create(
			"example.wedding",
			"--extension",
			"travel",
			...REQUIRED,
			"--force"
		);
		expect(extensionRequests).toEqual(["co.uk", "travel"]);
	});

	it("preserves @file ingestion for the legacy --domain-name flag", async () => {
		writeFileSync("domain.txt", DOMAIN);
		server.use(extensionHandler(), registrationHandler());

		const { exitCode } = await create(
			"--domain-name",
			"@domain.txt",
			...REQUIRED,
			"--force"
		);

		expect(exitCode).toBe(0);
		expect(registrations).toHaveLength(1);
		expect(registrations[0]).toMatchObject({ domain_name: DOMAIN });
	});

	it("uses the SDK's normal request policy outside help", async () => {
		const get = vi.fn().mockResolvedValue({
			registration_schema: REGISTRATION_SCHEMA,
		});
		const client = {
			registrar: { extensions: { get } },
		} as unknown as Cloudflare;

		await expect(
			resolveRegistrationSchema(
				"example.normal-policy",
				"normal-policy",
				"normal-policy-account",
				async () => client
			)
		).resolves.toMatchObject({ ok: true, extension: "normal-policy" });
		expect(get).toHaveBeenCalledWith({
			account_id: "normal-policy-account",
			extension: "normal-policy",
		});
	});

	it("checks a longer uncached suffix before a shorter cached suffix", async () => {
		writeCachedSchema(
			"registrar-extension-schema",
			["test-account", "test"],
			REGISTRATION_SCHEMA
		);
		server.use(extensionHandler(["co.test"]), registrationHandler());

		await create("example.co.test", ...REQUIRED, "--force");

		expect(extensionRequests).toEqual(["co.test"]);
	});

	it("fails safely when no schema can be loaded", async () => {
		server.use(extensionHandler([]));

		await expect(create("example.nope", "--force")).rejects.toThrow(
			/Could not load the registration schema/
		);
		expect(registrations).toEqual([]);
	});

	it("derives the domain from --body and validates it against the schema", async () => {
		server.use(extensionHandler(), registrationHandler());

		const { exitCode } = await create(
			"--body",
			JSON.stringify({
				domain_name: DOMAIN,
				years: 1,
				acknowledgements: { travel_industry: true },
			}),
			"--force"
		);

		expect(exitCode).toBe(0);
		expect(extensionRequests).toEqual(["travel"]);
		expect(registrations).toEqual([
			{
				domain_name: DOMAIN,
				years: 1,
				acknowledgements: { travel_industry: true },
			},
		]);
	});

	it("reports a missing raw-body domain without prompting in a TTY", async () => {
		const originalStdinIsTTY = process.stdin.isTTY;
		const originalStdoutIsTTY = process.stdout.isTTY;
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: true,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: true,
		});

		try {
			const { exitCode } = await create("--body", "{}");

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toEqual({
				submitted: false,
				reason: "registration_input_required",
				message:
					"Not submitted. A domain is required to determine the registration schema.",
				missingFields: [
					{
						path: "/domain_name",
						flag: "--domain-name",
						question:
							"Fully qualified domain name to register, e.g. example.travel",
					},
				],
				validationErrors: ["`/domain_name` is required"],
			});
			expect(promptForRequiredFieldMock).not.toHaveBeenCalled();
			expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
			expect(confirmDeleteMock).not.toHaveBeenCalled();
			expect(availabilityChecks).toEqual([]);
			expect(extensionRequests).toEqual([]);
			expect(registrations).toEqual([]);
		} finally {
			Object.defineProperty(process.stdin, "isTTY", {
				configurable: true,
				value: originalStdinIsTTY,
			});
			Object.defineProperty(process.stdout, "isTTY", {
				configurable: true,
				value: originalStdoutIsTTY,
			});
		}
	});

	it("uses a positional domain omitted from a raw body", async () => {
		server.use(extensionHandler(["travel"], NO_FORM_REGISTRATION_SCHEMA));

		const { exitCode } = await create(DOMAIN, "--body", "{}", "--dry-run");

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: DOMAIN, years: 1 },
		});
		expect(promptForRequiredFieldMock).not.toHaveBeenCalled();
		expect(extensionRequests).toEqual(["travel"]);
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("loads reusable registrant contacts from --contacts @file", async () => {
		writeFileSync(
			"contacts.json",
			JSON.stringify({
				registrant: {
					email: "@owner",
					phone: "+1.5555555555",
					postal_info: { name: "Ada Lovelace" },
				},
			})
		);
		server.use(extensionHandler());

		const { exitCode } = await create(
			DOMAIN,
			"--contacts",
			"@contacts.json",
			"--acknowledgements-travel-industry",
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: {
				domain_name: DOMAIN,
				years: 1,
				contacts: {
					registrant: {
						email: "@owner",
						phone: "+1.5555555555",
						postal_info: { name: "Ada Lovelace" },
					},
				},
			},
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("preserves opaque fields from reusable registrant contacts", async () => {
		server.use(extensionHandler(), registrationHandler());

		const { exitCode } = await create(
			DOMAIN,
			"--contacts",
			JSON.stringify({
				registrant: {
					email: "owner@example.com",
					phone: "+1.5555555555",
					postal_info: {
						name: "Ada Lovelace",
						registry_localized_name: "Ada",
					},
					registry_contact_id: "contact-123",
				},
				registry_metadata: { source: "account-defaults" },
			}),
			"--acknowledgements-travel-industry",
			"--force"
		);

		expect(exitCode).toBe(0);
		expect(registrations).toEqual([
			{
				domain_name: DOMAIN,
				years: 1,
				contacts: {
					registrant: {
						email: "owner@example.com",
						phone: "+1.5555555555",
						postal_info: {
							name: "Ada Lovelace",
							registry_localized_name: "Ada",
						},
						registry_contact_id: "contact-123",
					},
					registry_metadata: { source: "account-defaults" },
				},
				acknowledgements: { travel_industry: true },
			},
		]);
	});

	it("uses supplied contact fields before prompting for missing values", async () => {
		server.use(extensionHandler());

		await expect(
			create(
				DOMAIN,
				"--contacts",
				JSON.stringify({
					registrant: {
						email: "owner@example.com",
						postal_info: { name: "Ada Lovelace" },
					},
				}),
				"--acknowledgements-travel-industry",
				"--dry-run"
			)
		).rejects.toThrow(/--contacts-registrant-phone is required/);
		expect(registrations).toEqual([]);
	});

	it("accepts --contacts for an opaque root contact schema", async () => {
		writeFileSync(
			"contacts.json",
			JSON.stringify({ registry_id: "contact-123" })
		);
		server.use(
			extensionHandler(["example"], {
				type: "object",
				required: ["domain_name", "contacts"],
				properties: {
					domain_name: { type: "string" },
					years: { type: "integer", minimum: 1, default: 1 },
					contacts: { type: "object" },
				},
			})
		);

		const { exitCode } = await create(
			"domain.example",
			"--contacts",
			"@contacts.json",
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: {
				domain_name: "domain.example",
				contacts: { registry_id: "contact-123" },
			},
		});
		expect(registrations).toEqual([]);
	});

	it("rejects --contacts mixed with flattened contact fields", async () => {
		server.use(extensionHandler());

		await expect(
			create(
				DOMAIN,
				"--contacts",
				JSON.stringify({
					registrant: {
						email: "owner@example.com",
						phone: "+1.5555555555",
						postal_info: { name: "Ada Lovelace" },
					},
				}),
				"--contacts-registrant-email",
				"other@example.com",
				"--dry-run"
			)
		).rejects.toThrow(/--contacts cannot be combined with --contacts-\*/);
		expect(registrations).toEqual([]);
	});

	it("rejects disagreement between the positional and --body domain", async () => {
		await expect(
			create(
				DOMAIN,
				"--body",
				JSON.stringify({ domain_name: "different.travel" }),
				"--force"
			)
		).rejects.toThrow(/does not match --body domain_name/);
		expect(registrations).toEqual([]);
	});

	it("requires --body to be an object with a string domain", async () => {
		await expect(create(DOMAIN, "--body", "null", "--force")).rejects.toThrow(
			/--body must contain a JSON object/
		);
		await expect(
			create(DOMAIN, "--body", '{"domain_name":42}', "--force")
		).rejects.toThrow(/domain_name must be a string/);
	});

	it("refuses --body mixed with registration field flags", async () => {
		await expect(
			create(
				DOMAIN,
				"--body",
				JSON.stringify({ domain_name: DOMAIN }),
				"--years",
				"2",
				"--force"
			)
		).rejects.toThrow(/--body cannot be combined/);
	});

	it("aborts without --force in a non-interactive context", async () => {
		server.use(extensionHandler(), domainCheckHandler());

		const { exitCode } = await create(DOMAIN, ...REQUIRED);

		// Billable and non-refundable: no confirmation, no registration.
		expect(exitCode).toBe(0);
		expect(registrations).toEqual([]);
		expect(stderr()).toContain("Review registration");
		expect(stderr()).toContain("Domain             example.travel");
		expect(stderr()).toContain("Account            test-account");
		expect(stderr()).toContain("Registration term  1 year");
		expect(stderr()).toContain("Due now            USD 10.00");
		expect(stderr()).toContain("Renewal price      USD 8.00 per year");
		expect(stderr()).toContain("Auto-renew         API default");
		expect(stderr()).toContain("Privacy mode       redaction (default)");
		expect(stderr()).toMatch(
			/Contacts · Registrant · Email\s+owner@example\.com/
		);
		expect(stderr()).toMatch(/Acknowledgements · Travel Industry\s+Accepted/);
		expect(stderr()).toMatch(/for 1 year costs USD 10\.00/);
		expect(stderr()).toMatch(/charges the account's default payment method/);
	});

	it("quotes the complete multi-year cost in the confirmation", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: true,
				pricing: {
					currency: "GBP",
					registration_cost: "10.25",
					renewal_cost: "7.50",
				},
			})
		);

		const { exitCode } = await create(DOMAIN, ...REQUIRED, "--years", "3");

		expect(exitCode).toBe(0);
		expect(registrations).toEqual([]);
		expect(stderr()).toMatch(/for 3 years costs GBP 25\.25/);
	});

	it("rechecks availability and uses the second result for the review", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler([
				{
					registrable: true,
					pricing: {
						currency: "USD",
						registration_cost: "10.00",
						renewal_cost: "8.00",
					},
				},
				{
					registrable: true,
					pricing: {
						currency: "GBP",
						registration_cost: "12.00",
						renewal_cost: "9.00",
					},
				},
			])
		);

		const { exitCode } = await create(DOMAIN, ...REQUIRED_CONTACTS);

		expect(exitCode).toBe(0);
		expect(availabilityChecks).toEqual([
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
		]);
		expect(stderr()).toContain("Due now            GBP 12.00");
		expect(stderr()).toMatch(/for 1 year costs GBP 12\.00/);
		expect(stderr()).not.toMatch(/for 1 year costs USD 10\.00/);
		expect(registrations).toEqual([]);
	});

	it("refreshes pricing and rechecks before a forced submission", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler([
				{
					registrable: true,
					pricing: {
						currency: "USD",
						registration_cost: "10.00",
						renewal_cost: "8.00",
					},
				},
				{
					registrable: true,
					pricing: {
						currency: "GBP",
						registration_cost: "12.00",
						renewal_cost: "9.00",
					},
				},
			]),
			registrationHandler()
		);

		const { exitCode } = await create(DOMAIN, ...REQUIRED, "--force");

		expect(exitCode).toBe(0);
		expect(availabilityChecks).toEqual([
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
		]);
		expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
		expect(confirmDeleteMock).toHaveBeenCalledWith({
			force: true,
			message:
				"Registering example.travel for 1 year costs GBP 12.00, charges the account's default payment method, and cannot be refunded.",
		});
		expect(registrations).toHaveLength(1);
	});

	it("fails closed when availability changes after the form is complete", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler([
				{
					registrable: true,
					pricing: {
						currency: "USD",
						registration_cost: "10.00",
						renewal_cost: "8.00",
					},
				},
				{
					registrable: false,
					reason: "domain_became_unavailable",
				},
			])
		);

		await expect(create(DOMAIN, ...REQUIRED_CONTACTS)).rejects.toThrow(
			/domain_became_unavailable/
		);

		expect(extensionRequests).toEqual(["travel"]);
		expect(availabilityChecks).toHaveLength(2);
		expect(confirmDeleteMock).not.toHaveBeenCalled();
		expect(registrations).toEqual([]);
	});

	it("refreshes availability when the TLD has no form", async () => {
		server.use(
			extensionHandler(["win"], NO_FORM_REGISTRATION_SCHEMA),
			domainCheckHandler()
		);

		const { exitCode } = await create("example.win");

		expect(exitCode).toBe(0);
		expect(extensionRequests).toEqual(["win"]);
		expect(availabilityChecks).toEqual([
			{ domains: ["example.win"] },
			{ domains: ["example.win"] },
		]);
		expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
		expect(stderr()).toContain("Review registration");
		expect(stderr()).toContain("Due now            USD 10.00");
		expect(registrations).toEqual([]);
	});

	it("submits exactly the raw body term accepted in confirmation", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: true,
				pricing: {
					currency: "GBP",
					registration_cost: "10.25",
					renewal_cost: "7.50",
				},
			}),
			registrationHandler()
		);
		confirmDeleteMock.mockImplementation(async () => {
			expect(availabilityChecks).toHaveLength(2);
			return true;
		});

		const { exitCode } = await create(
			"--body",
			JSON.stringify({
				domain_name: DOMAIN,
				years: 3,
				acknowledgements: { travel_industry: true },
			})
		);

		expect(exitCode).toBe(0);
		expect(confirmDeleteMock).toHaveBeenCalledWith({
			force: false,
			message:
				"Registering example.travel for 3 years costs GBP 25.25, charges the account's default payment method, and cannot be refunded.",
		});
		expect(registrations).toEqual([
			{
				domain_name: DOMAIN,
				years: 3,
				acknowledgements: { travel_industry: true },
			},
		]);
		expect(availabilityChecks).toEqual([
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
			{ domains: [DOMAIN] },
		]);
	});

	it("fails closed when the domain becomes unavailable after confirmation", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler([
				{
					registrable: true,
					pricing: {
						currency: "USD",
						registration_cost: "10.00",
						renewal_cost: "8.00",
					},
				},
				{
					registrable: true,
					pricing: {
						currency: "USD",
						registration_cost: "10.00",
						renewal_cost: "8.00",
					},
				},
				{
					registrable: false,
					reason: "domain_became_unavailable",
				},
			]),
			registrationHandler()
		);
		confirmDeleteMock.mockResolvedValue(true);

		await expect(create(DOMAIN, ...REQUIRED)).rejects.toThrow(
			/domain_became_unavailable/
		);

		expect(confirmDeleteMock).toHaveBeenCalledOnce();
		expect(availabilityChecks).toHaveLength(3);
		expect(registrations).toEqual([]);
	});

	it.each([
		[
			"currency",
			{
				currency: "GBP",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
		],
		[
			"registration cost",
			{
				currency: "USD",
				registration_cost: "11.00",
				renewal_cost: "8.00",
			},
		],
		[
			"renewal cost",
			{
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "9.00",
			},
		],
	])(
		"fails closed when the %s changes after confirmation",
		async (_, pricing) => {
			server.use(
				extensionHandler(),
				domainCheckHandler([
					{
						registrable: true,
						pricing: {
							currency: "USD",
							registration_cost: "10.00",
							renewal_cost: "8.00",
						},
					},
					{
						registrable: true,
						pricing: {
							currency: "USD",
							registration_cost: "10.00",
							renewal_cost: "8.00",
						},
					},
					{ registrable: true, pricing },
				]),
				registrationHandler()
			);
			confirmDeleteMock.mockResolvedValue(true);

			await expect(create(DOMAIN, ...REQUIRED)).rejects.toThrow(
				"Availability or pricing changed while awaiting confirmation, so cf will not submit this registration. Re-run the command to review the current quote."
			);

			expect(confirmDeleteMock).toHaveBeenCalledOnce();
			expect(availabilityChecks).toHaveLength(3);
			expect(registrations).toEqual([]);
		}
	);

	it("fails closed on domain controls without changing request values", async () => {
		const rawDomain = "ex\u2028am\n\u202Epl\u2029e.travel";

		await expect(create(rawDomain, ...REQUIRED)).rejects.toThrow(
			"The availability check returned no result for ex am  pl e.travel, so cf cannot safely register it."
		);
		expect(availabilityChecks).toEqual([{ domains: [rawDomain] }]);
		expect(confirmDeleteMock).not.toHaveBeenCalled();
		expect(registrations).toEqual([]);
	});

	it("uses the extension's multi-year default for the review and request", async () => {
		server.use(
			extensionHandler(["ai"], MULTI_YEAR_REGISTRATION_SCHEMA),
			domainCheckHandler({
				registrable: true,
				pricing: {
					currency: "USD",
					registration_cost: "10.00",
					renewal_cost: "8.00",
				},
			})
		);

		const { exitCode } = await create("example.ai", ...REQUIRED);

		expect(exitCode).toBe(0);
		expect(registrations).toEqual([]);
		expect(stderr()).toContain("Registration term  2 years");
		expect(stderr()).toContain("Due now            USD 18.00");
		expect(stderr()).toMatch(/for 2 years costs USD 18\.00/);
	});

	it("resolves the registration term declared in a root allOf", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				allOf: [
					{
						required: ["domain_name"],
						properties: {
							domain_name: { type: "string" },
							years: {
								type: "integer",
								minimum: 2,
								maximum: 10,
								default: 2,
							},
						},
					},
				],
			})
		);

		const { exitCode } = await create("example.ai", "--dry-run");

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.ai", years: 2 },
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("resolves an explicit registration term declared by an active root conditional", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				required: ["domain_name", "registration_type"],
				properties: {
					domain_name: { type: "string" },
					registration_type: { enum: ["fixed", "other"] },
				},
				if: {
					required: ["registration_type"],
					properties: { registration_type: { const: "fixed" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: {
					properties: {
						years: { type: "integer", minimum: 2, maximum: 10 },
					},
				},
			})
		);

		const { exitCode } = await create(
			"example.ai",
			"--registration-type",
			"fixed",
			"--years",
			"3",
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: {
				domain_name: "example.ai",
				registration_type: "fixed",
				years: 3,
			},
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it.each(["allOf", "oneOf", "anyOf"] as const)(
		"resolves an explicit registration term from an active conditional nested in a root %s member",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "registration_type"],
					properties: {
						domain_name: { type: "string" },
						registration_type: { enum: ["fixed", "other"] },
					},
					[keyword]: [
						{
							if: {
								required: ["registration_type"],
								properties: {
									registration_type: { const: "fixed" },
								},
							},
							// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
							then: {
								properties: {
									years: {
										type: "integer",
										minimum: 2,
										maximum: 10,
									},
								},
							},
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--registration-type",
				"fixed",
				"--years",
				"3",
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: {
					domain_name: "example.ai",
					registration_type: "fixed",
					years: 3,
				},
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it("does not resolve a registration term from an inactive root conditional", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				required: ["domain_name", "registration_type"],
				properties: {
					domain_name: { type: "string" },
					registration_type: { enum: ["fixed", "other"] },
				},
				if: {
					required: ["registration_type"],
					properties: { registration_type: { const: "fixed" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: {
					properties: {
						years: { type: "integer", minimum: 2, maximum: 10 },
					},
				},
			})
		);

		await expect(
			create(
				"example.ai",
				"--registration-type",
				"other",
				"--years",
				"3",
				"--dry-run"
			)
		).rejects.toThrow(/no registration-term field/);
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("does not activate a registration-term conditional it cannot validate", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				required: ["domain_name", "registration_type"],
				properties: {
					domain_name: { type: "string" },
					registration_type: { enum: ["fixed", "other"] },
				},
				if: {
					not: {
						required: ["registration_type"],
						properties: {
							registration_type: { const: "fixed" },
						},
					},
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: {
					properties: {
						years: { type: "integer", default: 2 },
					},
				},
			})
		);

		await expect(
			create(
				"example.ai",
				"--body",
				JSON.stringify({
					domain_name: "example.ai",
					registration_type: "fixed",
				}),
				"--dry-run"
			)
		).rejects.toThrow(/no registration-term field/);
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("merges registration-term declarations across a root allOf", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				allOf: [
					{
						required: ["domain_name"],
						properties: {
							domain_name: { type: "string" },
							years: { type: "integer", minimum: 1 },
						},
					},
					{
						properties: {
							years: { maximum: 10, default: 2 },
						},
					},
				],
			})
		);

		const { exitCode } = await create("example.ai", "--dry-run");

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.ai", years: 2 },
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it.each([
		{
			label: "boolean exclusive minimum",
			years: {
				type: "integer",
				minimum: 1,
				exclusiveMinimum: true,
				maximum: 10,
			},
			expected: 2,
		},
		{
			label: "numeric exclusive minimum",
			years: {
				type: "integer",
				exclusiveMinimum: 1,
				maximum: 10,
			},
			expected: 2,
		},
		{
			label: "co-located higher inclusive minimum",
			years: {
				type: "integer",
				minimum: 5,
				exclusiveMinimum: 1,
				maximum: 10,
			},
			expected: 5,
		},
		{
			label: "co-located higher numeric exclusive minimum",
			years: {
				type: "integer",
				minimum: 1,
				exclusiveMinimum: 5,
				maximum: 10,
			},
			expected: 6,
		},
		{
			label: "nested conjunctive integer lower bounds",
			years: {
				type: "integer",
				minimum: 1.2,
				maximum: 10,
				allOf: [
					{ minimum: 2, exclusiveMinimum: true },
					{ allOf: [{ exclusiveMinimum: 3.1 }] },
				],
			},
			expected: 4,
		},
		{
			label: "exclusive lower bound below one",
			years: {
				type: "integer",
				exclusiveMinimum: -2,
				maximum: 10,
			},
			expected: 1,
		},
	])(
		"derives a registration term from the $label",
		async ({ years, expected }) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name"],
					properties: {
						domain_name: { type: "string" },
						years,
					},
				})
			);

			const { exitCode } = await create("example.ai", "--dry-run");

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", years: expected },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it("uses an agreed conjunctive term const before defaults", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				allOf: [
					{
						required: ["domain_name"],
						properties: {
							domain_name: { type: "string" },
							years: {
								type: "integer",
								const: 2,
								default: 1,
								minimum: 1,
							},
						},
					},
					{
						properties: {
							years: { const: 2, default: 3, minimum: 1 },
						},
					},
				],
			})
		);

		const { exitCode } = await create("example.ai", "--dry-run");

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.ai", years: 2 },
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it.each(["oneOf", "anyOf"] as const)(
		"resolves an agreed registration term declared in every root %s branch",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					[keyword]: [
						{
							required: ["domain_name"],
							properties: {
								domain_name: { type: "string" },
								years: {
									type: "integer",
									minimum: 2,
									maximum: 10,
									default: 2,
								},
							},
						},
						{
							required: ["kind"],
							properties: {
								kind: { const: "other" },
								years: {
									type: "integer",
									minimum: 2,
									maximum: 10,
									default: 2,
								},
							},
						},
					],
				})
			);

			const { exitCode } = await create("example.ai", "--dry-run");

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"resolves an omitted registration term from the selected root %s branch",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { enum: ["short", "long"] },
					},
					[keyword]: [
						{
							required: ["years"],
							properties: {
								kind: { const: "short" },
								years: { type: "integer", default: 1 },
							},
						},
						{
							required: ["years"],
							properties: {
								kind: { const: "long" },
								years: { type: "integer", default: 2 },
							},
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai", kind: "long" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", kind: "long", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"selects a root %s branch whose minimum property count needs its default term",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { enum: ["short", "long"] },
					},
					[keyword]: [
						{
							required: ["years"],
							minProperties: 3,
							properties: {
								kind: { const: "short" },
								years: { type: "integer", default: 1 },
							},
						},
						{
							required: ["years"],
							minProperties: 3,
							properties: {
								kind: { const: "long" },
								years: { type: "integer", default: 2 },
							},
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai", kind: "long" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", kind: "long", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"selects a root %s branch whose nested alternative needs its default term",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { enum: ["short", "long"] },
					},
					[keyword]: [
						{
							required: ["years"],
							properties: {
								kind: { const: "short" },
								years: { type: "integer", default: 1 },
							},
						},
						{
							required: ["years"],
							properties: {
								kind: { const: "long" },
								years: { type: "integer", default: 2 },
							},
							anyOf: [
								{
									required: ["years"],
									properties: { years: { const: 2 } },
								},
								{
									properties: { kind: { const: "unreachable" } },
								},
							],
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai", kind: "long" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", kind: "long", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"ignores a root %s term candidate invalidated by a shared constraint",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name"],
					properties: {
						domain_name: { type: "string" },
						years: { type: "integer", maximum: 2 },
					},
					[keyword]: [
						{
							properties: {
								years: { const: 2, default: 2 },
							},
						},
						{
							properties: {
								years: { const: 3, default: 3 },
							},
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"uses a cross-field conditional to select a root %s term candidate",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "plan"],
					properties: {
						domain_name: { type: "string" },
						plan: { enum: ["short", "long"] },
					},
					[keyword]: [
						{
							required: ["years"],
							properties: {
								years: { const: 1, default: 1 },
							},
						},
						{
							required: ["years"],
							properties: {
								years: { const: 2, default: 2 },
							},
						},
					],
					if: {
						required: ["years"],
						properties: { years: { const: 1 } },
					},
					// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
					then: {
						properties: { plan: { const: "short" } },
					},
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai", plan: "long" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", plan: "long", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"uses a shared default to select a root %s branch",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { enum: ["short", "long"] },
						years: { type: "integer", default: 2 },
					},
					[keyword]: [
						{
							required: ["years"],
							properties: {
								kind: { const: "short" },
								years: { const: 1 },
							},
						},
						{
							required: ["years"],
							properties: {
								kind: { const: "long" },
								years: { enum: [2] },
							},
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai", kind: "long" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", kind: "long", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"expands direct registration-term %s candidates",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name"],
					properties: {
						domain_name: { type: "string" },
						years: {
							type: "integer",
							maximum: 2,
							[keyword]: [
								{ const: 2, default: 2 },
								{ const: 3, default: 3 },
							],
						},
					},
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({ domain_name: "example.ai" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: { domain_name: "example.ai", years: 2 },
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"does not narrow omitted-term defaults through unsupported root %s branches",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { enum: ["short", "long"] },
					},
					[keyword]: [
						{
							required: ["years"],
							not: {
								required: ["kind"],
								properties: { kind: { const: "long" } },
							},
							properties: {
								years: { type: "integer", default: 1 },
							},
						},
						{
							required: ["years"],
							properties: {
								kind: { const: "short" },
								years: { type: "integer", default: 2 },
							},
						},
					],
				})
			);

			await expect(
				create(
					"example.ai",
					"--body",
					JSON.stringify({ domain_name: "example.ai", kind: "long" }),
					"--dry-run"
				)
			).rejects.toThrow(/no safe default registration term/);
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"falls back to every root %s branch when none match before inserting years",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { type: "string" },
					},
					[keyword]: [
						{
							required: ["years"],
							properties: {
								kind: { const: "A" },
								years: { type: "integer", default: 2 },
							},
						},
						{
							required: ["years"],
							properties: {
								kind: { const: "B" },
								years: { type: "integer", default: 2 },
							},
						},
					],
				})
			);

			await expect(
				create(
					"example.ai",
					"--body",
					JSON.stringify({ domain_name: "example.ai", kind: "C" }),
					"--dry-run"
				)
			).rejects.toThrow(/must match/);
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"refuses differing omitted-term defaults when multiple root %s branches match",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name"],
					properties: { domain_name: { type: "string" } },
					[keyword]: [
						{
							required: ["years"],
							properties: {
								years: { type: "integer", default: 1 },
							},
						},
						{
							required: ["years"],
							properties: {
								years: { type: "integer", default: 2 },
							},
						},
					],
				})
			);

			await expect(
				create(
					"example.ai",
					"--body",
					JSON.stringify({ domain_name: "example.ai" }),
					"--dry-run"
				)
			).rejects.toThrow(/no safe default registration term/);
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"refuses a registration term fallback when a root %s branch omits years",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					[keyword]: [
						{
							required: ["domain_name", "kind"],
							properties: {
								domain_name: { type: "string" },
								kind: { const: "with-term" },
								years: { type: "integer", default: 2 },
							},
						},
						{
							required: ["domain_name", "kind"],
							properties: {
								domain_name: { type: "string" },
								kind: { const: "without-term" },
							},
						},
					],
				})
			);

			await expect(
				create(
					"example.ai",
					"--body",
					JSON.stringify({
						domain_name: "example.ai",
						kind: "without-term",
					}),
					"--dry-run"
				)
			).rejects.toThrow(/no registration-term field/);
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"rejects an explicit registration term when the selected root %s branch omits years",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					[keyword]: [
						{
							required: ["domain_name", "kind"],
							properties: {
								domain_name: { type: "string" },
								kind: { const: "with-term" },
								years: {
									type: "integer",
									minimum: 2,
									maximum: 10,
								},
							},
						},
						{
							required: ["domain_name", "kind"],
							properties: {
								domain_name: { type: "string" },
								kind: { const: "without-term" },
							},
						},
					],
				})
			);

			await expect(
				create(
					"example.ai",
					"--body",
					JSON.stringify({
						domain_name: "example.ai",
						kind: "without-term",
						years: 3,
					}),
					"--dry-run"
				)
			).rejects.toThrow(/no registration-term field/);
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it("accepts an explicit registration term declared by the selected root anyOf branch", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				anyOf: [
					{
						required: ["domain_name", "kind"],
						properties: {
							domain_name: { type: "string" },
							kind: { const: "with-term" },
							years: {
								type: "integer",
								minimum: 2,
								maximum: 10,
							},
						},
					},
					{
						required: ["domain_name", "kind"],
						properties: {
							domain_name: { type: "string" },
							kind: { const: "without-term" },
						},
					},
				],
			})
		);

		const { exitCode } = await create(
			"example.ai",
			"--body",
			JSON.stringify({
				domain_name: "example.ai",
				kind: "with-term",
				years: 3,
			}),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.ai", kind: "with-term", years: 3 },
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("rejects an explicit registration term when a matching root anyOf branch omits years", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				anyOf: [
					{
						required: ["domain_name", "kind"],
						properties: {
							domain_name: { type: "string" },
							kind: { const: "shared" },
							years: {
								type: "integer",
								minimum: 2,
								maximum: 10,
							},
						},
					},
					{
						required: ["domain_name", "kind"],
						properties: {
							domain_name: { type: "string" },
							kind: { const: "shared" },
						},
					},
				],
			})
		);

		await expect(
			create(
				"example.ai",
				"--body",
				JSON.stringify({
					domain_name: "example.ai",
					kind: "shared",
					years: 3,
				}),
				"--dry-run"
			)
		).rejects.toThrow(/no registration-term field/);
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it.each(["oneOf", "anyOf"] as const)(
		"accepts a direct registration term when the selected root %s branch omits years",
		async (keyword) => {
			server.use(
				extensionHandler(["ai"], {
					type: "object",
					required: ["domain_name", "kind"],
					properties: {
						domain_name: { type: "string" },
						kind: { enum: ["with-term", "without-term"] },
						years: {
							type: "integer",
							minimum: 2,
							maximum: 10,
						},
					},
					[keyword]: [
						{
							properties: { kind: { const: "with-term" } },
						},
						{
							properties: { kind: { const: "without-term" } },
						},
					],
				})
			);

			const { exitCode } = await create(
				"example.ai",
				"--body",
				JSON.stringify({
					domain_name: "example.ai",
					kind: "without-term",
					years: 3,
				}),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				body: {
					domain_name: "example.ai",
					kind: "without-term",
					years: 3,
				},
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it("preserves alternative-specific registration term constraints", async () => {
		server.use(
			extensionHandler(["ai"], {
				type: "object",
				oneOf: [
					{
						required: ["domain_name", "kind"],
						properties: {
							domain_name: { type: "string" },
							kind: { const: "A" },
							years: { type: "integer", const: 1, default: 1 },
						},
					},
					{
						required: ["domain_name", "kind"],
						properties: {
							domain_name: { type: "string" },
							kind: { const: "B" },
							years: { type: "integer", const: 2, default: 2 },
						},
					},
				],
			})
		);

		const { exitCode } = await create(
			"example.ai",
			"--body",
			JSON.stringify({ domain_name: "example.ai", kind: "B", years: 2 }),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.ai", kind: "B", years: 2 },
		});
		output.clear();

		const omitted = await create(
			"example.ai",
			"--body",
			JSON.stringify({ domain_name: "example.ai", kind: "B" }),
			"--dry-run"
		);
		expect(omitted.exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.ai", kind: "B", years: 2 },
		});
	});

	it("sends the reviewed schema default and lets an explicit term override it", async () => {
		server.use(
			extensionHandler(["ai"], MULTI_YEAR_REGISTRATION_SCHEMA),
			registrationHandler()
		);

		await create("example.ai", ...REQUIRED, "--force");
		await create("example.ai", ...REQUIRED, "--years", "3", "--force");

		expect(registrations).toEqual([
			expect.objectContaining({ domain_name: "example.ai", years: 2 }),
			expect.objectContaining({ domain_name: "example.ai", years: 3 }),
		]);
	});

	it("does not print an interactive review when --force skips confirmation", async () => {
		server.use(extensionHandler(), registrationHandler());

		const { exitCode } = await create(DOMAIN, ...REQUIRED, "--force");

		expect(exitCode).toBe(0);
		expect(stderr()).not.toContain("Review registration");
		expect(registrations).toHaveLength(1);
	});

	it("reviews extension-specific values with their human labels", async () => {
		server.use(extensionHandler(["uk"], UK_REGISTRATION_SCHEMA));

		const { exitCode } = await create(
			"example.uk",
			"--contact-extensions-registrant-type",
			"LTD",
			"--contact-extensions-company-number",
			"12345678"
		);

		expect(exitCode).toBe(0);
		expect(stderr()).toMatch(
			/Registry Details · Registrant Type\s+UK Limited Company \(LTD\)/
		);
		expect(stderr()).toMatch(/Registry Details · Company Number\s+12345678/);
		expect(registrations).toEqual([]);
	});

	it("refuses confirmation when the domain is not registrable", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: false,
				reason: "domain_unavailable",
			})
		);

		await expect(create(DOMAIN)).rejects.toThrow(
			/example\.travel is not available.*domain_unavailable/
		);
		expect(extensionRequests).toEqual([]);
		expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
		expect(registrations).toEqual([]);
	});

	it("matches a reordered availability result to the canonical domain", async () => {
		const domain = "  BÜCHER.IDN. ";
		server.use(
			extensionHandler(["idn"], NO_FORM_REGISTRATION_SCHEMA),
			http.post(`${ACCT}/registrar/domain-check`, async ({ request }) => {
				const requestBody = (await request.json()) as { domains: string[] };
				availabilityChecks.push(requestBody);
				return HttpResponse.json({
					success: true,
					errors: [],
					result: {
						domains: [
							{
								name: "unrelated.idn",
								registrable: false,
								reason: "domain_unavailable",
								tier: "standard",
							},
							{
								name: "xn--bcher-kva.idn",
								registrable: true,
								tier: "standard",
								pricing: {
									currency: "USD",
									registration_cost: "10.00",
									renewal_cost: "8.00",
								},
							},
						],
					},
				});
			}),
			registrationHandler()
		);

		const { exitCode } = await create(domain, "--force");

		expect(exitCode).toBe(0);
		expect(availabilityChecks).toEqual([
			{ domains: [domain] },
			{ domains: [domain] },
			{ domains: [domain] },
		]);
		expect(registrations).toEqual([
			expect.objectContaining({ domain_name: domain }),
		]);
	});

	it("fails closed on an unmatched availability result", async () => {
		const domain = "Example.TEST.";
		server.use(
			domainCheckHandler({
				name: "unrelated.test",
				registrable: true,
				pricing: {
					currency: "USD",
					registration_cost: "10.00",
					renewal_cost: "8.00",
				},
			})
		);

		await expect(create(domain)).rejects.toThrow(
			"The availability check returned no result for Example.TEST., so cf cannot safely register it."
		);
		expect(availabilityChecks).toEqual([{ domains: [domain] }]);
	});

	it("fails closed on duplicate matching availability results", async () => {
		server.use(
			http.post(`${ACCT}/registrar/domain-check`, async ({ request }) => {
				const requestBody = (await request.json()) as { domains: string[] };
				availabilityChecks.push(requestBody);
				return HttpResponse.json({
					success: true,
					errors: [],
					result: {
						domains: [
							{
								name: "example.test",
								registrable: true,
								tier: "standard",
								pricing: {
									currency: "USD",
									registration_cost: "10.00",
									renewal_cost: "8.00",
								},
							},
							{
								name: "EXAMPLE.TEST",
								registrable: false,
								reason: "domain_unavailable",
								tier: "standard",
							},
						],
					},
				});
			})
		);

		await expect(create("example.test")).rejects.toThrow(
			"The availability check returned no result for example.test, so cf cannot safely register it."
		);
		expect(availabilityChecks).toEqual([{ domains: ["example.test"] }]);
	});

	it("sanitizes a matched availability reason", async () => {
		const domain = "Example.TEST.";
		server.use(
			domainCheckHandler({
				name: "example.test",
				registrable: false,
				reason: "domain\u2028unavailable",
			})
		);

		await expect(create(domain)).rejects.toThrow(
			"Example.TEST. is not available for registration (domain unavailable)."
		);
		expect(availabilityChecks).toEqual([{ domains: [domain] }]);
	});

	it("rejects premium domains before schema discovery or submission", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: false,
				reason: "domain_premium",
			})
		);

		await expect(create(DOMAIN, "--force")).rejects.toThrow(
			/premium domain \(domain_premium\).*will not submit/
		);
		expect(extensionRequests).toEqual([]);
		expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
		expect(registrations).toEqual([]);
	});

	it("fails closed on an inconsistent registrable premium-tier result", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: true,
				tier: "premium",
				pricing: {
					currency: "USD",
					registration_cost: "1000.00",
					renewal_cost: "100.00",
				},
			})
		);

		await expect(create(DOMAIN, "--force")).rejects.toThrow(
			/premium domain.*will not submit/
		);
		expect(extensionRequests).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it.each([
		["missing", undefined],
		["unexpected", "unclassified"],
	])("fails closed on a registrable result with a %s tier", async (_, tier) => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: true,
				tier,
				pricing: {
					currency: "USD",
					registration_cost: "10.00",
					renewal_cost: "8.00",
				},
			})
		);

		await expect(create(DOMAIN, "--force")).rejects.toThrow(
			`${DOMAIN} is not confirmed as a standard domain. This API only supports standard registrations, so cf will not submit it.`
		);
		expect(availabilityChecks).toEqual([{ domains: [DOMAIN] }]);
		expect(extensionRequests).toEqual([]);
		expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
		expect(registrations).toEqual([]);
	});

	it("fails closed on a malformed truthy registrable value", async () => {
		server.use(
			extensionHandler(),
			domainCheckHandler({
				registrable: "false",
				tier: "standard",
				pricing: {
					currency: "USD",
					registration_cost: "10.00",
					renewal_cost: "8.00",
				},
			})
		);

		await expect(create(DOMAIN, "--force")).rejects.toThrow(
			`${DOMAIN} is not available for registration.`
		);
		expect(availabilityChecks).toEqual([{ domains: [DOMAIN] }]);
		expect(extensionRequests).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("previews the assembled body under --dry-run", async () => {
		server.use(extensionHandler());

		const { exitCode } = await create(DOMAIN, ...REQUIRED, "--dry-run");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain('"travel_industry": true');
		expect(stdout()).toContain('"domain_name": "example.travel"');
		expect(stdout()).toContain('"years": 1');
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("reports a required raw-body term before trying to default it", async () => {
		server.use(
			extensionHandler(["test"], {
				type: "object",
				required: ["domain_name", "years"],
				properties: {
					domain_name: { type: "string" },
					years: { type: "integer" },
				},
			})
		);

		const { exitCode } = await create(
			"example.test",
			"--body",
			JSON.stringify({ domain_name: "example.test" }),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			submitted: false,
			reason: "registration_input_required",
			missingFields: [
				expect.objectContaining({ path: "/years", flag: "--years" }),
			],
			validationErrors: ["`/years` is required"],
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("inserts a usable default for a required raw-body term", async () => {
		server.use(
			extensionHandler(["test"], {
				type: "object",
				required: ["domain_name", "years"],
				properties: {
					domain_name: { type: "string" },
					years: { type: "integer", minimum: 1, default: 1 },
				},
			})
		);

		const { exitCode } = await create(
			"example.test",
			"--body",
			JSON.stringify({ domain_name: "example.test" }),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			body: { domain_name: "example.test", years: 1 },
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("revalidates a raw body after inserting the default term", async () => {
		server.use(
			extensionHandler(["test"], {
				type: "object",
				required: ["domain_name"],
				properties: {
					domain_name: { type: "string" },
					years: { type: "integer", default: 1 },
					term_acknowledged: { type: "boolean" },
				},
				if: {
					required: ["years"],
					properties: { years: { const: 1 } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: { required: ["term_acknowledged"] },
			})
		);

		const { exitCode } = await create(
			"example.test",
			"--body",
			JSON.stringify({ domain_name: "example.test" }),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			submitted: false,
			reason: "registration_input_required",
			missingFields: [
				expect.objectContaining({
					path: "/term_acknowledged",
					flag: "--term-acknowledged",
				}),
			],
			validationErrors: ["`/term_acknowledged` is required"],
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("uses wire values for missing enum choices without own labels", async () => {
		server.use(
			extensionHandler(["test"], {
				type: "object",
				required: ["domain_name", "registrant_type"],
				properties: {
					domain_name: { type: "string" },
					years: { type: "integer", default: 1 },
					registrant_type: {
						type: "string",
						oneOf: [
							{ const: "person", title: "Individual" },
							{ const: "toString" },
						],
					},
				},
			})
		);

		const { exitCode } = await create(
			"example.test",
			"--body",
			JSON.stringify({ domain_name: "example.test" }),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			submitted: false,
			reason: "registration_input_required",
			missingFields: [
				expect.objectContaining({
					path: "/registrant_type",
					choices: [
						{ value: "person", label: "Individual" },
						{ value: "toString", label: "toString" },
					],
				}),
			],
		});
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it.each([
		{
			label: "integer enum",
			schema: { type: "integer", enum: [1, 2] },
			expected: [
				{ value: 1, label: "1" },
				{ value: 2, label: "2" },
			],
		},
		{
			label: "boolean enum",
			schema: { type: "boolean", enum: [true, false] },
			expected: [
				{ value: true, label: "true" },
				{ value: false, label: "false" },
			],
		},
		{
			label: "integer oneOf",
			schema: {
				type: "integer",
				oneOf: [
					{ const: 1, title: "One year" },
					{ const: 2, title: "Two years" },
				],
			},
			expected: [
				{ value: 1, label: "One year" },
				{ value: 2, label: "Two years" },
			],
		},
		{
			label: "boolean anyOf",
			schema: {
				type: "boolean",
				anyOf: [
					{ enum: [true], title: "Accepted" },
					{ const: false, title: "Declined" },
				],
			},
			expected: [
				{ value: true, label: "Accepted" },
				{ value: false, label: "Declined" },
			],
		},
	])(
		"preserves wire types for missing $label choices",
		async ({ schema, expected }) => {
			server.use(
				extensionHandler(["test"], {
					type: "object",
					required: ["domain_name", "selection"],
					properties: {
						domain_name: { type: "string" },
						years: { type: "integer", default: 1 },
						selection: schema,
					},
				})
			);

			const { exitCode } = await create(
				"example.test",
				"--body",
				JSON.stringify({ domain_name: "example.test" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				submitted: false,
				reason: "registration_input_required",
				missingFields: [
					expect.objectContaining({ path: "/selection", choices: expected }),
				],
			});
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		}
	);

	it("returns agent-ready missing fields without prompting in a TTY", async () => {
		server.use(extensionHandler(["ca"], CA_REGISTRATION_SCHEMA));
		const originalStdinIsTTY = process.stdin.isTTY;
		const originalStdoutIsTTY = process.stdout.isTTY;
		Object.defineProperty(process.stdin, "isTTY", {
			configurable: true,
			value: true,
		});
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: true,
		});

		try {
			const { exitCode } = await create(
				"example.ca",
				"--body",
				JSON.stringify({ domain_name: "example.ca" }),
				"--dry-run"
			);

			expect(exitCode).toBe(0);
			expect(JSON.parse(stdout())).toMatchObject({
				submitted: false,
				reason: "registration_input_required",
				domainName: "example.ca",
				extension: "ca",
				missingFields: expect.arrayContaining([
					expect.objectContaining({
						path: "/contact_extensions/ca_legal_type",
						flag: "--contact-extensions-ca-legal-type",
						question:
							"Canadian Legal Type — Identifies the registrant's Canadian legal type",
						choices: [
							{ value: "CCT", label: "Canadian Citizen" },
							{ value: "CCO", label: "Canadian Corporation" },
						],
					}),
					expect.objectContaining({
						path: "/acknowledgements/cira_agreement",
						flag: "--acknowledgements-cira-agreement",
						requiredValue: true,
						acknowledgementText:
							"I certify that the registrant satisfies the CIRA presence requirements.",
					}),
				]),
			});
			expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
			expect(confirmDeleteMock).not.toHaveBeenCalled();
			expect(availabilityChecks).toEqual([]);
			expect(registrations).toEqual([]);
		} finally {
			Object.defineProperty(process.stdin, "isTTY", {
				configurable: true,
				value: originalStdinIsTTY,
			});
			Object.defineProperty(process.stdout, "isTTY", {
				configurable: true,
				value: originalStdoutIsTTY,
			});
		}
	});

	it("sanitizes display text in agent-ready missing fields", async () => {
		const choiceValue = "wire\u202Evalue";
		server.use(
			extensionHandler(["test"], {
				type: "object",
				required: ["domain_name", "registrant_type", "agreement"],
				properties: {
					domain_name: { type: "string" },
					years: { type: "integer", minimum: 1, default: 1 },
					registrant_type: {
						type: "string",
						title: "Registrant Type",
						description: "Pick\u202Ethis\u2028value\nnow",
						enum: [choiceValue],
					},
					agreement: {
						type: "boolean",
						const: true,
						description: "Agree\u202Eto\u2028these\nterms",
					},
				},
			})
		);

		const { exitCode } = await create(
			"example.test",
			"--body",
			JSON.stringify({ domain_name: "example.test" }),
			"--dry-run"
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout())).toMatchObject({
			missingFields: expect.arrayContaining([
				expect.objectContaining({
					path: "/registrant_type",
					description: "Pick this value now",
					choices: [{ value: choiceValue, label: "wire value" }],
				}),
				expect.objectContaining({
					path: "/agreement",
					description: "Agree to these terms",
					acknowledgementText: "Agree to these terms",
				}),
			]),
		});
		expect(stdout()).not.toContain("\u2028");
	});

	it("fails closed when the schema's default term is unsafe", async () => {
		server.use(
			extensionHandler(["ai"], {
				...MULTI_YEAR_REGISTRATION_SCHEMA,
				properties: {
					...MULTI_YEAR_REGISTRATION_SCHEMA.properties,
					years: {
						type: "integer",
						minimum: 2,
						maximum: 10,
						default: 1,
					},
				},
			})
		);

		await expect(
			create("example.ai", ...REQUIRED, "--dry-run")
		).rejects.toThrow(/invalid default registration term/);
		expect(availabilityChecks).toEqual([]);
		expect(registrations).toEqual([]);
	});

	it("rejects local execution before schema discovery or prompting", async () => {
		await expect(create(DOMAIN, "--local")).rejects.toMatchObject({
			message:
				"This command has no local equivalent. Re-run without --local to use the Cloudflare API.",
		});
		expect(extensionRequests).toEqual([]);
		expect(registrations).toEqual([]);
		expect(promptForAcknowledgementMock).not.toHaveBeenCalled();
	});

	it("sets the Prefer header when asked", async () => {
		let prefer: string | null = null;
		server.use(
			extensionHandler(),
			http.post(`${ACCT}/registrar/registrations`, ({ request }) => {
				prefer = request.headers.get("Prefer");
				return HttpResponse.json({ success: true, errors: [], result: {} });
			})
		);

		await create(DOMAIN, ...REQUIRED, "--prefer", "respond-async", "--force");

		expect(prefer).toBe("respond-async");
	});

	it("makes no request for `--help` without a domain", async () => {
		const { exitCode } = await create("--help");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("create [domain-name]");
		expect(extensionRequests).toEqual([]);
	});

	it("keeps domain-qualified help offline in local mode", async () => {
		// No state directory and no request handlers: this covers both the
		// global middleware exception and the command's schema lookup.
		const { exitCode } = await create(DOMAIN, "--local", "--help");

		expect(exitCode).toBe(0);
		expect(extensionRequests).toEqual([]);
		expect(stdout()).toContain(
			"Registration fields are unavailable in local mode"
		);
	});

	it("lists the extension's fields for `<domain> --help`", async () => {
		server.use(extensionHandler());

		const { exitCode } = await create(DOMAIN, "--help");

		expect(exitCode).toBe(0);
		expect(stdout()).toContain("Registration fields for .travel");
		expect(stdout()).toContain("--contacts-registrant-postal-info-name");
		expect(stdout()).toContain("[must be: true]");
		expect(stdout()).toContain("[choices: off, redaction]");
		// `domain_name` comes from the positional, so it isn't offered twice.
		expect(stdout()).not.toContain("--domain-name  ");
	});

	it("uses the only authorised account for qualified help", async () => {
		const accountRequests: string[] = [];
		server.use(
			http.get(`${TEST_BASE_URL}/accounts`, ({ request }) => {
				accountRequests.push(new URL(request.url).pathname);
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: [{ id: "test-account", name: "Test Account" }],
				});
			}),
			http.get(`${TEST_BASE_URL}/memberships`, ({ request }) => {
				accountRequests.push(new URL(request.url).pathname);
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: [{ account: { id: "test-account", name: "Test Account" } }],
				});
			}),
			extensionHandler()
		);
		const { exitCode } = await runCf(
			["registrar", "registrations", "create", DOMAIN, "--help"],
			{
				CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
				CLOUDFLARE_API_TOKEN: "test-token",
				CLOUDFLARE_ACCOUNT_ID: undefined,
			}
		);

		expect(exitCode).toBe(0);
		expect(accountRequests.sort()).toEqual([
			"/client/v4/accounts",
			"/client/v4/memberships",
		]);
		expect(extensionRequests).toEqual(["travel"]);
		expect(stdout()).toContain("Registration fields for .travel");
	});
});

describe("extensionCandidates", () => {
	it("returns candidate suffixes longest-first", () => {
		expect(extensionCandidates("example.travel")).toEqual(["travel"]);
		expect(extensionCandidates("example.co.uk")).toEqual(["co.uk", "uk"]);
		expect(extensionCandidates("shop.example.co.uk")).toEqual([
			"example.co.uk",
			"co.uk",
			"uk",
		]);
	});

	it("tolerates trailing dots, case and whitespace, and bare labels", () => {
		expect(extensionCandidates("  Example.TRAVEL. ")).toEqual(["travel"]);
		expect(extensionCandidates("example")).toEqual([]);
	});
});

/**
 * Drift guard — nothing regenerates this command when the spec moves, so
 * compare its assumptions against the generated `_meta/*.json`.
 */
describe("cf registrar registrations create — spec drift guard", () => {
	function readJson<T>(relative: string): T {
		return JSON.parse(
			readFileSync(new URL(relative, import.meta.url), "utf-8")
		) as T;
	}

	const spec = readJson<{
		schemas: Record<
			string,
			{
				operationId: string;
				httpMethod: string;
				path: string;
				hasRequestBody: boolean;
				requestBodyFields: { name: string }[];
			}
		>;
	}>("../../commands/_generated/_meta/schemas.json").schemas[
		"registrar registrations create"
	];

	it("still targets POST /accounts/{account_id}/registrar/registrations", () => {
		expect(spec).toBeDefined();
		expect(spec?.httpMethod).toBe("POST");
		expect(spec?.path).toBe("/accounts/{account_id}/registrar/registrations");
		expect(spec?.operationId).toBe("registrar-domain-registration-create");
		expect(spec?.hasRequestBody).toBe(true);
		// The command promotes the domain to a positional and seeds it back
		// into the body, so a rename here would send the wrong shape.
		expect((spec?.requestBodyFields ?? []).map((f) => f.name)).toContain(
			"domain-name"
		);
	});

	it("publishes an optional domain positional for the body-only flow", () => {
		const entry = readJson<{
			commands: {
				command: string;
				usage: string;
				arguments: { name: string; required: boolean }[];
			}[];
		}>("../../commands/_generated/_meta/commands.json").commands.find(
			(command) => command.command === "cf registrar registrations create"
		);

		expect(entry?.usage).toContain("[domain-name]");
		expect(
			entry?.arguments.find((argument) => argument.name === "domain-name")
				?.required
		).toBe(false);
	});
});
