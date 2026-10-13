/**
 * Builds the command tree from forge's groups: a command for each top-level
 * group, with its methods as leaf commands, nested in groups.
 *
 * Commands, groups and leaves are named in kebab-case after forge's names,
 * and each method has an operation ID made of the names of its groups and
 * its own, such as `kv.namespaces.list`.
 */

import {
	GenerateError,
	isObject,
	localeCompare,
	normalizeSpaces,
} from "./js.js";
import type {
	Forge,
	Group as ForgeGroup,
	Method as ForgeMethod,
	Json,
} from "@cloudflare/forge/plugin";

/** A method: one operation, as a leaf command. */
export interface Method {
	readonly kind: "method";
	name: string;
	operationId: string;
	deprecated: boolean;
	/** The `x-forge-params` overrides, by parameter name, when not empty. */
	params?: { readonly [key: string]: Json };
	requireConfirmation?: string;
	/** The operation's summary with its whitespace collapsed. */
	summary?: string;
	/** The operation's description, or else its summary, with its whitespace collapsed. */
	description: string;
	/** Whether the operation declares `x-forge-args`, which the CLI does not support. */
	hasArgs: boolean;
}

/** A method group: methods and method groups under a name. */
export interface Group {
	readonly kind: "group";
	name: string;
	description: string;
	items: Item[];
}

/** A member of a command or method group. */
export type Item = Method | Group;

/** A top-level command. */
export interface Command {
	name: string;
	description: string;
	items: Item[];
	hideCommand: boolean;
}

/**
 * The operation ID of `method`: the kebab-case names of its groups, top
 * level first, and its own, joined with dots.
 */
export function operationId(method: ForgeMethod): string {
	return [
		...method.group.path.map((name) => name.kebab()),
		method.name.kebab(),
	].join(".");
}

/** The commands of `forge`, sorted by name. */
export function commands(forge: Forge): Command[] {
	const errors: string[] = [];
	const out = forge.groups
		.filter((g) => g.parent === undefined)
		.map((group) => command(group, errors));
	out.sort((a, b) => localeCompare(a.name, b.name));
	if (errors.length > 0) {
		throw new GenerateError(
			`OpenAPI command metadata validation errors:\n${errors.map((e) => `  ${e}`).join("\n")}`
		);
	}
	return out;
}

/**
 * The command of the top-level group `group`. A method without a
 * description adds an error to `errors`.
 */
export function command(group: ForgeGroup, errors: string[] = []): Command {
	const name = group.name.kebab();
	const description = group.description === "" ? name : group.description;
	const hideCommand = [group, ...group.descendants]
		.flatMap((g) => g.methods)
		.every((m) => m.hidden);
	return {
		items: items(group, name, undefined, errors),
		name,
		description,
		hideCommand,
	};
}

/**
 * The methods of `group`, then its subgroups sorted by name. `command` is
 * the name of its command, and `path` the names of the groups below the
 * command down to it, joined with dots.
 */
function items(
	group: ForgeGroup,
	command: string,
	path: string | undefined,
	errors: string[]
): Item[] {
	const out: Item[] = group.methods.map((m) =>
		method(m, command, path, errors)
	);
	const groups = group.children.map((child): Group => {
		const name = child.name.kebab();
		const childPath = path === undefined ? name : `${path}.${name}`;
		const description =
			child.description === ""
				? `Operations for ${childPath}`
				: child.description;
		return {
			kind: "group",
			items: items(child, command, childPath, errors),
			name,
			description,
		};
	});
	groups.sort((a, b) => localeCompare(a.name, b.name));
	out.push(...groups);
	return out;
}

function method(
	m: ForgeMethod,
	command: string,
	path: string | undefined,
	errors: string[]
): Method {
	const name = m.name.kebab();
	const id = operationId(m);
	const summary = m.summary === "" ? undefined : normalizeSpaces(m.summary);
	let description: string;
	if (m.description === "" && m.summary === "") {
		const at =
			path === undefined ? `${command}.${name}` : `${command}.${path}.${name}`;
		errors.push(
			`${at}: method has no description and no OpenAPI description found for "${id}". Add a description to the schema file.`
		);
		description = "";
	} else if (m.description === "") {
		description = normalizeSpaces(m.summary);
	} else {
		description = normalizeSpaces(m.description);
	}
	const p = m.extension("x-forge-params");
	const params = isObject(p) && Object.keys(p).length > 0 ? p : undefined;
	return {
		kind: "method",
		name,
		operationId: id,
		deprecated: m.availability === "deprecated",
		params,
		requireConfirmation: m.confirmation,
		summary,
		description,
		hasArgs: Array.isArray(m.extension("x-forge-args")),
	};
}
