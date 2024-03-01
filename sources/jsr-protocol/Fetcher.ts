import type {
  FetchOptions,
  FetchResult,
  Fetcher,
  Locator,
  MinimalFetchOptions,
} from "@yarnpkg/core";
import { structUtils, tgzUtils } from "@yarnpkg/core";

import { hasProcol, stripProtocol } from "./utils";

export default class JsrFetcher implements Fetcher {
  supports(locator: Locator): boolean {
    return hasProcol(locator.reference);
  }

  getLocalPath(locator: Locator, opts: FetchOptions) {
    return null;
  }

  async fetch(locator: Locator, opts: FetchOptions) {
    const expectedChecksum = opts.checksums.get(locator.locatorHash) || null;

    const [packageFs, releaseFs, checksum] =
      await opts.cache.fetchPackageFromCache(locator, expectedChecksum, {
        onHit() {
          opts.report.reportCacheHit(locator);
        },
        onMiss() {
          opts.report.reportCacheMiss(
            locator,
            `${structUtils.prettyLocator(
              opts.project.configuration,
              locator
            )} can't be found in the cache and will be fetched from the remote registry`
          );
        },
        loader: () => this.#fetchFromNetwork(locator, opts),
        ...opts.cacheOptions,
      });

    return {
      packageFs,
      releaseFs,
      prefixPath: structUtils.getIdentVendorPath(locator),
      checksum,
    };
  }

  async #fetchFromNetwork(locator: Locator, opts: FetchOptions) {
    const response = await fetch(
      `https://npm.jsr.io/~/5/@jsr/${locator.scope}__${
        locator.name
      }/${stripProtocol(locator.reference)}.tgz`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch @${locator.scope}/${locator.name} tarball from jsr`
      );
    }

    return await tgzUtils.convertToZip(
      Buffer.from(await response.arrayBuffer()),
      {
        configuration: opts.project.configuration,
        prefixPath: structUtils.getIdentVendorPath(locator),
        stripComponents: 1,
      }
    );
  }
}
