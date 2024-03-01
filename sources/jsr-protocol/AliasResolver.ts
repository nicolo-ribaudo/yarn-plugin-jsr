import type {
  Resolver,
  ResolveOptions,
  Descriptor,
  Locator,
  Package,
  MinimalResolveOptions,
  Project,
} from "@yarnpkg/core";

import { structUtils } from "@yarnpkg/core";

import { hasProcol, stripProtocol } from "./utils";

export default class JsrAliasResolver implements Resolver {
  supportsDescriptor(descriptor: Descriptor): boolean {
    return (
      hasProcol(descriptor.range) &&
      !!structUtils.tryParseDescriptor(stripProtocol(descriptor.range), true)
    );
  }

  supportsLocator(locator: Locator): boolean {
    return false; // Handled by SemverResolver
  }

  shouldPersistResolution(): boolean {
    throw new Error("Unreachable"); // Handled by SemverResolver
  }

  bindDescriptor(descriptor: Descriptor): Descriptor {
    return descriptor;
  }

  #rewriteDescriptor(descriptor: Descriptor, project: Project): Descriptor {
    const innerDesc = structUtils.parseDescriptor(
      stripProtocol(descriptor.range),
      true
    );
    innerDesc.range = `jsr:${innerDesc.range}`;
    return project.configuration.normalizeDependency(innerDesc);
  }

  getResolutionDependencies(
    descriptor: Descriptor,
    opts: MinimalResolveOptions
  ) {
    return opts.resolver.getResolutionDependencies(
      this.#rewriteDescriptor(descriptor, opts.project),
      opts
    );
  }

  async getCandidates(
    descriptor: Descriptor,
    dependencies: Record<string, Package>,
    opts: ResolveOptions
  ) {
    return await opts.resolver.getCandidates(
      this.#rewriteDescriptor(descriptor, opts.project),
      dependencies,
      opts
    );
  }

  async getSatisfying(
    descriptor: Descriptor,
    dependencies: Record<string, Package>,
    locators: Array<Locator>,
    opts: ResolveOptions
  ) {
    return opts.resolver.getSatisfying(
      this.#rewriteDescriptor(descriptor, opts.project),
      dependencies,
      locators,
      opts
    );
  }

  async resolve(locator: Locator, opts: ResolveOptions): Promise<Package> {
    throw new Error("Unreachable"); // Handled by SemverResolver
  }
}
