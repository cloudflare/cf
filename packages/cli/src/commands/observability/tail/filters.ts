interface ShortcutOptions {
	status?: readonly ("ok" | "error" | "canceled")[];
	method?: readonly string[];
	search?: string;
	versionId?: string;
}

export function shortcutFilters({
	status,
	method,
	search,
	versionId,
}: ShortcutOptions): Record<string, unknown>[] {
	const filters: Record<string, unknown>[] = [];
	if (status?.length) {
		const outcomes = new Set(
			status.flatMap((value) =>
				value === "error"
					? ["exception", "exceededCpu", "exceededMemory", "unknown"]
					: [value]
			)
		);
		filters.push({
			key: "$workers.outcome",
			operation: "in",
			type: "string",
			value: [...outcomes].join(","),
		});
	}
	if (method?.length) {
		filters.push({
			kind: "group",
			filterCombination: "or",
			filters: method.map((value) => {
				if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value)) {
					throw new Error("--method requires an HTTP method token.");
				}
				return {
					key: "$metadata.trigger",
					operation: "starts_with",
					type: "string",
					value: `${value.toUpperCase()} `,
				};
			}),
		});
	}
	if (search !== undefined) {
		filters.push({
			key: "$metadata.message",
			operation: "includes",
			type: "string",
			value: search,
		});
	}
	if (versionId !== undefined) {
		filters.push({
			key: "$workers.scriptVersion.id",
			operation: "eq",
			type: "string",
			value: versionId,
		});
	}
	return filters;
}
