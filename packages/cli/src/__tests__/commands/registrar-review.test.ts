import { describe, expect, it } from "vitest";
import { renderRegistrationReview } from "../../commands/registrar/registrations/create/review.js";

describe("registrar registration review", () => {
	it("finds setting defaults through nested allOf schemas", () => {
		const output = renderRegistrationReview({
			domain: "example.test",
			accountId: "test-account",
			years: 1,
			quotedCost: "USD 10.00",
			pricing: {
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
			body: { domain_name: "example.test" },
			schema: {
				allOf: [
					{
						allOf: [
							{
								properties: {
									auto_renew: { type: "boolean", default: true },
								},
							},
						],
					},
					{
						properties: {
							privacy_mode: {
								type: "string",
								allOf: [{ default: "redaction" }],
							},
						},
					},
				],
			},
		});

		expect(output).toMatch(/Auto-renew\s+Yes \(default\)/);
		expect(output).toMatch(/Privacy mode\s+redaction \(default\)/);
	});

	it("falls back to API defaults when nested allOf defaults conflict", () => {
		const output = renderRegistrationReview({
			domain: "example.test",
			accountId: "test-account",
			years: 1,
			quotedCost: "USD 10.00",
			pricing: {
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
			body: { domain_name: "example.test" },
			schema: {
				properties: {
					auto_renew: { type: "boolean", default: true },
					privacy_mode: {
						type: "string",
						allOf: [{ default: "redaction" }, { allOf: [{ default: "none" }] }],
					},
				},
				allOf: [
					{
						allOf: [
							{
								properties: {
									auto_renew: {
										type: "boolean",
										default: false,
									},
								},
							},
						],
					},
				],
			},
		});

		expect(output).toMatch(/Auto-renew\s+API default/);
		expect(output).toMatch(/Privacy mode\s+API default/);
	});

	it("neutralises control and format characters in schema labels and body values", () => {
		const output = renderRegistrationReview({
			domain: "example.test",
			accountId: "test-account",
			years: 1,
			quotedCost: "USD 10.00",
			pricing: {
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
			body: {
				domain_name: "example.test",
				contact_extensions: {
					note: "value\nInjected\u001B]52;c;value\u0007\u009B31m\u202Ehidden",
				},
			},
			descriptors: [
				{
					name: "contact-extensions-note",
					path: ["contact_extensions", "note"],
					type: "string",
					required: false,
					schema: {
						type: "string",
						title:
							"Field\nInjected\u001B]52;c;label\u0007\u009B31m\u2066hidden",
					},
				},
			],
		});

		expect(output).not.toContain("Field\nInjected");
		expect(output).not.toContain("value\nInjected");
		expect(output).not.toContain("\u001B]52");
		expect(output).not.toContain("\u0007");
		expect(output).not.toContain("\u009B31m");
		expect(output).not.toContain("\u202E");
		expect(output).not.toContain("\u2066");
		expect(output).toContain(
			"Registry Details · Field Injected ]52;c;label  31m hidden"
		);
		expect(output).toContain("value Injected ]52;c;value  31m hidden");
	});

	it("neutralises Unicode line and paragraph separators", () => {
		const output = renderRegistrationReview({
			domain: "example.test",
			accountId: "test-account",
			years: 1,
			quotedCost: "USD 10.00",
			pricing: {
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
			body: {
				domain_name: "example.test",
				contact_extensions: {
					note: "line\u2028paragraph\u2029value",
				},
			},
			descriptors: [
				{
					name: "contact-extensions-note",
					path: ["contact_extensions", "note"],
					type: "string",
					required: false,
					schema: {
						type: "string",
						title: "Line\u2028Paragraph\u2029Label",
					},
				},
			],
		});

		expect(output).not.toContain("\u2028");
		expect(output).not.toContain("\u2029");
		expect(output).toContain(
			"Registry Details · Line Paragraph Label  line paragraph value"
		);
	});

	it("does not inherit enum or field labels from Object.prototype", () => {
		const output = renderRegistrationReview({
			domain: "example.test",
			accountId: "test-account",
			years: 1,
			quotedCost: "USD 10.00",
			pricing: {
				currency: "USD",
				registration_cost: "10.00",
				renewal_cost: "8.00",
			},
			body: {
				domain_name: "example.test",
				contact_extensions: { toString: "toString" },
			},
			descriptors: [
				{
					name: "contact-extensions-to-string",
					path: ["contact_extensions", "toString"],
					type: "string",
					required: false,
					choices: ["person", "toString"],
					choiceLabels: { person: "Individual" },
					schema: { type: "string" },
				},
			],
		});

		expect(output).toMatch(/Registry Details · To String\s+toString/);
		expect(output).not.toContain("function toString");
	});
});
