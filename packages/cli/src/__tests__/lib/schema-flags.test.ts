import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
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
	validateSupportedJsonSchema,
} from "../../lib/schema-flags.js";
import type { JsonSchema } from "../../lib/schema-flags.js";

describe("schema flags", () => {
	it("omits the reserved top-level mode but keeps scoped mode fields", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				mode: { type: "string" },
				guardrails: {
					type: "object",
					properties: { mode: { type: "string" } },
				},
			},
		});

		expect(descriptors.map(({ name }) => name)).toEqual(["guardrails-mode"]);
		expect(
			assembleBody(descriptors, {
				mode: "staging",
				"guardrails-mode": "readonly",
			})
		).toEqual({
			body: { guardrails: { mode: "readonly" } },
			errors: [],
		});
	});

	it("omits prototype-chain property paths while keeping safe siblings", () => {
		const unsafeObject = (): JsonSchema => ({
			type: "object",
			properties: { polluted: { type: "string" } },
		});
		const descriptors = schemaToFlags({
			type: "object",
			properties: Object.fromEntries([
				["safe", { type: "string" }],
				["__proto__", unsafeObject()],
				["constructor", unsafeObject()],
				[
					"wrapper",
					{
						type: "object",
						properties: Object.fromEntries([
							["kept", { type: "string" }],
							["prototype", unsafeObject()],
						]),
					},
				],
			]),
		});

		expect(descriptors.map(({ name }) => name)).toEqual([
			"safe",
			"wrapper-kept",
		]);
	});

	it("rejects unsafe descriptors before either nested body writer", () => {
		const pollutionKey = "cfSchemaFlagsPolluted";
		const objectPrototype = Object.prototype as Record<string, unknown>;
		expect(Object.hasOwn(objectPrototype, pollutionKey)).toBe(false);

		try {
			for (const [segment, name] of [
				["__proto__", "unsafe-proto"],
				["constructor", "unsafe-constructor"],
				["prototype", "unsafe-prototype"],
			] as const) {
				const descriptor = {
					name,
					path: ["container", segment, pollutionKey],
					type: "string" as const,
					required: false,
					schema: { type: "string" },
				};
				for (const baseBody of [undefined, { container: {} }]) {
					const assembled = assembleBody(
						[descriptor],
						{ [name]: "yes" },
						{ baseBody }
					);

					expect(assembled).toEqual({
						body: baseBody ?? {},
						errors: [`Unknown flag --${name}`],
					});
					expect(Object.hasOwn(objectPrototype, pollutionKey)).toBe(false);
				}
			}
		} finally {
			Reflect.deleteProperty(objectPrototype, pollutionKey);
		}
	});

	it("preserves unsafe-looking data in ancestor flags and base bodies", () => {
		const pollutionKey = "cfSchemaFlagsAncestorPolluted";
		const objectPrototype = Object.prototype as Record<string, unknown>;
		const descriptors = schemaToFlags({
			type: "object",
			required: ["container"],
			properties: {
				container: {
					type: "object",
					properties: { safe: { type: "string" } },
				},
			},
		});
		const container = JSON.parse(
			`{"__proto__":{"${pollutionKey}":true}}`
		) as Record<string, unknown>;

		expect(
			assembleBody(descriptors, { container: JSON.stringify(container) })
		).toEqual({ body: { container }, errors: [] });
		expect(
			assembleBody(
				descriptors,
				{ "container-safe": "kept" },
				{ baseBody: { container } }
			)
		).toEqual({
			body: { container: { ...container, safe: "kept" } },
			errors: [],
		});
		expect(Object.hasOwn(objectPrototype, pollutionKey)).toBe(false);
	});

	it("does not read dynamic flag values through Object.prototype", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				to_string: { type: "string" },
			},
		});

		expect(descriptors.map(({ name }) => name)).toEqual(["to-string"]);
		expect(assembleBody(descriptors, {})).toEqual({ body: {}, errors: [] });
	});

	it.each(["toString", "constructor", "__proto__"])(
		"treats prototype-named body field %s as an additional property",
		(field) => {
			const body = Object.fromEntries([[field, "value"]]);
			expect(
				validateJsonSchema(
					{
						type: "object",
						properties: { safe: { type: "string" } },
						additionalProperties: false,
					},
					body
				)
			).toEqual([`\`/${field}\` is not allowed`]);
		}
	);

	it("identifies a field when its description only explains a condition", () => {
		const [descriptor] = schemaToFlags({
			type: "object",
			properties: {
				company_number: {
					type: "string",
					description:
						"Required when registrant_type is LTD, PLC, LLP, IP, SCH, or RCHAR",
				},
			},
		});

		expect(descriptor && renderPromptQuestion(descriptor)).toBe(
			"Company Number — Required when registrant_type is LTD, PLC, LLP, IP, SCH, or RCHAR"
		);
	});

	it("does not repeat a schema title in a prompt", () => {
		const [descriptor] = schemaToFlags({
			type: "object",
			properties: {
				registrant_type: { type: "string", title: "Registrant Type" },
			},
		});

		expect(descriptor && renderPromptQuestion(descriptor)).toBe(
			"Registrant Type"
		);
	});

	it("sanitizes terminal controls in runtime-schema prompt text", () => {
		const [descriptor] = schemaToFlags({
			type: "object",
			properties: {
				contact: {
					type: "string",
					title: "Contact\u001b\u202e\u2028\u2029 Name",
					description: "Legal\u0007\u2066\u2028\u2029 contact",
				},
			},
		});

		expect(
			sanitizeTerminalText("control\u001bformat\u202eline\u2028paragraph\u2029")
		).toBe("control format line paragraph ");
		expect(descriptor && renderPromptQuestion(descriptor)).toBe(
			"Contact     Name — Legal     contact"
		);
	});

	it("sanitizes direct enum values in help and validation errors", () => {
		const rawChoice = "LI\u001b\u202e\u2028\u2029MITED";
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				kind: {
					type: "string",
					description: "Registry\u001b\u202e\u2028\u2029 kind",
					enum: [rawChoice],
				},
			},
		});
		const help = renderFlagHelp(descriptors, "Fields");
		const error = descriptors[0] && validateFlagValue(descriptors[0], "other");

		for (const control of ["\u001b", "\u202e", "\u2028", "\u2029"]) {
			expect(help).not.toContain(control);
			expect(error).not.toContain(control);
		}
		expect(help).toContain("LI    MITED");
		expect(error).toContain("LI    MITED");
	});

	it("identifies described enum fields such as .us nexus choices", () => {
		const [descriptor] = schemaToFlags({
			type: "object",
			properties: {
				nexus_category: {
					title: "Nexus Category",
					description: "Identifies the registrant's relationship to the US",
					oneOf: [
						{ type: "string", const: "C11", title: "US Citizen" },
						{
							type: "string",
							const: "C12",
							title: "US Permanent Resident",
						},
						{
							type: "string",
							const: "C21",
							title: "US-incorporated Entity",
						},
						{
							type: "string",
							pattern: "^C31/[A-Z]{2}$",
							title:
								"Foreign entity with bona fide presence in US (country code required)",
						},
						{
							type: "string",
							pattern: "^C32/[A-Z]{2}$",
							title:
								"Foreign entity with regular activity in US (country code required)",
						},
					],
				},
			},
		});

		expect(descriptor?.choices).toBeUndefined();
		expect(descriptor && renderPromptQuestion(descriptor)).toBe(
			"Nexus Category — Identifies the registrant's relationship to the US"
		);
		expect(descriptor && validateFlagValue(descriptor, "C11")).toBeUndefined();
		expect(
			descriptor && validateFlagValue(descriptor, "C31/GB")
		).toBeUndefined();
		expect(descriptor && validateFlagValue(descriptor, "not-a-nexus")).toBe(
			"--nexus-category must be one of: C11 (US Citizen), C12 (US Permanent Resident), C21 (US-incorporated Entity), ^C31/[A-Z]{2}$ (Foreign entity with bona fide presence in US (country code required)), ^C32/[A-Z]{2}$ (Foreign entity with regular activity in US (country code required))"
		);
	});
	it("preserves a required object whose flattened children are optional", () => {
		const descriptors = schemaToFlags({
			type: "object",
			required: ["options"],
			properties: {
				options: {
					type: "object",
					properties: {
						colour: { type: "string" },
					},
				},
			},
		});

		expect(
			descriptors.map(({ name, required, requiredContainer }) => ({
				name,
				required,
				requiredContainer,
			}))
		).toEqual([
			{ name: "options", required: true, requiredContainer: true },
			{
				name: "options-colour",
				required: false,
				requiredContainer: undefined,
			},
		]);

		expect(assembleBody(descriptors, {}).errors).toEqual([
			"--options is required",
		]);
		expect(missingRequired(descriptors, {}).map(({ name }) => name)).toEqual([
			"options",
		]);
		expect(assembleBody(descriptors, { options: "{}" })).toEqual({
			body: { options: {} },
			errors: [],
		});
		expect(assembleBody(descriptors, { "options-colour": "orange" })).toEqual({
			body: { options: { colour: "orange" } },
			errors: [],
		});
		expect(
			missingRequired(descriptors, { "options-colour": "orange" })
		).toEqual([]);
	});

	it("requires nested fields when their optional container is supplied", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				contacts: {
					type: "object",
					required: ["email", "phone", "postal_info"],
					properties: {
						email: { type: "string" },
						phone: { type: "string" },
						postal_info: {
							type: "object",
							required: ["name"],
							properties: { name: { type: "string" } },
						},
					},
				},
			},
		});

		expect(
			descriptors.map(({ name, required, requiredWhen }) => ({
				name,
				required,
				requiredWhen,
			}))
		).toEqual([
			{
				name: "contacts-email",
				required: false,
				requiredWhen: ["contacts"],
			},
			{
				name: "contacts-phone",
				required: false,
				requiredWhen: ["contacts"],
			},
			{
				name: "contacts-postal-info-name",
				required: false,
				requiredWhen: ["contacts"],
			},
		]);
		expect(assembleBody(descriptors, {})).toEqual({ body: {}, errors: [] });

		const partial = { "contacts-email": "owner@example.com" };
		expect(assembleBody(descriptors, partial)).toEqual({
			body: { contacts: { email: "owner@example.com" } },
			errors: [
				"--contacts-phone is required",
				"--contacts-postal-info-name is required",
			],
		});
		expect(
			missingRequired(descriptors, partial).map(({ name }) => name)
		).toEqual(["contacts-phone", "contacts-postal-info-name"]);
		expect(
			missingRequiredFromBody(descriptors, { contacts: {} }).map(
				({ name }) => name
			)
		).toEqual([
			"contacts-email",
			"contacts-phone",
			"contacts-postal-info-name",
		]);
		expect(
			missingRequired(descriptors, {}, { contacts: {} }).map(({ name }) => name)
		).toEqual([
			"contacts-email",
			"contacts-phone",
			"contacts-postal-info-name",
		]);
		expect(
			missingRequiredFromBody(descriptors, {
				contacts: { email: null, postal_info: {} },
			}).map(({ name }) => name)
		).toEqual(["contacts-phone", "contacts-postal-info-name"]);

		const baseBody = {
			contacts: {
				email: "@owner",
				postal_info: {
					name: "Ada Lovelace",
					registry_localized_name: "Ada",
				},
				registry_contact_id: "contact-123",
			},
		};
		expect(
			assembleBody(
				descriptors,
				{ "contacts-phone": "+1.5555555555" },
				{ baseBody }
			)
		).toEqual({
			body: {
				contacts: {
					email: "@owner",
					phone: "+1.5555555555",
					postal_info: {
						name: "Ada Lovelace",
						registry_localized_name: "Ada",
					},
					registry_contact_id: "contact-123",
				},
			},
			errors: [],
		});
	});

	it("detects conditional containers inside object-valued ancestor flags", () => {
		const descriptors = schemaToFlags({
			type: "object",
			required: ["options"],
			properties: {
				options: {
					type: "object",
					properties: {
						child: {
							type: "object",
							required: ["name"],
							properties: { name: { type: "string" } },
						},
					},
				},
			},
		});

		expect(assembleBody(descriptors, { options: '{"child":{}}' })).toEqual({
			body: { options: { child: {} } },
			errors: ["--options-child-name is required"],
		});
		expect(
			missingRequired(descriptors, { options: { child: {} } }).map(
				({ name }) => name
			)
		).toEqual(["options-child-name"]);
		expect(
			assembleBody(descriptors, {
				options: '{"child":{"name":"value"}}',
			})
		).toEqual({
			body: { options: { child: { name: "value" } } },
			errors: [],
		});
		expect(
			missingRequired(descriptors, {
				options: { child: { name: "value" } },
			})
		).toEqual([]);
	});

	it("rejects fractions for integer fields but accepts them for numbers", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				years: { type: "integer" },
				ratio: { type: "number" },
			},
		});

		expect(assembleBody(descriptors, { years: "1.5", ratio: "1.5" })).toEqual({
			body: { ratio: 1.5 },
			errors: ["--years expects an integer (got '1.5')"],
		});
	});

	it("parses @file values for unconstrained JSON fields", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: { schema: {} },
		});
		const dir = mkdtempSync(join(tmpdir(), "cf-schema-flags-"));
		const path = join(dir, "schema.json");
		writeFileSync(path, JSON.stringify({ type: "object" }));

		expect(assembleBody(descriptors, { schema: `@${path}` })).toEqual({
			body: { schema: { type: "object" } },
			errors: [],
		});
	});

	it("enforces boolean enum constraints", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				acknowledged: { type: "boolean", enum: [true] },
			},
		});

		expect(assembleBody(descriptors, { acknowledged: true })).toEqual({
			body: { acknowledged: true },
			errors: [],
		});
		expect(assembleBody(descriptors, { acknowledged: false })).toEqual({
			body: { acknowledged: false },
			errors: ["--acknowledged must be one of: true"],
		});
	});

	it("derives coercion from untyped const and enum values", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				acknowledged: { const: true },
				priority: { enum: [1, 2] },
			},
		});

		expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
			{ name: "acknowledged", type: "boolean" },
			{ name: "priority", type: "number" },
		]);
		expect(
			assembleBody(descriptors, { acknowledged: "true", priority: "2" })
		).toEqual({
			body: { acknowledged: true, priority: 2 },
			errors: [],
		});
		expect(assembleBody(descriptors, { acknowledged: "false" })).toEqual({
			body: { acknowledged: false },
			errors: ["--acknowledged must be true"],
		});
	});

	it("validates enum constraints after resolving @file values", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				privacy_mode: { type: "string", enum: ["off"] },
			},
		});
		const dir = mkdtempSync(join(tmpdir(), "cf-schema-enum-"));
		const path = join(dir, "mode");
		writeFileSync(path, "off");

		expect(assembleBody(descriptors, { "privacy-mode": `@${path}` })).toEqual({
			body: { privacy_mode: "off" },
			errors: [],
		});
	});

	it("uses titled const alternatives as labelled wire-value choices", () => {
		const descriptors = schemaToFlags({
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
			},
		});

		expect(descriptors).toMatchObject([
			{
				name: "registrant-type",
				choices: ["LTD", "IND"],
				choiceLabels: {
					LTD: "UK Limited Company",
					IND: "UK Individual (representing self)",
				},
			},
		]);
		expect(assembleBody(descriptors, { "registrant-type": "IND" })).toEqual({
			body: { registrant_type: "IND" },
			errors: [],
		});
		expect(
			assembleBody(descriptors, { "registrant-type": "Personal" })
		).toEqual({
			body: { registrant_type: "Personal" },
			errors: ["--registrant-type must be one of: LTD, IND"],
		});
	});

	it("sanitizes terminal controls in runtime-schema choice labels", () => {
		const [descriptor] = schemaToFlags({
			type: "object",
			properties: {
				registrant_type: {
					oneOf: [
						{
							type: "string",
							const: "LTD",
							title: "Limited\u001b\u202e\u2028\u2029 Company",
						},
					],
				},
			},
		});

		expect(descriptor?.choiceLabels).toEqual({
			LTD: "Limited     Company",
		});
	});

	it("uses only own choice labels when rendering help", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				kind: {
					oneOf: [
						{ type: "string", const: "toString" },
						{ type: "string", const: "constructor" },
						{ type: "string", const: "__proto__" },
						{
							type: "string",
							const: "wire-value",
							title: "Friendly label",
						},
					],
				},
			},
		});

		expect(renderFlagHelp(descriptors, "Fields")).toContain(
			"[choices: toString, constructor, __proto__, Friendly label (wire-value)]"
		);
	});

	it("applies simple if/then required fields before submission", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				registrant_type: { type: "string" },
				company_number: { type: "string" },
			},
			allOf: [
				{
					if: {
						required: ["registrant_type"],
						properties: {
							registrant_type: { enum: ["LTD", "PLC"] },
						},
					},
					// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
					then: { required: ["company_number"] },
				},
			],
		});

		expect(missingRequired(descriptors, { "registrant-type": "IND" })).toEqual(
			[]
		);
		expect(
			missingRequired(descriptors, { "registrant-type": "LTD" }).map(
				({ name }) => name
			)
		).toEqual(["company-number"]);
		expect(assembleBody(descriptors, { "registrant-type": "LTD" })).toEqual({
			body: { registrant_type: "LTD" },
			errors: ["--company-number is required"],
		});
		expect(
			missingRequiredFromBody(descriptors, { registrant_type: "LTD" }).map(
				({ name }) => name
			)
		).toEqual(["company-number"]);
		expect(renderFlagHelp(descriptors, "Fields")).toContain("--company-number");
		expect(renderFlagHelp(descriptors, "Fields")).toContain(
			"[conditionally required]"
		);
	});

	it("extracts direct object-level if/then requirements", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				registrant_type: { type: "string" },
				company_number: { type: "string" },
			},
			if: {
				required: ["registrant_type"],
				properties: { registrant_type: { const: "LTD" } },
			},
			// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
			then: { required: ["company_number"] },
		});

		expect(
			missingRequired(descriptors, { "registrant-type": "LTD" }).map(
				({ name }) => name
			)
		).toEqual(["company-number"]);
		expect(
			missingRequiredFromBody(descriptors, { registrant_type: "LTD" }).map(
				({ name }) => name
			)
		).toEqual(["company-number"]);
		expect(
			missingRequiredFromBody(descriptors, { registrant_type: "IND" })
		).toEqual([]);
	});

	it("uses only own property schemas in conditional requirements", () => {
		const inheritedConditionProperties = Object.create({
			selector: { const: "advanced" },
		}) as Record<string, JsonSchema>;
		const presenceDescriptors = schemaToFlags({
			type: "object",
			properties: {
				selector: { type: "string" },
				detail: { type: "string" },
			},
			if: {
				required: ["selector"],
				properties: inheritedConditionProperties,
			},
			// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
			then: { required: ["detail"] },
		});

		expect(
			missingRequired(presenceDescriptors, { selector: "basic" }).map(
				({ name }) => name
			)
		).toEqual(["detail"]);

		const absentConsequentProperties = schemaToFlags({
			type: "object",
			properties: { selector: { type: "string" } },
			if: { required: ["selector"] },
			// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
			then: { properties: {}, required: ["toString"] },
		});

		expect(absentConsequentProperties.map(({ name }) => name)).toEqual([
			"selector",
		]);
	});

	it("surfaces optional then-only fields without weakening requirements", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: { kind: { type: "string" } },
			if: {
				required: ["kind"],
				properties: { kind: { const: "advanced" } },
			},
			// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
			then: {
				required: ["instructions"],
				properties: {
					instructions: { type: "string" },
					temperature: { type: "number", minimum: 0, maximum: 1 },
				},
			},
		});

		expect(
			descriptors.map(({ name, required, requiredIf }) => ({
				name,
				required,
				requiredIf,
			}))
		).toEqual([
			{
				name: "instructions",
				required: false,
				requiredIf: [
					{
						predicates: [{ path: ["kind"], values: ["advanced"] }],
					},
				],
			},
			{ name: "kind", required: false, requiredIf: undefined },
			{ name: "temperature", required: false, requiredIf: undefined },
		]);
		expect(
			assembleBody(descriptors, { kind: "advanced", temperature: "0.5" })
		).toEqual({
			body: { kind: "advanced", temperature: 0.5 },
			errors: ["--instructions is required"],
		});
	});

	it.each([
		{
			predicateSchema: { type: "boolean", const: true } satisfies JsonSchema,
			raw: "true",
			coerced: true,
		},
		{
			predicateSchema: { type: "number", enum: [2, 3] } satisfies JsonSchema,
			raw: "2",
			coerced: 2,
		},
	])(
		"coerces $predicateSchema.type conditional argv values",
		({ predicateSchema, raw, coerced }) => {
			const descriptors = schemaToFlags({
				type: "object",
				properties: {
					selector: predicateSchema,
					detail: { type: "string" },
				},
				if: {
					required: ["selector"],
					properties: { selector: predicateSchema },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: { required: ["detail"] },
			});

			expect(
				missingRequired(descriptors, { selector: raw }).map(({ name }) => name)
			).toEqual(["detail"]);
			expect(assembleBody(descriptors, { selector: raw })).toEqual({
				body: { selector: coerced },
				errors: ["--detail is required"],
			});
		}
	);

	it("does not coerce conditional values from a JSON base body", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				enabled: { type: "boolean" },
				detail: { type: "string" },
			},
			if: {
				required: ["enabled"],
				properties: { enabled: { const: true } },
			},
			// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
			then: { required: ["detail"] },
		});

		expect(missingRequired(descriptors, {}, { enabled: "true" })).toEqual([]);
	});

	it("coerces only exact conditional flags, not ancestor JSON flags", () => {
		const descriptors = schemaToFlags({
			type: "object",
			required: ["settings"],
			properties: {
				settings: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						detail: { type: "string" },
					},
					if: {
						required: ["enabled"],
						properties: { enabled: { const: true } },
					},
					// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
					then: { required: ["detail"] },
				},
			},
		});

		expect(
			missingRequired(descriptors, { settings: '{"enabled":"true"}' })
		).toEqual([]);
		expect(
			missingRequired(descriptors, { "settings-enabled": "true" }).map(
				({ name }) => name
			)
		).toEqual(["settings-detail"]);
	});

	it("does not overstate conditions that include unrepresented constraints", () => {
		for (const constraint of [
			{ pattern: "^y" },
			{ format: "email" },
		] as const) {
			const descriptors = schemaToFlags({
				type: "object",
				properties: {
					kind: { type: "string" },
					extra: { type: "string" },
				},
				if: {
					required: ["kind"],
					properties: { kind: { const: "x", ...constraint } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: { required: ["extra"] },
			} as JsonSchema);

			expect(missingRequired(descriptors, { kind: "x" })).toEqual([]);
		}
	});

	it("extracts if/then requirements through nested allOf members", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				registrant_type: { type: "string" },
				company_number: { type: "string" },
				charity_number: { type: "string" },
			},
			allOf: [
				{
					allOf: [
						{
							if: {
								required: ["registrant_type"],
								properties: { registrant_type: { const: "LTD" } },
							},
							// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
							then: { required: ["company_number"] },
						},
					],
				},
				{
					allOf: [
						{
							allOf: [
								{
									if: {
										required: ["registrant_type"],
										properties: {
											registrant_type: { const: "RCHAR" },
										},
									},
									// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
									then: { required: ["charity_number"] },
								},
							],
						},
					],
				},
			],
		});

		expect(
			descriptors.find(({ name }) => name === "company-number")?.requiredIf
		).toHaveLength(1);
		expect(
			descriptors.find(({ name }) => name === "charity-number")?.requiredIf
		).toHaveLength(1);
		expect(
			missingRequired(descriptors, { "registrant-type": "LTD" }).map(
				({ name }) => name
			)
		).toEqual(["company-number"]);
		expect(
			missingRequiredFromBody(descriptors, {
				registrant_type: "RCHAR",
			}).map(({ name }) => name)
		).toEqual(["charity-number"]);
	});

	it("surfaces conditional-only fields through nested allOf members", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				contact_extensions: {
					type: "object",
					properties: {
						registrant_type: { type: "string" },
					},
					allOf: [
						{
							allOf: [
								{
									if: {
										required: ["registrant_type"],
										properties: {
											registrant_type: { const: "LTD" },
										},
									},
									// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
									then: {
										allOf: [
											{
												required: ["company_number"],
												properties: {
													company_number: {
														allOf: [{ type: "string" }, { minLength: 2 }],
													},
													vat_number: { type: "string" },
												},
											},
										],
									},
								},
							],
						},
					],
				},
			},
		});

		expect(
			descriptors.map(({ name, required, requiredIf }) => ({
				name,
				required,
				requiredIf,
			}))
		).toEqual([
			{
				name: "contact-extensions-company-number",
				required: false,
				requiredIf: [
					{
						predicates: [
							{
								path: ["contact_extensions", "registrant_type"],
								values: ["LTD"],
							},
						],
					},
				],
			},
			{
				name: "contact-extensions-registrant-type",
				required: false,
				requiredIf: undefined,
			},
			{
				name: "contact-extensions-vat-number",
				required: false,
				requiredIf: undefined,
			},
		]);
		expect(
			assembleBody(descriptors, {
				"contact-extensions-registrant-type": "LTD",
				"contact-extensions-company-number": "12",
				"contact-extensions-vat-number": "GB123",
			})
		).toEqual({
			body: {
				contact_extensions: {
					registrant_type: "LTD",
					company_number: "12",
					vat_number: "GB123",
				},
			},
			errors: [],
		});
		expect(
			missingRequired(descriptors, {
				"contact-extensions-registrant-type": "LTD",
			}).map(({ name }) => name)
		).toEqual(["contact-extensions-company-number"]);
		expect(
			missingRequiredFromBody(descriptors, {
				contact_extensions: { registrant_type: "LTD" },
			}).map(({ name }) => name)
		).toEqual(["contact-extensions-company-number"]);
	});

	it("derives structural allOf fields as intersections", () => {
		const descriptors = schemaToFlags({
			allOf: [
				{
					type: "object",
					required: ["name"],
					properties: {
						name: { type: "string", minLength: 2 },
						category: { type: "string", enum: ["A", "B"] },
						tag: {
							allOf: [
								{ type: "string", enum: ["X", "Y"] },
								{ type: "string", enum: ["Y", "Z"] },
							],
						},
						profile: {
							allOf: [
								{
									type: "object",
									required: ["code"],
									properties: {
										code: { type: "string", pattern: "^[A-Z]+$" },
									},
								},
								{
									type: "object",
									properties: { region: { type: "string" } },
								},
							],
						},
					},
				},
				{
					type: "object",
					required: ["years"],
					properties: {
						name: { type: "string", maxLength: 3 },
						category: { type: "string", enum: ["B", "C"] },
						years: { type: "integer", minimum: 2 },
					},
				},
			],
		});

		expect(
			descriptors.map(({ name, type, required, requiredWhen, choices }) => ({
				name,
				type,
				required,
				requiredWhen,
				choices,
			}))
		).toEqual([
			{
				name: "name",
				type: "string",
				required: true,
				requiredWhen: undefined,
				choices: undefined,
			},
			{
				name: "years",
				type: "number",
				required: true,
				requiredWhen: undefined,
				choices: undefined,
			},
			{
				name: "category",
				type: "string",
				required: false,
				requiredWhen: undefined,
				choices: ["B"],
			},
			{
				name: "profile-code",
				type: "string",
				required: false,
				requiredWhen: ["profile"],
				choices: undefined,
			},
			{
				name: "profile-region",
				type: "string",
				required: false,
				requiredWhen: undefined,
				choices: undefined,
			},
			{
				name: "tag",
				type: "string",
				required: false,
				requiredWhen: undefined,
				choices: ["Y"],
			},
		]);

		const name = descriptors.find((descriptor) => descriptor.name === "name");
		const category = descriptors.find(
			(descriptor) => descriptor.name === "category"
		);
		if (!name || !category) {
			throw new Error("Expected intersected descriptors");
		}
		expect(validateFlagValue(name, "A")).toMatch(/at least 2 characters/);
		expect(validateFlagValue(name, "ABCD")).toMatch(/at most 3 characters/);
		expect(validateFlagValue(name, "ABC")).toBeUndefined();
		expect(validateFlagValue(category, "A")).toMatch(/one of: B/);
		expect(validateFlagValue(category, "B")).toBeUndefined();
		expect(
			missingRequired(descriptors, { "profile-region": "GB" }).map(
				({ name: descriptorName }) => descriptorName
			)
		).toEqual(["name", "years", "profile-code"]);
		expect(
			assembleBody(descriptors, {
				name: "ABC",
				years: "2",
				category: "B",
				tag: "Y",
				"profile-code": "UK",
				"profile-region": "GB",
			})
		).toEqual({
			body: {
				name: "ABC",
				years: 2,
				category: "B",
				tag: "Y",
				profile: { code: "UK", region: "GB" },
			},
			errors: [],
		});
	});

	it("validates common registrar schemas recursively", () => {
		const schema = {
			type: "object",
			required: ["domain_name", "contact_extensions"],
			additionalProperties: false,
			properties: {
				domain_name: {
					type: "string",
					minLength: 1,
					pattern: "^[a-z0-9-]+\\.[a-z]{2,}$",
				},
				contact_extensions: {
					type: "object",
					required: ["registrant_type"],
					additionalProperties: false,
					properties: {
						registrant_type: {
							oneOf: [
								{ type: "string", const: "LTD" },
								{ type: "string", const: "IND" },
							],
						},
						company_number: { type: "string", minLength: 2 },
					},
					allOf: [
						{
							if: {
								required: ["registrant_type"],
								properties: { registrant_type: { const: "LTD" } },
							},
							// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
							then: { required: ["company_number"] },
						},
					],
				},
			},
		};

		expect(
			validateJsonSchema(schema, {
				domain_name: "example.uk",
				contact_extensions: { registrant_type: "IND" },
			})
		).toEqual([]);
		expect(
			validateJsonSchema(schema, {
				domain_name: "not a domain",
				contact_extensions: {
					registrant_type: "LTD",
					unexpected: true,
				},
				extra: true,
			})
		).toEqual(
			expect.arrayContaining([
				"`/domain_name` does not match the required format (^[a-z0-9-]+\\.[a-z]{2,}$)",
				"`/contact_extensions/company_number` is required",
				"`/contact_extensions/unexpected` is not allowed",
				"`/extra` is not allowed",
			])
		);
	});

	it.each<{
		label: string;
		constraint: JsonSchema;
		accepted: number;
		rejected: number;
		message: string;
	}>([
		{
			label: "keeps minimum inclusive when exclusiveMinimum is false",
			constraint: {
				type: "number",
				minimum: -5,
				exclusiveMinimum: false,
			},
			accepted: -5,
			rejected: -6,
			message: "must be at least -5",
		},
		{
			label: "makes minimum exclusive when exclusiveMinimum is true",
			constraint: {
				type: "number",
				minimum: -5,
				exclusiveMinimum: true,
			},
			accepted: -4,
			rejected: -5,
			message: "must be greater than -5",
		},
		{
			label: "keeps numeric exclusiveMinimum as its own bound",
			constraint: { type: "number", exclusiveMinimum: -5 },
			accepted: -4,
			rejected: -5,
			message: "must be greater than -5",
		},
		{
			label: "keeps maximum inclusive when exclusiveMaximum is false",
			constraint: {
				type: "number",
				maximum: 5,
				exclusiveMaximum: false,
			},
			accepted: 5,
			rejected: 6,
			message: "must be at most 5",
		},
		{
			label: "makes maximum exclusive when exclusiveMaximum is true",
			constraint: {
				type: "number",
				maximum: 5,
				exclusiveMaximum: true,
			},
			accepted: 4,
			rejected: 5,
			message: "must be less than 5",
		},
		{
			label: "keeps numeric exclusiveMaximum as its own bound",
			constraint: { type: "number", exclusiveMaximum: 5 },
			accepted: 4,
			rejected: 5,
			message: "must be less than 5",
		},
	])(
		"$label for flags and complete bodies",
		({ constraint, accepted, rejected, message }) => {
			const schema: JsonSchema = {
				type: "object",
				properties: { value: constraint },
			};
			const [descriptor] = schemaToFlags(schema);
			if (!descriptor) {
				throw new Error("Expected a value descriptor");
			}

			expect(validateFlagValue(descriptor, accepted)).toBeUndefined();
			expect(validateJsonSchema(schema, { value: accepted })).toEqual([]);
			expect(validateFlagValue(descriptor, rejected)).toBe(
				`--value ${message}`
			);
			expect(validateJsonSchema(schema, { value: rejected })).toEqual([
				`\`/value\` ${message}`,
			]);
		}
	);

	it("counts Unicode code points consistently for flags and full bodies", () => {
		const schema = {
			type: "object",
			required: ["name"],
			properties: {
				name: { type: "string", minLength: 2, maxLength: 2 },
			},
		};
		const [name] = schemaToFlags(schema);
		if (!name) {
			throw new Error("Expected a name descriptor");
		}

		for (const [value, valid] of [
			["😀", false],
			["😀a", true],
			["😀😀", true],
			["😀😀a", false],
		] as const) {
			expect(validateFlagValue(name, value) === undefined).toBe(valid);
			expect(validateJsonSchema(schema, { name: value }).length === 0).toBe(
				valid
			);
		}
	});

	it("compares object and array const values structurally", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				metadata: {
					type: "object",
					const: { mode: "strict" },
				},
				formats: {
					type: "array",
					const: ["json", "text"],
				},
			},
		});

		expect(
			assembleBody(descriptors, {
				metadata: '{"mode":"strict"}',
				formats: '["json","text"]',
			})
		).toEqual({
			body: {
				metadata: { mode: "strict" },
				formats: ["json", "text"],
			},
			errors: [],
		});
		expect(assembleBody(descriptors, { metadata: '{"mode":"loose"}' })).toEqual(
			{
				body: { metadata: { mode: "loose" } },
				errors: ['--metadata must be {"mode":"strict"}'],
			}
		);
	});

	it("validates object, array and null enum values structurally", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				registrant: {
					type: "object",
					enum: [{ registrant_type: "individual" }],
				},
				labels: {
					type: "array",
					enum: [["travel", "industry"]],
				},
				unset: { enum: [null] },
			},
		});

		expect(
			assembleBody(descriptors, {
				registrant: '{"registrant_type":"individual"}',
				labels: '["travel","industry"]',
				unset: "null",
			})
		).toEqual({
			body: {
				registrant: { registrant_type: "individual" },
				labels: ["travel", "industry"],
				unset: null,
			},
			errors: [],
		});
		expect(
			assembleBody(descriptors, {
				registrant: '{"registrant_type":"company"}',
				labels: '["other"]',
				unset: "{}",
			})
		).toEqual({
			body: {
				registrant: { registrant_type: "company" },
				labels: ["other"],
				unset: {},
			},
			errors: [
				'--labels must be one of: ["travel","industry"]',
				'--registrant must be one of: {"registrant_type":"individual"}',
				"--unset must be one of: null",
			],
		});
	});

	it("identifies schemas that are safe for complete local validation", () => {
		expect(
			isFullySupportedJsonSchema({
				type: "object",
				properties: {
					options: {
						allOf: [
							{
								type: "array",
								items: {
									oneOf: [{ type: "string" }, { type: "number" }],
								},
							},
						],
					},
				},
			})
		).toBe(true);
		expect(
			isFullySupportedJsonSchema({
				type: "object",
				properties: {
					options: {
						oneOf: [
							{ type: "array" },
							{ type: "array", contains: { const: "required" } },
						],
					},
				},
			} as JsonSchema)
		).toBe(false);
		expect(
			isFullySupportedJsonSchema({
				type: "string",
				"x-nullable": true,
			} as JsonSchema)
		).toBe(false);
	});

	it("weakens an inexact oneOf rather than rejecting overlapping projections", () => {
		expect(
			validateSupportedJsonSchema(
				{
					oneOf: [
						{ type: "array", contains: { const: "required" } },
						{ type: "array", items: { type: "number" } },
					],
				} as JsonSchema,
				[1]
			)
		).toEqual([]);
	});

	it("does not narrow additional properties accepted by patternProperties", () => {
		expect(
			validateSupportedJsonSchema(
				{
					type: "object",
					patternProperties: { "^x-": { type: "string" } },
					additionalProperties: false,
				} as JsonSchema,
				{ "x-name": "accepted" }
			)
		).toEqual([]);
	});

	it("does not apply items to positions owned by unsupported prefixItems", () => {
		expect(
			validateSupportedJsonSchema(
				{
					type: "array",
					prefixItems: [{ type: "string" }],
					items: { type: "number" },
				} as JsonSchema,
				["prefix", 2]
			)
		).toEqual([]);
	});

	it("does not retain a type narrowed by OpenAPI nullable", () => {
		expect(
			validateSupportedJsonSchema(
				{ type: "string", nullable: true } as JsonSchema,
				null
			)
		).toEqual([]);
	});

	it("deduplicates identical conjunctive validation errors", () => {
		expect(
			validateJsonSchema(
				{
					type: "object",
					allOf: [{ required: ["name"] }, { required: ["name"] }],
				},
				{}
			)
		).toEqual(["`/name` is required"]);
	});

	it("coerces null-only fields to JSON null", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				unset: { type: "null" },
				removed: { type: ["null"] },
			},
		});

		expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
			{ name: "removed", type: "json" },
			{ name: "unset", type: "json" },
		]);
		expect(
			assembleBody(descriptors, { unset: "null", removed: "null" })
		).toEqual({
			body: { unset: null, removed: null },
			errors: [],
		});
		expect(assembleBody(descriptors, { unset: "value" })).toEqual({
			body: {},
			errors: ["--unset expects null (got 'value')"],
		});
	});

	it.each(["oneOf", "anyOf"] as const)(
		"preserves shared object fields alongside %s alternatives",
		(keyword) => {
			const schema: JsonSchema = {
				type: "object",
				required: ["domain_name", "strategy"],
				properties: {
					domain_name: { type: "string" },
					strategy: { type: "string", enum: ["safe"] },
				},
				[keyword]: [
					{
						type: "object",
						required: ["individual"],
						properties: {
							individual: { type: "string" },
							strategy: { maxLength: 5 },
						},
					},
					{
						type: "object",
						required: ["company"],
						properties: { company: { type: "string" } },
					},
				],
			};

			const descriptors = schemaToFlags(schema);
			expect(
				descriptors.map(({ name, required, choices }) => ({
					name,
					required,
					choices,
				}))
			).toEqual([
				{ name: "domain-name", required: true, choices: undefined },
				{ name: "strategy", required: true, choices: ["safe"] },
				{ name: "company", required: false, choices: undefined },
				{ name: "individual", required: false, choices: undefined },
			]);
			expect(assembleBody(descriptors, { individual: "Ada" })).toEqual({
				body: { individual: "Ada" },
				errors: ["--domain-name is required", "--strategy is required"],
			});
			expect(
				assembleBody(descriptors, {
					"domain-name": "example.test",
					strategy: "unsafe",
					individual: "Ada",
				}).errors
			).toEqual(["--strategy must be one of: safe"]);
		}
	);

	it.each([
		{ keyword: "oneOf", depth: 1 },
		{ keyword: "oneOf", depth: 3 },
		{ keyword: "anyOf", depth: 1 },
		{ keyword: "anyOf", depth: 3 },
	] as const)(
		"discovers $keyword alternatives at allOf depth $depth",
		({ keyword, depth }) => {
			let nested: JsonSchema = {
				[keyword]: [
					{
						type: "object",
						properties: { individual: { type: "string" } },
					},
					{
						type: "object",
						properties: { company: { type: "string" } },
					},
				],
			};
			for (let level = 0; level < depth; level++) {
				nested = { allOf: [nested] };
			}

			const descriptors = schemaToFlags(nested);
			expect(
				descriptors.map(({ name, required }) => ({ name, required }))
			).toEqual([
				{ name: "company", required: false },
				{ name: "individual", required: false },
			]);
			expect(assembleBody(descriptors, { individual: "Ada" })).toEqual({
				body: { individual: "Ada" },
				errors: [],
			});
		}
	);

	it("keeps alternative-only nested fields optional", () => {
		const descriptors = schemaToFlags({
			type: "object",
			required: ["contact"],
			properties: {
				contact: {
					type: "object",
					required: ["common"],
					properties: { common: { type: "string" } },
				},
			},
			oneOf: [
				{
					type: "object",
					properties: {
						contact: {
							type: "object",
							required: ["individual"],
							properties: { individual: { type: "string" } },
						},
					},
				},
				{
					type: "object",
					properties: {
						contact: {
							type: "object",
							required: ["company"],
							properties: { company: { type: "string" } },
						},
					},
				},
			],
		});

		expect(
			descriptors.map(({ name, required }) => ({ name, required }))
		).toEqual([
			{ name: "contact-common", required: true },
			{ name: "contact-company", required: false },
			{ name: "contact-individual", required: false },
		]);
		expect(assembleBody(descriptors, { "contact-common": "shared" })).toEqual({
			body: { contact: { common: "shared" } },
			errors: [],
		});
	});

	it("does not apply branch-specific constraints to repeated paths", () => {
		const descriptors = schemaToFlags({
			oneOf: [
				{
					type: "object",
					required: ["registrant_type"],
					properties: {
						registrant_type: {
							type: "string",
							enum: ["individual"],
							const: "individual",
							pattern: "^individual$",
						},
					},
				},
				{
					type: "object",
					required: ["registrant_type"],
					properties: {
						registrant_type: {
							type: "string",
							enum: ["company"],
							const: "company",
							pattern: "^company$",
						},
					},
				},
			],
		});

		expect(descriptors).toMatchObject([
			{
				name: "registrant-type",
				type: "string",
				required: false,
				choices: undefined,
				schema: { type: "string" },
			},
		]);
		expect(assembleBody(descriptors, { "registrant-type": "company" })).toEqual(
			{
				body: { registrant_type: "company" },
				errors: [],
			}
		);
	});

	it("accepts different types and nested fields from every branch", () => {
		const descriptors = schemaToFlags({
			anyOf: [
				{
					type: "object",
					properties: {
						value: { type: "string", pattern: "^text:" },
						options: {
							type: "object",
							properties: { individual: { type: "string" } },
						},
					},
				},
				{
					type: "object",
					properties: {
						value: { type: "number", minimum: 10 },
						options: {
							type: "object",
							properties: { company: { type: "string" } },
						},
					},
				},
			],
		});

		expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
			{ name: "options-company", type: "string" },
			{ name: "options-individual", type: "string" },
			{ name: "value", type: "json" },
		]);
		expect(
			assembleBody(descriptors, {
				"options-company": "Limited",
				value: "5",
			})
		).toEqual({
			body: { options: { company: "Limited" }, value: 5 },
			errors: [],
		});
	});

	it.each(["oneOf", "anyOf"] as const)(
		"merges conditional-only %s fields with sibling types in either branch order",
		(keyword) => {
			const conditionalBranch: JsonSchema = {
				type: "object",
				properties: {
					kind: { type: "string", const: "text" },
				},
				if: {
					required: ["kind"],
					properties: { kind: { const: "text" } },
				},
				// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
				then: {
					required: ["value"],
					properties: { value: { type: "string" } },
				},
			};
			const numericBranch: JsonSchema = {
				type: "object",
				properties: { value: { type: "number" } },
			};

			for (const variants of [
				[conditionalBranch, numericBranch],
				[numericBranch, conditionalBranch],
			]) {
				const descriptors = schemaToFlags({ [keyword]: variants });
				const value = descriptors.find(({ name }) => name === "value");

				expect(value).toMatchObject({ type: "json", required: false });
				expect(assembleBody(descriptors, { value: "42" })).toEqual({
					body: { value: 42 },
					errors: [],
				});
				expect(assembleBody(descriptors, { value: "plain text" })).toEqual({
					body: { value: "plain text" },
					errors: [],
				});
			}
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"defers %s alternative-local conditional requirements",
		(keyword) => {
			const schema: JsonSchema = {
				[keyword]: [
					{
						type: "object",
						required: ["kind"],
						properties: { kind: { type: "string", const: "company" } },
						if: {
							required: ["kind"],
							properties: { kind: { const: "company" } },
						},
						// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
						then: {
							required: ["company_number"],
							properties: { company_number: { type: "string" } },
						},
					},
					{
						type: "object",
						required: ["kind"],
						properties: { kind: { type: "string", const: "company" } },
					},
				],
			};

			const descriptors = schemaToFlags(schema);
			expect(
				descriptors.map(({ name, required, requiredIf }) => ({
					name,
					required,
					requiredIf,
				}))
			).toEqual([
				{
					name: "company-number",
					required: false,
					requiredIf: undefined,
				},
				{ name: "kind", required: false, requiredIf: undefined },
			]);
			const assembled = assembleBody(descriptors, { kind: "company" });
			expect(assembled).toEqual({ body: { kind: "company" }, errors: [] });
			expect(validateJsonSchema(schema, assembled.body)).toEqual([]);
		}
	);

	it("uses JSON coercion for heterogeneous scalar unions", () => {
		const descriptors = schemaToFlags({
			type: "object",
			properties: {
				value: {
					oneOf: [{ type: "string" }, { type: "number" }],
				},
			},
		});

		expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
			{ name: "value", type: "json" },
		]);
		expect(assembleBody(descriptors, { value: "42" })).toEqual({
			body: { value: 42 },
			errors: [],
		});
		expect(assembleBody(descriptors, { value: "forty-two" })).toEqual({
			body: { value: "forty-two" },
			errors: [],
		});
	});

	it.each(["oneOf", "anyOf"] as const)(
		"preserves the parent JSON flag for mixed scalar/object %s unions",
		(keyword) => {
			const schema: JsonSchema = {
				type: "object",
				properties: {
					value: {
						[keyword]: [
							{ type: "string" },
							{
								type: "object",
								required: ["name"],
								properties: { name: { type: "string" } },
							},
						],
					},
				},
			};
			const descriptors = schemaToFlags(schema);

			expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
				{ name: "value", type: "json" },
			]);

			const scalar = assembleBody(descriptors, { value: "plain text" });
			expect(scalar).toEqual({
				body: { value: "plain text" },
				errors: [],
			});
			expect(validateJsonSchema(schema, scalar.body)).toEqual([]);

			const object = assembleBody(descriptors, {
				value: '{"name":"Ada"}',
			});
			expect(object).toEqual({
				body: { value: { name: "Ada" } },
				errors: [],
			});
			expect(validateJsonSchema(schema, object.body)).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"continues flattening object-only %s unions",
		(keyword) => {
			const schema: JsonSchema = {
				type: "object",
				properties: {
					value: {
						[keyword]: [
							{
								type: "object",
								required: ["name"],
								properties: { name: { type: "string" } },
							},
							{
								type: "object",
								required: ["id"],
								properties: { id: { type: "integer" } },
							},
						],
					},
				},
			};
			const descriptors = schemaToFlags(schema);

			expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
				{ name: "value-id", type: "number" },
				{ name: "value-name", type: "string" },
			]);
			const assembled = assembleBody(descriptors, { "value-name": "Ada" });
			expect(assembled).toEqual({
				body: { value: { name: "Ada" } },
				errors: [],
			});
			expect(validateJsonSchema(schema, assembled.body)).toEqual([]);
		}
	);

	it.each([
		{
			types: ["object", "string"],
			raw: "plain text",
			expected: "plain text",
		},
		{ types: ["object", "null"], raw: "null", expected: null },
	] as const)(
		"preserves the parent JSON flag for type $types",
		({ types, raw, expected }) => {
			const schema: JsonSchema = {
				type: "object",
				properties: {
					value: {
						type: [...types],
						properties: { name: { type: "string" } },
					},
				},
			};
			const descriptors = schemaToFlags(schema);

			expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
				{ name: "value", type: "json" },
			]);
			const scalar = assembleBody(descriptors, { value: raw });
			expect(scalar).toEqual({ body: { value: expected }, errors: [] });
			expect(validateJsonSchema(schema, scalar.body)).toEqual([]);

			const object = assembleBody(descriptors, {
				value: '{"name":"Ada"}',
			});
			expect(object).toEqual({
				body: { value: { name: "Ada" } },
				errors: [],
			});
			expect(validateJsonSchema(schema, object.body)).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"preserves a mixed %s parent nested in allOf",
		(keyword) => {
			const schema: JsonSchema = {
				type: "object",
				properties: {
					value: {
						allOf: [
							{ properties: { shared: { type: "string" } } },
							{
								[keyword]: [
									{ type: "string" },
									{
										type: "object",
										properties: { name: { type: "string" } },
									},
								],
							},
						],
					},
				},
			};
			const descriptors = schemaToFlags(schema);

			expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
				{ name: "value", type: "json" },
			]);
			const scalar = assembleBody(descriptors, { value: "plain text" });
			expect(scalar).toEqual({
				body: { value: "plain text" },
				errors: [],
			});
			expect(validateJsonSchema(schema, scalar.body)).toEqual([]);

			const object = assembleBody(descriptors, {
				value: '{"name":"Ada","shared":"yes"}',
			});
			expect(object).toEqual({
				body: { value: { name: "Ada", shared: "yes" } },
				errors: [],
			});
			expect(validateJsonSchema(schema, object.body)).toEqual([]);
		}
	);

	it.each(["oneOf", "anyOf"] as const)(
		"does not treat type-less properties as object-only in %s",
		(keyword) => {
			const schema: JsonSchema = {
				type: "object",
				properties: {
					value: {
						[keyword]: [
							{
								required: ["name"],
								properties: { name: { type: "string" } },
							},
							{
								type: "object",
								required: ["id"],
								properties: { id: { type: "integer" } },
							},
						],
					},
				},
			};
			const descriptors = schemaToFlags(schema);

			expect(descriptors.map(({ name, type }) => ({ name, type }))).toEqual([
				{ name: "value", type: "json" },
			]);
			const scalar = assembleBody(descriptors, { value: "plain text" });
			expect(scalar).toEqual({
				body: { value: "plain text" },
				errors: [],
			});
			expect(validateJsonSchema(schema, scalar.body)).toEqual([]);

			const object = assembleBody(descriptors, { value: '{"id":7}' });
			expect(object).toEqual({
				body: { value: { id: 7 } },
				errors: [],
			});
			expect(validateJsonSchema(schema, object.body)).toEqual([]);
		}
	);
});
