import { isDeepStrictEqual } from "node:util";
import { sanitizeTerminalText, validateJsonSchema } from "#lib/schema-flags.js";
import { theme } from "#lib/ui/theme.js";
import type { FlagDescriptor, JsonSchema } from "#lib/schema-flags.js";

interface RegistrationPricing {
	currency: string;
	registration_cost: string;
	renewal_cost: string;
}

interface RegistrationReview {
	domain: string;
	accountId: string;
	years: number;
	quotedCost: string;
	pricing: RegistrationPricing;
	body: Record<string, unknown>;
	schema?: JsonSchema;
	descriptors?: readonly FlagDescriptor[];
}

const CORE_FIELDS = new Set([
	"domain_name",
	"years",
	"auto_renew",
	"privacy_mode",
]);

const GROUP_LABELS: Record<string, string> = {
	acknowledgements: "Acknowledgements",
	contact_extensions: "Registry Details",
	contacts: "Contacts",
};

function ownLabel(
	labels: Readonly<Record<string, string>> | undefined,
	value: string
): string | undefined {
	return labels !== undefined && Object.hasOwn(labels, value)
		? labels[value]
		: undefined;
}

function titleCase(field: string): string {
	return field
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
		.join(" ");
}

function formatScalar(value: unknown): string {
	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}
	if (value === null) {
		return "null";
	}
	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}
	return JSON.stringify(value) ?? "undefined";
}

function descriptorForPath(
	descriptors: readonly FlagDescriptor[],
	path: readonly string[]
): FlagDescriptor | undefined {
	return descriptors.find(
		(descriptor) =>
			descriptor.path.length === path.length &&
			descriptor.path.every((segment, index) => segment === path[index])
	);
}

function formatDetailValue(
	path: readonly string[],
	value: unknown,
	descriptors: readonly FlagDescriptor[]
): string {
	if (
		typeof value === "boolean" &&
		path.some((segment) => segment.includes("acknowledgement"))
	) {
		return value ? "Accepted" : "Declined";
	}
	const descriptor = descriptorForPath(descriptors, path);
	const valueText = formatScalar(value);
	const labelledChoice = ownLabel(descriptor?.choiceLabels, valueText);
	if (labelledChoice) {
		return `${labelledChoice} (${valueText})`;
	}
	const variant = (descriptor?.schema.oneOf ?? descriptor?.schema.anyOf)?.find(
		(candidate) =>
			candidate.title && validateJsonSchema(candidate, value).length === 0
	);
	return variant?.title ? `${variant.title} (${valueText})` : valueText;
}

function detailLabel(
	path: readonly string[],
	descriptor: FlagDescriptor | undefined
): string {
	return path
		.map((segment, index) => {
			if (index === path.length - 1 && descriptor?.schema.title) {
				return descriptor.schema.title;
			}
			return ownLabel(GROUP_LABELS, segment) ?? titleCase(segment);
		})
		.join(" · ");
}

function flattenDetails(
	value: Record<string, unknown>,
	descriptors: readonly FlagDescriptor[],
	path: string[] = []
): Array<[string, string]> {
	const rows: Array<[string, string]> = [];
	for (const [key, child] of Object.entries(value)) {
		if (path.length === 0 && CORE_FIELDS.has(key)) {
			continue;
		}
		const childPath = [...path, key];
		if (
			child !== null &&
			typeof child === "object" &&
			!Array.isArray(child) &&
			Object.keys(child).length > 0
		) {
			rows.push(
				...flattenDetails(
					child as Record<string, unknown>,
					descriptors,
					childPath
				)
			);
			continue;
		}
		const descriptor = descriptorForPath(descriptors, childPath);
		rows.push([
			detailLabel(childPath, descriptor),
			formatDetailValue(childPath, child, descriptors),
		]);
	}
	return rows.sort(([left], [right]) => left.localeCompare(right));
}

function settingValue(
	body: Record<string, unknown>,
	schema: JsonSchema | undefined,
	name: string
): string {
	if (Object.hasOwn(body, name)) {
		return formatScalar(body[name]);
	}
	const defaultValue = findPropertyDefault(schema, name);
	return defaultValue === undefined
		? "API default"
		: `${formatScalar(defaultValue)} (default)`;
}

function findSchemaDefaults(schema: JsonSchema | undefined): unknown[] {
	if (schema === undefined) {
		return [];
	}
	return [
		...(schema.default === undefined ? [] : [schema.default]),
		...(schema.allOf ?? []).flatMap(findSchemaDefaults),
	];
}

function findPropertyDefaults(
	schema: JsonSchema | undefined,
	name: string
): unknown[] {
	if (schema === undefined) {
		return [];
	}
	return [
		...findSchemaDefaults(schema.properties?.[name]),
		...(schema.allOf ?? []).flatMap((clause) =>
			findPropertyDefaults(clause, name)
		),
	];
}

function findPropertyDefault(
	schema: JsonSchema | undefined,
	name: string
): unknown {
	const defaults = findPropertyDefaults(schema, name);
	const first = defaults[0];
	return defaults.length > 0 &&
		defaults.every((value) => isDeepStrictEqual(value, first))
		? first
		: undefined;
}

function renderRows(rows: ReadonlyArray<readonly [string, string]>): string[] {
	const cleanRows = rows.map(
		([label, value]) =>
			[sanitizeTerminalText(label), sanitizeTerminalText(value)] as const
	);
	const labelWidth = Math.min(
		32,
		Math.max(...cleanRows.map(([label]) => label.length), 0)
	);
	return cleanRows.map(
		([label, value]) =>
			`│  ${theme.muted(label.padEnd(labelWidth))}  ${theme.bold(value)}`
	);
}

/** Render the complete human review shown immediately before confirmation. */
export function renderRegistrationReview(review: RegistrationReview): string {
	const core: Array<[string, string]> = [
		["Domain", review.domain],
		["Account", review.accountId],
		[
			"Registration term",
			`${review.years} ${review.years === 1 ? "year" : "years"}`,
		],
		["Due now", review.quotedCost],
		[
			"Renewal price",
			`${review.pricing.currency} ${review.pricing.renewal_cost} per year`,
		],
		["Auto-renew", settingValue(review.body, review.schema, "auto_renew")],
		["Privacy mode", settingValue(review.body, review.schema, "privacy_mode")],
	];
	const details = flattenDetails(review.body, review.descriptors ?? []);
	return [
		"│",
		`${theme.brand("◇")}  ${theme.bold("Review registration")}`,
		"│",
		...renderRows(core),
		...(details.length > 0
			? [
					"│",
					`│  ${theme.bold("Registration details")}`,
					...renderRows(details),
				]
			: []),
		"│",
	].join("\n");
}
