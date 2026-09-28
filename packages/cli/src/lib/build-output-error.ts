/**
 * Thrown when the Worker config can be read but fails conversion or validation.
 * Distinct from build-output-utils' `BuildOutputError`, which covers a missing,
 * malformed, or schema-invalid Build Output tree.
 */
export class BuildOutputConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BuildOutputConfigError";
	}
}
