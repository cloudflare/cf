/**
 * Path and body fields can share an API name while meaning different
 * things: for `POST /accounts/{account_id}/shares/{share_id}/excluded-recipients`
 * the path `account_id` is the account owning the share, resolved from cf's
 * account context, while the required body `account_id` is the account to
 * exclude from that share. Forge naming metadata (`x-fern-property-name`)
 * gives the body field a distinct CLI flag; `bodyParams()` must not
 * suppress it as if it duplicated the path parameter.
 *
 * See https://github.com/cloudflare/cf/issues/471.
 */

import { describe, expect, it } from "vite-plus/test";
import { derive } from "../../../../generator/plugin/args.js";
import { builderLines } from "../../../../generator/plugin/emit/builder.js";
import { dryRun, handler } from "../../../../generator/plugin/emit/handler.js";
import {
	bodyParam,
	context,
	find,
	method,
	names,
	operation,
	param,
} from "../../helpers/cli-plugin.js";
import type { Method } from "../../../../generator/plugin/commands.js";
import type { OperationInfo } from "../../../../generator/plugin/operation.js";

const createMethod: Method = method(
	"create",
	"resource-sharing-add-excluded-recipient"
);

/** The excluded-recipients create operation, with its body field renamed. */
function excludedRecipients(): OperationInfo {
	return operation(
		"post",
		"/accounts/{account_id}/shares/{share_id}/excluded-recipients",
		{
			pathParams: [param("account_id"), param("share_id")],
			// The wire name stays `account_id`; Forge metadata renames the flag.
			bodyParams: [
				bodyParam("excluded-account-id", "string", ["account_id"], {
					required: true,
					description: "The account to exclude from the share.",
				}),
			],
			hasRequestBody: true,
			requestBodyMandatory: true,
			requestContentTypes: ["application/json"],
			requestBodyRequired: ["account_id"],
		}
	);
}

describe("path and body account fields sharing a wire name", () => {
	it("keeps a Forge-renamed body account field beside an account path", () => {
		const d = derive(createMethod, "resource-sharing", excludedRecipients());
		expect(d.hasBodyParams).toBe(true);
		const excluded = find(d.args, "excluded-account-id");
		expect(excluded.required).toBe(true);
		expect(excluded.positional).toBe(false);
		expect(excluded.origin).toEqual({ in: "body", path: ["account_id"] });
	});

	it("keeps the owning account in the URL and out of the flags", () => {
		const d = derive(createMethod, "resource-sharing", excludedRecipients());
		// The path account is resolved from cf's account context, so only the
		// share is a positional and no flag claims the owning account.
		expect(
			d.args.filter((a) => a.origin.in === "path").map((a) => a.name)
		).toEqual(["share-id"]);
		expect(names(d.args)).not.toContain("account-id");
	});

	it("emits the body flag, its required-field prompt, and the wire name", () => {
		const ctx = context(createMethod, "resource-sharing", excludedRecipients());
		expect(ctx.resolvedRequestPath).toBe(
			'/accounts/${accountId}/shares/${encodeURIComponent(String(argv["share-id"]))}/excluded-recipients'
		);
		const builder = builderLines(ctx).join("\n");
		expect(builder).toContain(".option('excluded-account-id'");
		const h = handler(ctx).join("\n");
		expect(h).toContain("promptForRequiredField('excluded-account-id'");
		// The flag fills the wire field, not the URL: the owning account
		// stays in the path and the excluded account goes in the JSON body.
		expect(h).toContain(`setNestedValue(bodyData, ["account_id"]`);
		expect(h).toContain(
			'bodyData, ["account_id"], resolveFileToken(argv["excluded-account-id"]'
		);
		expect(h).not.toContain('bodyData, ["share-id"]');
	});

	it("previews the same body assembly on dry runs", () => {
		const ctx = context(createMethod, "resource-sharing", excludedRecipients());
		const preview = dryRun(ctx).join("\n");
		expect(preview).toContain(
			'account_id: resolveFileToken(argv["excluded-account-id"]'
		);
		expect(preview).toContain("/accounts/");
		expect(preview).toContain("/excluded-recipients");
	});
});
