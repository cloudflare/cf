/**
 * resolve command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
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
	operands: [],
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
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "resolve",
	describe: "Resolve structured PIR answers without saving",
	usage:
		"$0 cloudforce-one priority-intelligence resolve\n\nReturns the requirement and event query that saving `definition` would generate, using the account's current organization profile and topic. `resolved.issues` lists problems that would block saving, and `resolved.notices` inputs that would be ignored. Search events with `resolved.event_plan.branches`: a beta value for running searches, not a stable contract, which changes whenever a topic's event rules change. Show `resolved.event_plan.rules[].explanation` to explain matches. Send `resolved.based_on` with the save so it fails with 409 if the profile or topic changes in between. Nothing is saved, and no model is called.",
	...parameters,
	loader: () => import("./resolve.handler.js"),
});

export default command;
