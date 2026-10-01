import * as clack from "@clack/prompts";
import { expect, it, vi } from "vitest";
import { createDeployContext } from "../../lib/deploy-context.js";

it("points strict deploy aborts to the cf force flag", () => {
	const error = vi.spyOn(clack.log, "error").mockImplementation(() => {});
	try {
		const context = createDeployContext("test-token", "cf deploy --force");
		context.logger.error(
			"Aborting the upload operation because of conflicts. To override and upload anyway, remove the `--strict` flag"
		);

		expect(error).toHaveBeenCalledWith(
			"Aborting the upload operation because of conflicts. Rerun with `cf deploy --force` to override and upload anyway.",
			{ spacing: 0 }
		);
	} finally {
		error.mockRestore();
	}
});
