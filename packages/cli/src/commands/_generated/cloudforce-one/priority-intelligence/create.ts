import operation from "../../_operations/cloudforce-one/priority-intelligence/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one priority-intelligence create\n\nCreates a new PIR for the account. The cfone.priority_intelligence_requirement_limit entitlement sets how many PIRs can be active; drafts do not count, but the account can hold at most five times that many PIRs in total. A free-form PIR has a `requirement`, and an active one requires a query. A structured PIR has a `definition` instead; its requirement and event query are generated, and the response includes them in `resolved`."
		)
		.option("based-on-profile-revision", {
			type: "number",
			description: "The based_on.profile_revision field",
		})
		.option("based-on-topic-fingerprint", {
			type: "string",
			description: "The based_on.topic_fingerprint field",
		})
		.option("dataset-scope-type", {
			type: "string",
			description: "The dataset_scope.type field",
			choices: ["default", "datasets"],
		})
		.coerce("dataset-scope-type", (value) =>
			resolveFileToken(value, "dataset-scope-type", "text")
		)
		.option("dataset-scope-dataset-ids", {
			type: "string",
			array: true,
			description: "The dataset_scope.dataset_ids field",
		})
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
		.option("digest-interval-hours", {
			type: "number",
			description:
				"Hours between digests: 6, 12, or 24. Used only when `notification_mode` is `digest`.",
			default: 24,
		})
		.option("intent-clauses", {
			type: "string",
			description:
				'The intent.clauses field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"actors": [string], "attacker_countries": [string], "categories": [string], "cves": [string], "keywords": [string], ...more}].',
		})
		.option("intent-exclusions-actors", {
			type: "string",
			array: true,
			description: "The intent.exclusions.actors field",
		})
		.option("intent-exclusions-attacker-countries", {
			type: "string",
			array: true,
			description: "The intent.exclusions.attacker_countries field",
		})
		.option("intent-exclusions-categories", {
			type: "string",
			array: true,
			description: "The intent.exclusions.categories field",
		})
		.option("intent-exclusions-cves", {
			type: "string",
			array: true,
			description: "The intent.exclusions.cves field",
		})
		.option("intent-exclusions-keywords", {
			type: "string",
			array: true,
			description: "The intent.exclusions.keywords field",
		})
		.option("intent-exclusions-target-countries", {
			type: "string",
			array: true,
			description: "The intent.exclusions.target_countries field",
		})
		.option("intent-exclusions-target-industries", {
			type: "string",
			array: true,
			description: "The intent.exclusions.target_industries field",
		})
		.option("intent-exclusions-techniques", {
			type: "string",
			array: true,
			description: "The intent.exclusions.techniques field",
		})
		.option("intent-indicators", {
			type: "string",
			array: true,
			description: "The intent.indicators field",
		})
		.option("intent-unsupported-terms", {
			type: "string",
			array: true,
			description: "The intent.unsupported_terms field",
		})
		.option("labels", {
			type: "string",
			array: true,
			description: "The labels field",
		})
		.option("model", { type: "string", description: "The model field" })
		.option("notification-mode", {
			type: "string",
			description:
				"`none` or `digest`. Notifications are opt-in. `immediate` is reserved and currently rejected.",
			choices: ["none", "immediate", "digest"],
			default: "none",
		})
		.coerce("notification-mode", (value) =>
			resolveFileToken(value, "notification-mode", "text")
		)
		.option("priority", {
			type: "number",
			description: "The priority field",
			default: 0,
		})
		.option("query-branches", {
			type: "string",
			description:
				'Event List `searchBranches`: filters within a branch are ANDed, branches are ORed. Provide as a JSON array of arrays or @path/to/file.json. Shape: [[({"field": "attacker" | "attackerCountry" | "category" | ...more, "op": "equals" | "not" | "gt" | ...more, "value": string} | ...more)]].',
		})
		.option("query-version", {
			type: "number",
			description:
				"Ignored. Accepted so a PIR read from the API can be sent back unchanged.",
		})
		.option("query-source", {
			type: "string",
			description: "The query_source field",
			choices: ["generated", "edited"],
		})
		.coerce("query-source", (value) =>
			resolveFileToken(value, "query-source", "text")
		)
		.option("requirement", {
			type: "string",
			description:
				"Free-form requirement. Required unless `definition` is sent.",
		})
		.option("status", {
			type: "string",
			description:
				"`draft`: not monitored. `active`: monitored, unless `pause_reason` is set. Setting `active` on a PIR with a `pause_reason` resumes it. Moving a PIR back to `draft` and activating it again starts matching afresh with a 30-day backfill.",
			choices: ["draft", "active"],
			default: "draft",
		})
		.coerce("status", (value) => resolveFileToken(value, "status", "text"))
		.option("title", { type: "string", description: "The title field" })
		.option("tlp", {
			type: "string",
			description: "The tlp field",
			default: "amber",
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
		])
		.check((argv) => {
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
		})
		.check((argv) => {
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
		})
		.check((argv) => {
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
		})
		.check((argv) => {
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
		})
		.check((argv) => {
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
		})
		.check((argv) => {
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
}

type Args = InferArgs<typeof builder>;
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a priority intelligence requirement",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence create",
				classification: {
					safeFlags: [
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence`,
						pathParams: {},
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
