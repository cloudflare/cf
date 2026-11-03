import type { Method } from "./commands.js";
import type { OperationInfo } from "./operation.js";

export function requiresConfirmation(
	method: Method,
	op: OperationInfo
): boolean {
	return (
		op.method.toUpperCase() === "DELETE" ||
		(method.requireConfirmation !== undefined &&
			method.requireConfirmation !== "")
	);
}
