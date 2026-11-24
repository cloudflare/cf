/**
 * list command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief:
				"Only return organizations with the specified IDs (ex. id=foo&id=bar). Send multiple elements\nby repeating the query value.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"(case-sensitive) Filter the list of organizations to where the name is equal to a\nparticular string.",
			optional: true,
			parse: String,
		},
		"name-starts-with": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of organizations to where the name starts with a\nparticular string.",
			optional: true,
			parse: String,
		},
		"name-ends-with": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of organizations to where the name ends with a particular\nstring.",
			optional: true,
			parse: String,
		},
		"name-contains": {
			kind: "parsed",
			brief:
				"(case-insensitive) Filter the list of organizations to where the name contains a particular\nstring.",
			optional: true,
			parse: String,
		},
		"containing-account": {
			kind: "parsed",
			brief:
				"Filter the list of organizations to the ones that contain this particular\naccount.",
			optional: true,
			parse: String,
		},
		"containing-user": {
			kind: "parsed",
			brief:
				'Filter the list of organizations to the ones that contain this particular\nuser.\n\nIMPORTANT: Just because an organization "contains" a user is not a\nrepresentation of any authorization or privilege to manage any resources\ntherein. An organization "containing" a user simply means the user is managed by\nthat organization.',
			optional: true,
			parse: String,
		},
		"containing-organization": {
			kind: "parsed",
			brief:
				"Filter the list of organizations to the ones that contain this particular\norganization.",
			optional: true,
			parse: String,
		},
		"parent-id": {
			kind: "parsed",
			brief:
				'Filter the list of organizations to the ones that are a sub-organization\nof the specified organization.\n\n"null" is a valid value to provide for this parameter. It means "where\nan organization has no parent (i.e. it is a \'root\' organization)."',
			optional: true,
			parse: String,
		},
		"member-email": {
			kind: "parsed",
			brief:
				"Filter organizations to those where the given user, by email, is an active member of\nthat exact organization. This does not include hierarchy-derived access.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to order results by. Currently supported values: `name`.\nWhen not specified, results are ordered by hierarchy.",
			values: ["name"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction for the `order_by` field. Defaults to `asc` when `order_by` is\nspecified.",
			values: ["asc", "desc"],
			optional: true,
		},
		"page-token": {
			kind: "parsed",
			brief:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "The amount of items to return. Defaults to 10.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List organizations the user has access to",
	usage:
		"$0 organizations list\n\nRetrieve a list of organizations a particular user has access to. At most one of `containing.account`, `containing.user`, or `containing.organization` may be provided.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
