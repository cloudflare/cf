import operation from "../../_operations/cloudforce-one/priority-intelligence/update.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseNestedArray,
	parseObjectArray,
} from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["dataset_scope"],
		selector: "type",
		variants: [
			{
				values: ["default"],
				schema: {
					type: "object",
					properties: { type: { enum: ["default"] } },
					required: ["type"],
					additionalProperties: false,
				},
			},
			{
				values: ["datasets"],
				schema: {
					type: "object",
					properties: {
						dataset_ids: {
							type: "array",
							items: { type: "string" },
							maxItems: 50,
						},
						type: { enum: ["datasets"] },
					},
					required: ["dataset_ids", "type"],
					additionalProperties: false,
				},
			},
		],
	},
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

const command = apiCommand({
	command: "update <priority-id>",
	describe: "Update a priority intelligence requirement",
	usage:
		"$0 cloudforce-one priority-intelligence update <priority-id>\n\nUpdates a Priority Intelligence Requirement for the authenticated account. Changing the query increments its version; editing the requirement without saving a query marks the query stale. Activating a draft needs a free slot in the active PIR quota; setting `active` on a PIR the matcher paused resumes it without one. Updates to a structured PIR must send its `revision` and change its answers through `definition`; its requirement, title and query are generated. Sending a `definition` and `revision` for a free-form PIR converts it in place: it keeps its ID, status, labels, priority, TLP and match history, and its query, dataset scope and notifications are removed, since structured PIRs are not matched by the PIR matcher and send no notifications. A conversion must not send a `dataset_scope`.",
	flags: {
		"based-on-profile-revision": {
			kind: "parsed",
			brief: "The based_on.profile_revision field",
			optional: true,
			parse: Number,
		},
		"based-on-topic-fingerprint": {
			kind: "parsed",
			brief: "The based_on.topic_fingerprint field",
			optional: true,
			parse: String,
		},
		"confirm-query": {
			kind: "boolean",
			brief:
				"Write-only. `true` confirms the query still fits the requirement, clearing `query_stale` without changing the query or its version. Requires a query.",
			optional: true,
		},
		"dataset-scope-type": {
			kind: "parsed",
			brief: "The dataset_scope.type field",
			optional: true,
			choices: ["default", "datasets"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "dataset-scope-type", "text"),
		},
		"dataset-scope-dataset-ids": {
			kind: "parsed",
			brief: "The dataset_scope.dataset_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-additional-criteria": {
			kind: "parsed",
			brief:
				'The definition.additional_criteria field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"band": "highly" | "somewhat" | "not", "id": string, "text": string}].',
			optional: true,
			parse: String,
		},
		"definition-criterion-selections-add": {
			kind: "parsed",
			brief: "The definition.criterion_selections.add field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-criterion-selections-remove": {
			kind: "parsed",
			brief: "The definition.criterion_selections.remove field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-mode": {
			kind: "parsed",
			brief: "The definition.mode field",
			optional: true,
			choices: ["managed", "custom"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-mode", "text"),
		},
		"definition-question-mode": {
			kind: "parsed",
			brief: "The definition.question.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-question-mode", "text"),
		},
		"definition-question-value": {
			kind: "parsed",
			brief: "The definition.question.value field",
			optional: true,
			parse: String,
		},
		"definition-schema-version": {
			kind: "parsed",
			brief: "The definition.schema_version field",
			optional: true,
			parse: Number,
		},
		"definition-selections-actor-notes": {
			kind: "parsed",
			brief: "The definition.selections.actor_notes field",
			optional: true,
			parse: String,
		},
		"definition-selections-actor-types-mode": {
			kind: "parsed",
			brief: "The definition.selections.actor_types.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"definition-selections-actor-types-mode",
					"text"
				),
		},
		"definition-selections-actor-types-value": {
			kind: "parsed",
			brief: "The definition.selections.actor_types.value field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-actors-add": {
			kind: "parsed",
			brief: "The definition.selections.actors.add field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-actors-remove": {
			kind: "parsed",
			brief: "The definition.selections.actors.remove field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-attributed-countries": {
			kind: "parsed",
			brief: "The definition.selections.attributed_countries field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-countries-mode": {
			kind: "parsed",
			brief: "The definition.selections.countries.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-selections-countries-mode", "text"),
		},
		"definition-selections-countries-value": {
			kind: "parsed",
			brief: "The definition.selections.countries.value field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-cves": {
			kind: "parsed",
			brief: "The definition.selections.cves field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-excluded-actors": {
			kind: "parsed",
			brief: "The definition.selections.excluded_actors field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-key-suppliers-mode": {
			kind: "parsed",
			brief: "The definition.selections.key_suppliers.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"definition-selections-key-suppliers-mode",
					"text"
				),
		},
		"definition-selections-key-suppliers-value": {
			kind: "parsed",
			brief:
				'The definition.selections.key_suppliers.value field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "domains"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"definition-selections-malware-tools": {
			kind: "parsed",
			brief: "The definition.selections.malware_tools field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-motivations-mode": {
			kind: "parsed",
			brief: "The definition.selections.motivations.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"definition-selections-motivations-mode",
					"text"
				),
		},
		"definition-selections-motivations-value": {
			kind: "parsed",
			brief: "The definition.selections.motivations.value field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-peers-mode": {
			kind: "parsed",
			brief: "The definition.selections.peers.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-selections-peers-mode", "text"),
		},
		"definition-selections-peers-value": {
			kind: "parsed",
			brief:
				'The definition.selections.peers.value field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "domains"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"definition-selections-sectors-mode": {
			kind: "parsed",
			brief: "The definition.selections.sectors.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-selections-sectors-mode", "text"),
		},
		"definition-selections-sectors-value": {
			kind: "parsed",
			brief: "The definition.selections.sectors.value field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-targets-mode": {
			kind: "parsed",
			brief: "The definition.selections.targets.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-selections-targets-mode", "text"),
		},
		"definition-selections-targets-value": {
			kind: "parsed",
			brief: "The definition.selections.targets.value field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-technique-ids": {
			kind: "parsed",
			brief: "The definition.selections.technique_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-selections-technologies-mode": {
			kind: "parsed",
			brief: "The definition.selections.technologies.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"definition-selections-technologies-mode",
					"text"
				),
		},
		"definition-selections-technologies-value": {
			kind: "parsed",
			brief: "The definition.selections.technologies.value field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"definition-title-mode": {
			kind: "parsed",
			brief: "The definition.title.mode field",
			optional: true,
			choices: ["inherit", "replace"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "definition-title-mode", "text"),
		},
		"definition-title-value": {
			kind: "parsed",
			brief: "The definition.title.value field",
			optional: true,
			parse: String,
		},
		"definition-topic-id": {
			kind: "parsed",
			brief: "The definition.topic_id field",
			optional: true,
			parse: String,
		},
		"definition-relevance-criteria": {
			kind: "parsed",
			brief:
				'The definition.relevance_criteria field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"band": "highly" | "somewhat" | "not", "id": string, "text": string}].',
			optional: true,
			parse: String,
		},
		"digest-interval-hours": {
			kind: "parsed",
			brief:
				"Hours between digests: 6, 12, or 24. Used only when `notification_mode` is `digest`.",
			optional: true,
			parse: Number,
		},
		"intent-clauses": {
			kind: "parsed",
			brief:
				'The intent.clauses field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"actors": [string], "attacker_countries": [string], "categories": [string], "cves": [string], "keywords": [string], ...more}].',
			optional: true,
			parse: String,
		},
		"intent-exclusions-actors": {
			kind: "parsed",
			brief: "The intent.exclusions.actors field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-attacker-countries": {
			kind: "parsed",
			brief: "The intent.exclusions.attacker_countries field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-categories": {
			kind: "parsed",
			brief: "The intent.exclusions.categories field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-cves": {
			kind: "parsed",
			brief: "The intent.exclusions.cves field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-keywords": {
			kind: "parsed",
			brief: "The intent.exclusions.keywords field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-target-countries": {
			kind: "parsed",
			brief: "The intent.exclusions.target_countries field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-target-industries": {
			kind: "parsed",
			brief: "The intent.exclusions.target_industries field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-exclusions-techniques": {
			kind: "parsed",
			brief: "The intent.exclusions.techniques field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-indicators": {
			kind: "parsed",
			brief: "The intent.indicators field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"intent-unsupported-terms": {
			kind: "parsed",
			brief: "The intent.unsupported_terms field",
			variadic: true,
			optional: true,
			parse: String,
		},
		labels: {
			kind: "parsed",
			brief: "The labels field",
			variadic: true,
			optional: true,
			parse: String,
		},
		model: {
			kind: "parsed",
			brief: "The model field",
			optional: true,
			parse: String,
		},
		"notification-mode": {
			kind: "parsed",
			brief:
				"`none` or `digest`. Notifications are opt-in. `immediate` is reserved and currently rejected.",
			optional: true,
			choices: ["none", "immediate", "digest"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "notification-mode", "text"),
		},
		priority: {
			kind: "parsed",
			brief: "The priority field",
			optional: true,
			parse: Number,
		},
		"query-branches": {
			kind: "parsed",
			brief:
				'Event List `searchBranches`: filters within a branch are ANDed, branches are ORed. Provide as a JSON array of arrays or @path/to/file.json. Shape: [[({"field": "attacker" | "attackerCountry" | "category" | ...more, "op": "equals" | "not" | "gt" | ...more, "value": string} | ...more)]].',
			optional: true,
			parse: String,
		},
		"query-version": {
			kind: "parsed",
			brief:
				"Ignored. Accepted so a PIR read from the API can be sent back unchanged.",
			optional: true,
			parse: Number,
		},
		"query-source": {
			kind: "parsed",
			brief: "The query_source field",
			optional: true,
			choices: ["generated", "edited"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "query-source", "text"),
		},
		requirement: {
			kind: "parsed",
			brief: "The requirement field",
			optional: true,
			parse: String,
		},
		revision: {
			kind: "parsed",
			brief:
				"The `revision` the change is based on. Required for structured PIRs and when sending a `definition`; a different stored revision returns 409.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "parsed",
			brief:
				"`draft`: not monitored. `active`: monitored, unless `pause_reason` is set. Setting `active` on a PIR with a `pause_reason` resumes it. Moving a PIR back to `draft` and activating it again starts matching afresh with a 30-day backfill.",
			optional: true,
			choices: ["draft", "active"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		title: {
			kind: "parsed",
			brief: "The title field",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "priority-id", brief: "Priority ID", parse: String },
	],
	rules(rules) {
		rules.conflicts("definition-additional-criteria", [
			"definition-relevance-criteria",
		]);
		rules.implies("definition-additional-criteria", ["definition-topic-id"]);
		rules.conflicts("definition-criterion-selections-add", [
			"definition-relevance-criteria",
		]);
		rules.implies("definition-criterion-selections-add", [
			"definition-topic-id",
		]);
		rules.conflicts("definition-criterion-selections-remove", [
			"definition-relevance-criteria",
		]);
		rules.implies("definition-criterion-selections-remove", [
			"definition-topic-id",
		]);
		rules.conflicts("definition-question-mode", [
			"definition-relevance-criteria",
		]);
		rules.implies("definition-question-mode", ["definition-topic-id"]);
		rules.conflicts("definition-question-value", [
			"definition-relevance-criteria",
		]);
		rules.implies("definition-question-value", [
			"definition-question-mode",
			"definition-topic-id",
		]);
		rules.implies("definition-selections-actor-types-value", [
			"definition-selections-actor-types-mode",
		]);
		rules.implies("definition-selections-countries-value", [
			"definition-selections-countries-mode",
		]);
		rules.implies("definition-selections-key-suppliers-value", [
			"definition-selections-key-suppliers-mode",
		]);
		rules.implies("definition-selections-motivations-value", [
			"definition-selections-motivations-mode",
		]);
		rules.implies("definition-selections-peers-value", [
			"definition-selections-peers-mode",
		]);
		rules.implies("definition-selections-sectors-value", [
			"definition-selections-sectors-mode",
		]);
		rules.implies("definition-selections-targets-value", [
			"definition-selections-targets-mode",
		]);
		rules.implies("definition-selections-technologies-value", [
			"definition-selections-technologies-mode",
		]);
		rules.conflicts("definition-title-mode", ["definition-relevance-criteria"]);
		rules.implies("definition-title-mode", ["definition-topic-id"]);
		rules.conflicts("definition-title-value", [
			"definition-relevance-criteria",
		]);
		rules.implies("definition-title-value", [
			"definition-title-mode",
			"definition-topic-id",
		]);
		rules.conflicts("definition-topic-id", ["definition-relevance-criteria"]);
		rules.conflicts("definition-relevance-criteria", [
			"definition-additional-criteria",
			"definition-criterion-selections-add",
			"definition-criterion-selections-remove",
			"definition-question-mode",
			"definition-question-value",
			"definition-title-mode",
			"definition-title-value",
			"definition-topic-id",
		]);
		rules.check((argv) => {
			const groupSet = [
				"based-on-profile-revision",
				"based-on-topic-fingerprint",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"based-on-profile-revision",
					"based-on-topic-fingerprint",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --based-on-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = ["dataset-scope-type", "dataset-scope-dataset-ids"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["dataset-scope-type"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --dataset-scope-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"definition-additional-criteria",
				"definition-criterion-selections-add",
				"definition-criterion-selections-remove",
				"definition-mode",
				"definition-question-mode",
				"definition-question-value",
				"definition-schema-version",
				"definition-selections-actor-notes",
				"definition-selections-actor-types-mode",
				"definition-selections-actor-types-value",
				"definition-selections-actors-add",
				"definition-selections-actors-remove",
				"definition-selections-attributed-countries",
				"definition-selections-countries-mode",
				"definition-selections-countries-value",
				"definition-selections-cves",
				"definition-selections-excluded-actors",
				"definition-selections-key-suppliers-mode",
				"definition-selections-key-suppliers-value",
				"definition-selections-malware-tools",
				"definition-selections-motivations-mode",
				"definition-selections-motivations-value",
				"definition-selections-peers-mode",
				"definition-selections-peers-value",
				"definition-selections-sectors-mode",
				"definition-selections-sectors-value",
				"definition-selections-targets-mode",
				"definition-selections-targets-value",
				"definition-selections-technique-ids",
				"definition-selections-technologies-mode",
				"definition-selections-technologies-value",
				"definition-title-mode",
				"definition-title-value",
				"definition-topic-id",
				"definition-relevance-criteria",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["definition-mode", "definition-schema-version"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --definition-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"intent-clauses",
				"intent-exclusions-actors",
				"intent-exclusions-attacker-countries",
				"intent-exclusions-categories",
				"intent-exclusions-cves",
				"intent-exclusions-keywords",
				"intent-exclusions-target-countries",
				"intent-exclusions-target-industries",
				"intent-exclusions-techniques",
				"intent-indicators",
				"intent-unsupported-terms",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"intent-clauses",
					"intent-indicators",
					"intent-unsupported-terms",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --intent-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"intent-exclusions-actors",
				"intent-exclusions-attacker-countries",
				"intent-exclusions-categories",
				"intent-exclusions-cves",
				"intent-exclusions-keywords",
				"intent-exclusions-target-countries",
				"intent-exclusions-target-industries",
				"intent-exclusions-techniques",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"intent-exclusions-actors",
					"intent-exclusions-attacker-countries",
					"intent-exclusions-categories",
					"intent-exclusions-cves",
					"intent-exclusions-keywords",
					"intent-exclusions-target-countries",
					"intent-exclusions-target-industries",
					"intent-exclusions-techniques",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --intent-exclusions-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = ["query-branches", "query-version"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["query-branches"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --query-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence update",
				classification: {
					safeFlags: [
						"confirm-query",
						"dataset-scope-type",
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
						"notification-mode",
						"query-source",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}`,
						pathParams: { "priority-id": String(argv["priority-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: validateBodyUnions(
										compactBody({
											based_on: {
												profile_revision: argv["based-on-profile-revision"],
												topic_fingerprint: resolveFileToken(
													argv["based-on-topic-fingerprint"] as
														| string
														| undefined,
													"based-on-topic-fingerprint",
													"text"
												),
											},
											confirm_query: argv["confirm-query"],
											dataset_scope: {
												type: argv["dataset-scope-type"],
												dataset_ids: argv["dataset-scope-dataset-ids"],
											},
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
											digest_interval_hours: argv["digest-interval-hours"],
											intent: {
												clauses: parseObjectArray(
													argv["intent-clauses"],
													"intent-clauses"
												),
												exclusions: {
													actors: argv["intent-exclusions-actors"],
													attacker_countries:
														argv["intent-exclusions-attacker-countries"],
													categories: argv["intent-exclusions-categories"],
													cves: argv["intent-exclusions-cves"],
													keywords: argv["intent-exclusions-keywords"],
													target_countries:
														argv["intent-exclusions-target-countries"],
													target_industries:
														argv["intent-exclusions-target-industries"],
													techniques: argv["intent-exclusions-techniques"],
												},
												indicators: argv["intent-indicators"],
												unsupported_terms: argv["intent-unsupported-terms"],
											},
											labels: argv["labels"],
											model: resolveFileToken(
												argv["model"] as string | undefined,
												"model",
												"text"
											),
											notification_mode: argv["notification-mode"],
											priority: argv["priority"],
											query: {
												branches: parseNestedArray(
													argv["query-branches"],
													"query-branches"
												),
												version: argv["query-version"],
											},
											query_source: argv["query-source"],
											requirement: resolveFileToken(
												argv["requirement"] as string | undefined,
												"requirement",
												"text"
											),
											revision: argv["revision"],
											status: argv["status"],
											title: resolveFileToken(
												argv["title"] as string | undefined,
												"title",
												"text"
											),
											tlp: resolveFileToken(
												argv["tlp"] as string | undefined,
												"tlp",
												"text"
											),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							priority_id: argv["priority-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					based_on: {
						profile_revision: argv["based-on-profile-revision"],
						topic_fingerprint: resolveFileToken(
							argv["based-on-topic-fingerprint"] as string | undefined,
							"based-on-topic-fingerprint",
							"text"
						),
					},
					confirm_query: argv["confirm-query"],
					dataset_scope: {
						type: argv["dataset-scope-type"],
						dataset_ids: argv["dataset-scope-dataset-ids"],
					},
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
					digest_interval_hours: argv["digest-interval-hours"],
					intent: {
						clauses: parseObjectArray(argv["intent-clauses"], "intent-clauses"),
						exclusions: {
							actors: argv["intent-exclusions-actors"],
							attacker_countries: argv["intent-exclusions-attacker-countries"],
							categories: argv["intent-exclusions-categories"],
							cves: argv["intent-exclusions-cves"],
							keywords: argv["intent-exclusions-keywords"],
							target_countries: argv["intent-exclusions-target-countries"],
							target_industries: argv["intent-exclusions-target-industries"],
							techniques: argv["intent-exclusions-techniques"],
						},
						indicators: argv["intent-indicators"],
						unsupported_terms: argv["intent-unsupported-terms"],
					},
					labels: argv["labels"],
					model: resolveFileToken(
						argv["model"] as string | undefined,
						"model",
						"text"
					),
					notification_mode: argv["notification-mode"],
					priority: argv["priority"],
					query: {
						branches: parseNestedArray(
							argv["query-branches"],
							"query-branches"
						),
						version: argv["query-version"],
					},
					query_source: argv["query-source"],
					requirement: resolveFileToken(
						argv["requirement"] as string | undefined,
						"requirement",
						"text"
					),
					revision: argv["revision"],
					status: argv["status"],
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
				});
				validateBodyUnions(bodyData, bodyUnions);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						priority_id: argv["priority-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
