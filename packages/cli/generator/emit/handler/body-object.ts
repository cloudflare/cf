import { argvKey } from "../../codegen/identifiers.js";
import {
	bodyOptionArgs,
	isPathArg,
	positionalArgs,
} from "../../intermediate-representation.js";
import type { ArgIR } from "../../intermediate-representation.js";
import type { EmitContext } from "../context.js";

interface BodyTree {
	value?: string;
	children: Map<string, BodyTree>;
}

function bodyFieldArgs(
	ctx: EmitContext
): { argKey: string; apiFieldName: string }[] {
	const { derived, requiredOptionArgs } = ctx;
	const out: { argKey: string; apiFieldName: string }[] = [];
	for (const arg of positionalArgs(derived.args)) {
		if (isPathArg(arg) || arg.isZone || arg.isWorkerName) continue;
		const apiFieldName =
			arg.origin.kind === "body" && arg.origin.apiFieldPath.length === 1
				? arg.origin.apiFieldPath[0]!
				: arg.name.replace(/-/g, "_");
		out.push({ argKey: arg.name, apiFieldName });
	}
	for (const opt of requiredOptionArgs) {
		if (opt.origin.kind === "body") continue;
		out.push({
			argKey: opt.name,
			apiFieldName: opt.name.replace(/-/g, "_"),
		});
	}
	return out;
}

export function emitBodyObject(ctx: EmitContext, indent: string): string[] {
	const root: BodyTree = { children: new Map() };
	const add = (segments: string[], value: string): void => {
		let node = root;
		for (const segment of segments) {
			let child = node.children.get(segment);
			if (child === undefined) {
				child = { children: new Map() };
				node.children.set(segment, child);
			}
			node = child;
		}
		node.value = value;
	};
	for (const arg of bodyOptionArgs(ctx.derived.args)) {
		if (arg.origin.kind !== "body") continue;
		const read = argvKey(arg.name);
		const value = emitBodyArgValue(arg, read);
		add(arg.origin.apiFieldPath, value);
	}
	for (const field of bodyFieldArgs(ctx)) {
		add([field.apiFieldName], argvKey(field.argKey));
	}

	const emit = (tree: BodyTree, currentIndent: string): string[] => {
		const lines = ["{"];
		for (const [name, child] of tree.children) {
			const key = /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
			if (child.children.size === 0) {
				lines.push(currentIndent + "\t" + key + ": " + child.value + ",");
				continue;
			}
			const nested = emit(child, currentIndent + "\t");
			lines.push(currentIndent + "\t" + key + ": " + nested[0]);
			lines.push(...nested.slice(1, -1));
			lines.push(currentIndent + "\t},");
		}
		lines.push(currentIndent + "}");
		return lines;
	};

	return emit(root, indent);
}

export function emitBodyArgValue(arg: ArgIR, read: string): string {
	return arg.type === "object-array"
		? `parseObjectArray(${read}, ${JSON.stringify(arg.name)})`
		: arg.fromFile
			? `resolveFileToken(${read} as string | undefined, ${JSON.stringify(arg.name)}, ${JSON.stringify(arg.fromFile.format)})`
			: read;
}
