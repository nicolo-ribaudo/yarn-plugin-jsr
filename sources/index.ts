import type { Plugin } from "@yarnpkg/core";
import JsrAliasResolver from "./jsr-protocol/AliasResolver";
import JsrSemverResolver from "./jsr-protocol/SemverResolver";
import JsrFetcher from "./jsr-protocol/Fetcher";
import JsxAddCommand from "./commands/add";

export default {
  resolvers: [JsrAliasResolver, JsrSemverResolver],
  fetchers: [JsrFetcher],
  commands: [JsxAddCommand],
} satisfies Plugin;
