import operation from "../../_operations/cloudforce-one/priority-intelligence/resolve.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * resolve command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one priority-intelligence resolve\n\nReturns the requirement and event query that saving `definition` would generate, using the account's current organization profile and topic. `resolved.issues` lists problems that would block saving, and `resolved.notices` inputs that would be ignored. Search events with `resolved.event_plan.branches`: a beta value for running searches, not a stable contract, which changes whenever a topic's event rules change. Show `resolved.event_plan.rules[].explanation` to explain matches. Send `resolved.based_on` with the save so it fails with 409 if the profile or topic changes in between. Nothing is saved, and no model is called."
		)
		.option("definition-additional-criteria", {
			type: "string",
			description:
				'The definition.additional_criteria field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"band": "highly" | "somewhat" | "not", "id": string, "text": string}].',
		})
		.option("definition-criterion-selections-add", {
			type: "string",
			array: true,
			description: "The definition.criterion_selections.add field",
		})
		.option("definition-criterion-selections-remove", {
			type: "string",
			array: true,
			description: "The definition.criterion_selections.remove field",
		})
		.option("definition-mode", {
			type: "string",
			description: "The definition.mode field",
			choices: ["managed", "custom"],
		})
		.coerce("definition-mode", (value) =>
			resolveFileToken(value, "definition-mode", "text")
		)
		.option("definition-question-mode", {
			type: "string",
			description: "The definition.question.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-question-mode", (value) =>
			resolveFileToken(value, "definition-question-mode", "text")
		)
		.option("definition-question-value", {
			type: "string",
			description: "The definition.question.value field",
		})
		.option("definition-schema-version", {
			type: "number",
			description: "The definition.schema_version field",
		})
		.option("definition-selections-actor-notes", {
			type: "string",
			description: "The definition.selections.actor_notes field",
		})
		.option("definition-selections-actor-types-mode", {
			type: "string",
			description: "The definition.selections.actor_types.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-actor-types-mode", (value) =>
			resolveFileToken(value, "definition-selections-actor-types-mode", "text")
		)
		.option("definition-selections-actor-types-value", {
			type: "string",
			array: true,
			description: "The definition.selections.actor_types.value field",
		})
		.option("definition-selections-actors-add", {
			type: "string",
			array: true,
			description: "The definition.selections.actors.add field",
		})
		.option("definition-selections-actors-remove", {
			type: "string",
			array: true,
			description: "The definition.selections.actors.remove field",
		})
		.option("definition-selections-attributed-countries", {
			type: "string",
			array: true,
			description: "The definition.selections.attributed_countries field",
		})
		.option("definition-selections-countries-mode", {
			type: "string",
			description: "The definition.selections.countries.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-countries-mode", (value) =>
			resolveFileToken(value, "definition-selections-countries-mode", "text")
		)
		.option("definition-selections-countries-value", {
			type: "string",
			array: true,
			description: "The definition.selections.countries.value field",
		})
		.option("definition-selections-cves", {
			type: "string",
			array: true,
			description: "The definition.selections.cves field",
		})
		.option("definition-selections-excluded-actors", {
			type: "string",
			array: true,
			description: "The definition.selections.excluded_actors field",
		})
		.option("definition-selections-key-suppliers-mode", {
			type: "string",
			description: "The definition.selections.key_suppliers.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-key-suppliers-mode", (value) =>
			resolveFileToken(
				value,
				"definition-selections-key-suppliers-mode",
				"text"
			)
		)
		.option("definition-selections-key-suppliers-value", {
			type: "string",
			description:
				'The definition.selections.key_suppliers.value field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "domains"?: [string]}]. ? marks optional keys.',
		})
		.option("definition-selections-malware-tools", {
			type: "string",
			array: true,
			description: "The definition.selections.malware_tools field",
		})
		.option("definition-selections-motivations-mode", {
			type: "string",
			description: "The definition.selections.motivations.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-motivations-mode", (value) =>
			resolveFileToken(value, "definition-selections-motivations-mode", "text")
		)
		.option("definition-selections-motivations-value", {
			type: "string",
			array: true,
			description: "The definition.selections.motivations.value field",
		})
		.option("definition-selections-peers-mode", {
			type: "string",
			description: "The definition.selections.peers.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-peers-mode", (value) =>
			resolveFileToken(value, "definition-selections-peers-mode", "text")
		)
		.option("definition-selections-peers-value", {
			type: "string",
			description:
				'The definition.selections.peers.value field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "domains"?: [string]}]. ? marks optional keys.',
		})
		.option("definition-selections-sectors-mode", {
			type: "string",
			description: "The definition.selections.sectors.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-sectors-mode", (value) =>
			resolveFileToken(value, "definition-selections-sectors-mode", "text")
		)
		.option("definition-selections-sectors-value", {
			type: "string",
			array: true,
			description: "The definition.selections.sectors.value field",
		})
		.option("definition-selections-targets-mode", {
			type: "string",
			description: "The definition.selections.targets.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-targets-mode", (value) =>
			resolveFileToken(value, "definition-selections-targets-mode", "text")
		)
		.option("definition-selections-targets-value", {
			type: "string",
			array: true,
			description: "The definition.selections.targets.value field",
		})
		.option("definition-selections-technique-ids", {
			type: "string",
			array: true,
			description: "The definition.selections.technique_ids field",
		})
		.option("definition-selections-technologies-mode", {
			type: "string",
			description: "The definition.selections.technologies.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-selections-technologies-mode", (value) =>
			resolveFileToken(value, "definition-selections-technologies-mode", "text")
		)
		.option("definition-selections-technologies-value", {
			type: "string",
			array: true,
			description: "The definition.selections.technologies.value field",
		})
		.option("definition-title-mode", {
			type: "string",
			description: "The definition.title.mode field",
			choices: ["inherit", "replace"],
		})
		.coerce("definition-title-mode", (value) =>
			resolveFileToken(value, "definition-title-mode", "text")
		)
		.option("definition-title-value", {
			type: "string",
			description: "The definition.title.value field",
		})
		.option("definition-topic-id", {
			type: "string",
			description: "The definition.topic_id field",
		})
		.option("definition-relevance-criteria", {
			type: "string",
			description:
				'The definition.relevance_criteria field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"band": "highly" | "somewhat" | "not", "id": string, "text": string}].',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("definition-additional-criteria", [
			"definition-relevance-criteria",
		])
		.implies("definition-additional-criteria", ["definition-topic-id"])
		.conflicts("definition-criterion-selections-add", [
			"definition-relevance-criteria",
		])
		.implies("definition-criterion-selections-add", ["definition-topic-id"])
		.conflicts("definition-criterion-selections-remove", [
			"definition-relevance-criteria",
		])
		.implies("definition-criterion-selections-remove", ["definition-topic-id"])
		.conflicts("definition-question-mode", ["definition-relevance-criteria"])
		.implies("definition-question-mode", ["definition-topic-id"])
		.conflicts("definition-question-value", ["definition-relevance-criteria"])
		.implies("definition-question-value", [
			"definition-question-mode",
			"definition-topic-id",
		])
		.implies("definition-selections-actor-types-value", [
			"definition-selections-actor-types-mode",
		])
		.implies("definition-selections-countries-value", [
			"definition-selections-countries-mode",
		])
		.implies("definition-selections-key-suppliers-value", [
			"definition-selections-key-suppliers-mode",
		])
		.implies("definition-selections-motivations-value", [
			"definition-selections-motivations-mode",
		])
		.implies("definition-selections-peers-value", [
			"definition-selections-peers-mode",
		])
		.implies("definition-selections-sectors-value", [
			"definition-selections-sectors-mode",
		])
		.implies("definition-selections-targets-value", [
			"definition-selections-targets-mode",
		])
		.implies("definition-selections-technologies-value", [
			"definition-selections-technologies-mode",
		])
		.conflicts("definition-title-mode", ["definition-relevance-criteria"])
		.implies("definition-title-mode", ["definition-topic-id"])
		.conflicts("definition-title-value", ["definition-relevance-criteria"])
		.implies("definition-title-value", [
			"definition-title-mode",
			"definition-topic-id",
		])
		.conflicts("definition-topic-id", ["definition-relevance-criteria"])
		.conflicts("definition-relevance-criteria", [
			"definition-additional-criteria",
			"definition-criterion-selections-add",
			"definition-criterion-selections-remove",
			"definition-question-mode",
			"definition-question-value",
			"definition-title-mode",
			"definition-title-value",
			"definition-topic-id",
		]);
}

type Args = InferArgs<typeof builder>;
const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["definition"],
		selector: "mode",
		variants: [
			{
				values: ["managed"],
				schema: {
					type: "object",
					properties: {
						additional_criteria: {
							type: "array",
							items: {
								type: "object",
								properties: {
									band: { enum: ["highly", "somewhat", "not"] },
									id: { type: "string" },
									text: { type: "string" },
								},
								required: ["band", "id", "text"],
								additionalProperties: false,
							},
							maxItems: 20,
						},
						criterion_selections: {
							type: "object",
							properties: {
								add: { type: "array", items: { type: "string" }, maxItems: 50 },
								remove: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
							},
							required: [],
							additionalProperties: false,
						},
						mode: { enum: ["managed"] },
						question: {
							anyOf: [
								{
									type: "object",
									properties: { mode: { enum: ["inherit"] } },
									required: ["mode"],
									additionalProperties: false,
								},
								{
									type: "object",
									properties: {
										mode: { enum: ["replace"] },
										value: { type: "string" },
									},
									required: ["mode", "value"],
									additionalProperties: false,
								},
							],
						},
						schema_version: { enum: [1] },
						selections: {
							type: "object",
							properties: {
								actor_notes: { type: "string" },
								actor_types: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"nation-state",
															"crime-syndicate",
															"criminal",
															"activist",
															"hacker",
															"insider-disgruntled",
															"insider-accidental",
															"spy",
															"terrorist",
															"competitor",
															"sensationalist",
														],
													},
													maxItems: 11,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								actors: {
									type: "object",
									properties: {
										add: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
										remove: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
									},
									required: [],
									additionalProperties: false,
								},
								attributed_countries: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								countries: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								cves: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								excluded_actors: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								key_suppliers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								malware_tools: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								motivations: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"personal-gain",
															"organizational-gain",
															"ideology",
															"dominance",
															"notoriety",
															"coercion",
															"revenge",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								peers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								sectors: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"aerospace",
															"agriculture",
															"automotive",
															"chemical",
															"commercial",
															"communications",
															"construction",
															"defense",
															"education",
															"energy",
															"entertainment",
															"financial-services",
															"government-local",
															"government-national",
															"government-public-services",
															"government-regional",
															"healthcare",
															"hospitality-leisure",
															"infrastructure",
															"insurance",
															"manufacturing",
															"mining",
															"non-profit",
															"pharmaceuticals",
															"professional-services",
															"retail",
															"technology",
															"telecommunications",
															"transportation",
															"utilities",
														],
													},
													maxItems: 10,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								targets: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"organization",
															"customers",
															"employees",
															"executives",
															"partners",
															"events",
															"products-infrastructure",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								technique_ids: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								technologies: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
							},
							required: [],
							additionalProperties: false,
						},
						title: {
							anyOf: [
								{
									type: "object",
									properties: { mode: { enum: ["inherit"] } },
									required: ["mode"],
									additionalProperties: false,
								},
								{
									type: "object",
									properties: {
										mode: { enum: ["replace"] },
										value: { type: "string" },
									},
									required: ["mode", "value"],
									additionalProperties: false,
								},
							],
						},
						topic_id: { type: "string" },
					},
					required: ["mode", "schema_version", "topic_id"],
					additionalProperties: false,
				},
			},
			{
				values: ["custom"],
				schema: {
					type: "object",
					properties: {
						mode: { enum: ["custom"] },
						question: { type: "string" },
						relevance_criteria: {
							type: "array",
							items: {
								type: "object",
								properties: {
									band: { enum: ["highly", "somewhat", "not"] },
									id: { type: "string" },
									text: { type: "string" },
								},
								required: ["band", "id", "text"],
								additionalProperties: false,
							},
							maxItems: 30,
						},
						schema_version: { enum: [1] },
						selections: {
							type: "object",
							properties: {
								actor_notes: { type: "string" },
								actor_types: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"nation-state",
															"crime-syndicate",
															"criminal",
															"activist",
															"hacker",
															"insider-disgruntled",
															"insider-accidental",
															"spy",
															"terrorist",
															"competitor",
															"sensationalist",
														],
													},
													maxItems: 11,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								actors: {
									type: "object",
									properties: {
										add: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
										remove: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
									},
									required: [],
									additionalProperties: false,
								},
								attributed_countries: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								countries: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								cves: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								excluded_actors: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								key_suppliers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								malware_tools: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								motivations: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"personal-gain",
															"organizational-gain",
															"ideology",
															"dominance",
															"notoriety",
															"coercion",
															"revenge",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								peers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								sectors: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"aerospace",
															"agriculture",
															"automotive",
															"chemical",
															"commercial",
															"communications",
															"construction",
															"defense",
															"education",
															"energy",
															"entertainment",
															"financial-services",
															"government-local",
															"government-national",
															"government-public-services",
															"government-regional",
															"healthcare",
															"hospitality-leisure",
															"infrastructure",
															"insurance",
															"manufacturing",
															"mining",
															"non-profit",
															"pharmaceuticals",
															"professional-services",
															"retail",
															"technology",
															"telecommunications",
															"transportation",
															"utilities",
														],
													},
													maxItems: 10,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								targets: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"organization",
															"customers",
															"employees",
															"executives",
															"partners",
															"events",
															"products-infrastructure",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								technique_ids: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								technologies: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
							},
							required: [],
							additionalProperties: false,
						},
						title: { type: "string" },
					},
					required: [
						"mode",
						"question",
						"relevance_criteria",
						"schema_version",
						"title",
					],
					additionalProperties: false,
				},
			},
		],
	},
];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "resolve",
	describe: "Resolve structured PIR answers without saving",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence resolve",
				classification: {
					safeFlags: [
						"definition-mode",
						"definition-question-mode",
						"definition-selections-actor-types-mode",
						"definition-selections-countries-mode",
						"definition-selections-key-suppliers-mode",
						"definition-selections-motivations-mode",
						"definition-selections-peers-mode",
						"definition-selections-sectors-mode",
						"definition-selections-targets-mode",
						"definition-selections-technologies-mode",
						"definition-title-mode",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence resolve",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/resolve`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: validateBodyUnions(
										compactBody({
											definition: {
												additional_criteria: parseObjectArray(
													argv["definition-additional-criteria"],
													"definition-additional-criteria"
												),
												criterion_selections: {
													add: argv["definition-criterion-selections-add"],
													remove:
														argv["definition-criterion-selections-remove"],
												},
												mode: argv["definition-mode"],
												question: {
													mode: argv["definition-question-mode"],
													value: resolveFileToken(
														argv["definition-question-value"] as
															| string
															| undefined,
														"definition-question-value",
														"text"
													),
												},
												schema_version: argv["definition-schema-version"],
												selections: {
													actor_notes: resolveFileToken(
														argv["definition-selections-actor-notes"] as
															| string
															| undefined,
														"definition-selections-actor-notes",
														"text"
													),
													actor_types: {
														mode: argv[
															"definition-selections-actor-types-mode"
														],
														value:
															argv["definition-selections-actor-types-value"],
													},
													actors: {
														add: argv["definition-selections-actors-add"],
														remove: argv["definition-selections-actors-remove"],
													},
													attributed_countries:
														argv["definition-selections-attributed-countries"],
													countries: {
														mode: argv["definition-selections-countries-mode"],
														value:
															argv["definition-selections-countries-value"],
													},
													cves: argv["definition-selections-cves"],
													excluded_actors:
														argv["definition-selections-excluded-actors"],
													key_suppliers: {
														mode: argv[
															"definition-selections-key-suppliers-mode"
														],
														value: parseObjectArray(
															argv["definition-selections-key-suppliers-value"],
															"definition-selections-key-suppliers-value"
														),
													},
													malware_tools:
														argv["definition-selections-malware-tools"],
													motivations: {
														mode: argv[
															"definition-selections-motivations-mode"
														],
														value:
															argv["definition-selections-motivations-value"],
													},
													peers: {
														mode: argv["definition-selections-peers-mode"],
														value: parseObjectArray(
															argv["definition-selections-peers-value"],
															"definition-selections-peers-value"
														),
													},
													sectors: {
														mode: argv["definition-selections-sectors-mode"],
														value: argv["definition-selections-sectors-value"],
													},
													targets: {
														mode: argv["definition-selections-targets-mode"],
														value: argv["definition-selections-targets-value"],
													},
													technique_ids:
														argv["definition-selections-technique-ids"],
													technologies: {
														mode: argv[
															"definition-selections-technologies-mode"
														],
														value:
															argv["definition-selections-technologies-value"],
													},
												},
												title: {
													mode: argv["definition-title-mode"],
													value: resolveFileToken(
														argv["definition-title-value"] as
															| string
															| undefined,
														"definition-title-value",
														"text"
													),
												},
												topic_id: resolveFileToken(
													argv["definition-topic-id"] as string | undefined,
													"definition-topic-id",
													"text"
												),
												relevance_criteria: parseObjectArray(
													argv["definition-relevance-criteria"],
													"definition-relevance-criteria"
												),
											},
										}),
										bodyUnions
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["definition-mode"] === undefined) {
					argv["definition-mode"] = await promptForRequiredEnumField(
						"definition-mode",
						"The definition.mode field",
						["managed", "custom"] as const
					);
				}
				if (argv["definition-schema-version"] === undefined) {
					throw new Error(
						"--definition-schema-version is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					definition: {
						additional_criteria: parseObjectArray(
							argv["definition-additional-criteria"],
							"definition-additional-criteria"
						),
						criterion_selections: {
							add: argv["definition-criterion-selections-add"],
							remove: argv["definition-criterion-selections-remove"],
						},
						mode: argv["definition-mode"],
						question: {
							mode: argv["definition-question-mode"],
							value: resolveFileToken(
								argv["definition-question-value"] as string | undefined,
								"definition-question-value",
								"text"
							),
						},
						schema_version: argv["definition-schema-version"],
						selections: {
							actor_notes: resolveFileToken(
								argv["definition-selections-actor-notes"] as string | undefined,
								"definition-selections-actor-notes",
								"text"
							),
							actor_types: {
								mode: argv["definition-selections-actor-types-mode"],
								value: argv["definition-selections-actor-types-value"],
							},
							actors: {
								add: argv["definition-selections-actors-add"],
								remove: argv["definition-selections-actors-remove"],
							},
							attributed_countries:
								argv["definition-selections-attributed-countries"],
							countries: {
								mode: argv["definition-selections-countries-mode"],
								value: argv["definition-selections-countries-value"],
							},
							cves: argv["definition-selections-cves"],
							excluded_actors: argv["definition-selections-excluded-actors"],
							key_suppliers: {
								mode: argv["definition-selections-key-suppliers-mode"],
								value: parseObjectArray(
									argv["definition-selections-key-suppliers-value"],
									"definition-selections-key-suppliers-value"
								),
							},
							malware_tools: argv["definition-selections-malware-tools"],
							motivations: {
								mode: argv["definition-selections-motivations-mode"],
								value: argv["definition-selections-motivations-value"],
							},
							peers: {
								mode: argv["definition-selections-peers-mode"],
								value: parseObjectArray(
									argv["definition-selections-peers-value"],
									"definition-selections-peers-value"
								),
							},
							sectors: {
								mode: argv["definition-selections-sectors-mode"],
								value: argv["definition-selections-sectors-value"],
							},
							targets: {
								mode: argv["definition-selections-targets-mode"],
								value: argv["definition-selections-targets-value"],
							},
							technique_ids: argv["definition-selections-technique-ids"],
							technologies: {
								mode: argv["definition-selections-technologies-mode"],
								value: argv["definition-selections-technologies-value"],
							},
						},
						title: {
							mode: argv["definition-title-mode"],
							value: resolveFileToken(
								argv["definition-title-value"] as string | undefined,
								"definition-title-value",
								"text"
							),
						},
						topic_id: resolveFileToken(
							argv["definition-topic-id"] as string | undefined,
							"definition-topic-id",
							"text"
						),
						relevance_criteria: parseObjectArray(
							argv["definition-relevance-criteria"],
							"definition-relevance-criteria"
						),
					},
				});
				validateBodyUnions(bodyData, bodyUnions);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
