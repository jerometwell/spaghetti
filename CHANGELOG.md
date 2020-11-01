# Changelog
This document lists the changes between release versions.

These are user-facing changes. To see the changes in the code between versions you can compare git tags.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Types of changes
  * `Added` for new features.
  * `Changed` for changes in existing functionality.
  * `Deprecated` for soon-to-be removed features.
  * `Removed` for now removed features.
  * `Fixed` for any bug fixes.
  * `Security` in case of vulnerabilities.

  -------------------------------------------------------------------
## [Unreleased]
- Added Support for non-es6 class dependencies with new functions: `singletonFn` and `transientFn`, which will not use the `new` keyword when resolving.
- Added wiring support when registering new dependencies. use `container.transient("label_name", KlassName, {wiring: ["engine"]})` and your constructor will receive the correct wiring on resolve.

## [0.1.1] 2020-11-01
 - Fix a require path that prevented package from being imported.

## [0.1.0] 2020-11-01
 - Package Release 🥰!
