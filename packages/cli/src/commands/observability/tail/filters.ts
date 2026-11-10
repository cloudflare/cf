import { parseJsonMap } from "#lib/body-parser.js";

type Condition = {
	kind?: "filter";
	key: string;
	type: "string" | "number" | "boolean";
	operation: string;
	value?: string | number | boolean;
};

export type Filter = Condition | Group;
export type Group = {
	kind: "group";
	filterCombination: "and" | "or";
	filters: Filter[];
};

export function tailFilters(
	input?: string
): Pick<Group, "filters" | "filterCombination"> {
	const value = parseJsonMap(input, "filters");
	if (value === undefined) {
		return { filters: [], filterCombination: "and" };
	}
	if (
		(value.filterCombination !== "and" && value.filterCombination !== "or") ||
		!Array.isArray(value.filters) ||
		Object.keys(value).some(
			(key) => key !== "filters" && key !== "filterCombination"
		)
	) {
		throw new Error(
			'--filters requires {"filterCombination":"and"|"or","filters":[...]}. Run cf observability tail --help for examples.'
		);
	}
	return {
		filterCombination: value.filterCombination,
		filters: value.filters as Filter[],
	};
}

export function zoneFilter(zone: string): Group {
	const name = zone.toLowerCase();
	const host = name
		.replaceAll(".", "\\.")
		.replace(/[a-z]/g, (letter) => `[${letter}${letter.toUpperCase()}]`);
	return {
		kind: "group",
		filterCombination: "or",
		filters: [
			{
				key: "cloudflare.zone_name",
				type: "string",
				operation: "eq",
				value: name,
			},
			{
				kind: "group",
				filterCombination: "and",
				filters: [
					{
						key: "cloudflare.zone_name",
						type: "string",
						operation: "is_null",
					},
					{
						key: "$metadata.url",
						type: "string",
						operation: "regex",
						value: `^[Hh][Tt][Tt][Pp][Ss]?://(?:[a-zA-Z0-9-]+\\.)*${host}\\.?(?::[0-9]+)?(?:[/?#]|$)`,
					},
				],
			},
		],
	};
}

export function scopeTailFilters(
	{ filters, filterCombination }: ReturnType<typeof tailFilters>,
	scope: Filter
): ReturnType<typeof tailFilters> {
	return {
		filterCombination: "and",
		filters: [
			scope,
			...(filterCombination === "and" || filters.length === 0
				? filters
				: [{ kind: "group" as const, filterCombination, filters }]),
		],
	};
}
