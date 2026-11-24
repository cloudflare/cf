import $aggregate from "./aggregate.js";
import $attackers from "./attackers/index.js";
import $bulkcreate from "./bulk-create.js";
import $bulkupdate from "./bulk-update.js";
import $categories from "./categories/index.js";
import $copy from "./copy.js";
import $countries from "./countries/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $graphql from "./graphql.js";
import $legacy from "./legacy/index.js";
import $list from "./list.js";
import $move from "./move.js";
import $queries from "./queries/index.js";
import $raw from "./raw/index.js";
import $relationships from "./relationships/index.js";
import $search from "./search.js";
import $targetindustries from "./target-industries/index.js";
import $update from "./update.js";
/**
 * events command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe: "Operations for threat-intel.events",

	routes: {
		aggregate: $aggregate,
		"bulk-create": $bulkcreate,
		"bulk-update": $bulkupdate,
		copy: $copy,
		create: $create,
		delete: $delete,
		get: $get,
		graphql: $graphql,
		list: $list,
		move: $move,
		search: $search,
		update: $update,
		attackers: $attackers,
		categories: $categories,
		countries: $countries,
		legacy: $legacy,
		queries: $queries,
		raw: $raw,
		relationships: $relationships,
		"target-industries": $targetindustries,
	},
});

export default command;
