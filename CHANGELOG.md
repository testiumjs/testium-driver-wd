### v4.1.3 (2021-07-19)
<a id="v4.1.3"></a>
#### 🏡 Internal

* [#71](https://github.com/testiumjs/testium-driver-wd/pull/71) update deps & switch to github actions ([@aotarola](https://github.com/aotarola))
* [`6129918`](https://github.com/testiumjs/testium-driver-wd/commit/61299181d1e5688581f718d9e4df42aab7cb5c1a) chore: some of lighthouse's audits have details, but not a details.items, so the line would automatically fail when used.
* [`9193776`](https://github.com/testiumjs/testium-driver-wd/commit/91937761305de830d393ff4377f0b25810d314a3) chore: update lib/browser/lighthouse.js


### v4.1.2 (2021-02-23)

#### 🐛 Bug Fixes

* [#62](https://github.com/testiumjs/testium-driver-wd/pull/62) fix: loadPage JSDOC + add @example ([@aaarichter](https://github.com/aaarichter)) 


### v4.1.1 (2021-02-18)

#### 🐛 Bug Fixes

* [#61](https://github.com/testiumjs/testium-driver-wd/pull/61) fix: getCookieValue() throwing on missing cookie ([@aaarichter](https://github.com/aaarichter)) 


### v4.1.0 (2021-02-17)

#### 🚀 New Features

* [#60](https://github.com/testiumjs/testium-driver-wd/pull/60) feat: new assertion functions & more ([@aaarichter](https://github.com/aaarichter)) 


### v4.0.3 (2021-02-09)

#### 📦️ Code Refactoring

* [#59](https://github.com/testiumjs/testium-driver-wd/pull/59) refactor: move promise chain methods to according files & increate default page size to 1400x1000 ([@aaarichter](https://github.com/aaarichter)) 


### v4.0.2 (2021-01-26)

#### 📦️ Code Refactoring

* [#58](https://github.com/testiumjs/testium-driver-wd/pull/58) refactor: replace lodash & assertive usage ([@aaarichter](https://github.com/aaarichter)) 


### 4.0.1 - 2020-07-20

* chore(deps): bump lodash from 4.17.15 to 4.17.19 - **[@dependabot[bot]](https://github.com/apps/dependabot)** [#55](https://github.com/testiumjs/testium-driver-wd/pull/55)
  - [`7d05215`](https://github.com/testiumjs/testium-driver-wd/commit/7d052151cc991fc8df8dc64dead7b6dc81c1ea37) **chore:** bump lodash from 4.17.15 to 4.17.19 - see: [4](- [Commits](https://github.com/lodash/lodash/compare/4)


### 4.0.0 - 2020-06-10

#### Breaking Changes



*See: [`c69bd29`](https://github.com/testiumjs/testium-driver-wd/commit/c69bd290c16df18f14336df5ef02b15ca19d91f8)*

#### Commits

* chore: upgrade dependencies (puppeteer 3.x & lighthouse 6.x) - **[@aaarichter](https://github.com/aaarichter)** [#54](https://github.com/testiumjs/testium-driver-wd/pull/54)
  - [`e7ebe77`](https://github.com/testiumjs/testium-driver-wd/commit/e7ebe7792bf025a23c3096f5d6ddc9521c48a53d) **chore:** update dependencies & lint
  - [`55aca57`](https://github.com/testiumjs/testium-driver-wd/commit/55aca57e58fe44d4e2394a564bdd852600fb2c0f) **chore:** upgrade to puppeeteer 3.x
  - [`3df1d88`](https://github.com/testiumjs/testium-driver-wd/commit/3df1d88238b1b818115fa5132d381ec57b8f7352) **chore:** set node 14 in travis.yml
  - [`0db83aa`](https://github.com/testiumjs/testium-driver-wd/commit/0db83aab4130a6d4e8c131e6fae04a6ad3dccc99) **chore:** upgrade uuid
  - [`c69bd29`](https://github.com/testiumjs/testium-driver-wd/commit/c69bd290c16df18f14336df5ef02b15ca19d91f8) **chore:** upgrade lighthouse from 5.x to 6.x - see: [testiumjs//github.com/GoogleChrome/lighthouse/blob/master/changelog.md#600-2020-05-19](https://github.com/testiumjs//github.com/GoogleChrome/lighthouse/blob/master/changelog.md/issues/600-2020-05-19)
  - [`2b7b665`](https://github.com/testiumjs/testium-driver-wd/commit/2b7b665ea14b1359a8e2f1d41b3d3fe02200e5a1) **chore:** update dependencies & travis syntax


### 3.1.1 - 2020-04-07

* style: rename types - **[@aaarichter](https://github.com/aaarichter)** [#52](https://github.com/testiumjs/testium-driver-wd/pull/52)
  - [`4f8ffe1`](https://github.com/testiumjs/testium-driver-wd/commit/4f8ffe1cda30b1d946f0dd25832e1d540d281ca4) **docs:** update typescript & add getLighthouseData()


### 3.1.0 - 2020-04-03

* feat: browser.getUrlObj() - **[@aaarichter](https://github.com/aaarichter)** [#51](https://github.com/testiumjs/testium-driver-wd/pull/51)
  - [`e157fd9`](https://github.com/testiumjs/testium-driver-wd/commit/e157fd9f00c54114c0081b532dd26885ea06450c) **feat:** browser.getUrlObj()


### 3.0.0 - 2020-03-31

#### Breaking Changes

- Node 8 is no longer supported

*See: [`faa6282`](https://github.com/testiumjs/testium-driver-wd/commit/faa62829355d196aebcb8856df6f289f92105318)*

- the accessibility audit list changed from the manual audit list to the LH default one
- the LH result object (v5.x) might be different to the previous one (v3.x)

*See: [`1f31f26`](https://github.com/testiumjs/testium-driver-wd/commit/1f31f2668dc3d231581e4d1ea32c4723df49bd6c)*

- renamed `assertLighthouseScore` with `assertAccessibilityScore` and removed `flags` and `config` arguments
- `assertAccessibilityScore` and other lighthouse assertions now return the parsed result
- the result function `isSuccess` now asserts the passed value against the calculated score.

*See: [`31051be`](https://github.com/testiumjs/testium-driver-wd/commit/31051be32a69475d8f3212464cc27c3d2a61f9e1)*

withPuppeteerPage() will have a puppeteer 2.x Page object as function argument

*See: [`be85173`](https://github.com/testiumjs/testium-driver-wd/commit/be851738db28ef5baab2ef4668289309c51e844c)*

`browser.clickOn(selector)` will throw when more than one element is matched

*See: [`140cf29`](https://github.com/testiumjs/testium-driver-wd/commit/140cf2913eca94eb005e6628545e1160c137e0a5)*

#### Commits

* feat: lighthouse v5.6, puppeteer-core 2.x & drop Node 8 support - **[@aaarichter](https://github.com/aaarichter)** [#50](https://github.com/testiumjs/testium-driver-wd/pull/50)
  - [`faa6282`](https://github.com/testiumjs/testium-driver-wd/commit/faa62829355d196aebcb8856df6f289f92105318) **chore:** drop Node 8 support
  - [`1f31f26`](https://github.com/testiumjs/testium-driver-wd/commit/1f31f2668dc3d231581e4d1ea32c4723df49bd6c) **feat:** upgrade lighthouse 5.6 & add methods to run all LH categories
  - [`3828d21`](https://github.com/testiumjs/testium-driver-wd/commit/3828d2169a49b6e318abf9e8e1ab2d4d3ab50686) **test:** fix various tests and make chrome default test browser
  - [`31051be`](https://github.com/testiumjs/testium-driver-wd/commit/31051be32a69475d8f3212464cc27c3d2a61f9e1) **refactor:** clean up lighthouse functions
  - [`be85173`](https://github.com/testiumjs/testium-driver-wd/commit/be851738db28ef5baab2ef4668289309c51e844c) **feat:** upgrade to puppeteer 2.x
  - [`fec8d51`](https://github.com/testiumjs/testium-driver-wd/commit/fec8d51e4a1df7109cc7039ea3181eb06d697bce) **fix:** remove legacy lighthouse loading code
  - [`a324db1`](https://github.com/testiumjs/testium-driver-wd/commit/a324db1092d335de703aedca0abfd22176d01af3) **feat:** add clickOnAll() to allow clicking all matching elements
  - [`140cf29`](https://github.com/testiumjs/testium-driver-wd/commit/140cf2913eca94eb005e6628545e1160c137e0a5) **fix:** throw `clickOn()` when selector matches more than one element (addresses #28) - see: [#28](https://github.com/testiumjs/testium-driver-wd/issues/28)
  - [`42b275e`](https://github.com/testiumjs/testium-driver-wd/commit/42b275e2292746ee88ac95cd9b5dd85441037bc0) **style:** lint
  - [`c562366`](https://github.com/testiumjs/testium-driver-wd/commit/c5623661f24a7ad1cbc4224aab174616d36bc776) **fix:** address feedback
  - [`df99704`](https://github.com/testiumjs/testium-driver-wd/commit/df997044caab9ff004523d33188a27de6f45f19c) **chore:** upgrade testium-cookie 2.x


### 2.10.3

* chore: upgrade packages - **[@aaarichter](https://github.com/aaarichter)** [#49](https://github.com/testiumjs/testium-driver-wd/pull/49)
  - [`da15f43`](https://github.com/testiumjs/testium-driver-wd/commit/da15f4351bb3b65418ec6a3876528e41c1f15a6b) **chore:** upgrade packages
  - [`9bc4e63`](https://github.com/testiumjs/testium-driver-wd/commit/9bc4e632b71ea8b8187211302be78ce86c736e14) **chore:** downgrade package to support node 8


### 2.10.2

* package updates - **[@aaarichter](https://github.com/aaarichter)** [#48](https://github.com/testiumjs/testium-driver-wd/pull/48)
  - [`3d3d8a8`](https://github.com/testiumjs/testium-driver-wd/commit/3d3d8a86a48207d3f51c887a4df5826d5135aae8) **chore:** update dependencies
  - [`fc0132f`](https://github.com/testiumjs/testium-driver-wd/commit/fc0132fe392cd5afa6db47d63f9610853f8177b8) **chore:** upgrade semver, gofer, eslint-plugin-node
  - [`e012867`](https://github.com/testiumjs/testium-driver-wd/commit/e0128672d708ae9b83d08a302b99e017f6e11b41) **chore:** upgrade semver, eslint-plugin-node
  - [`ae3e676`](https://github.com/testiumjs/testium-driver-wd/commit/ae3e67628fdcba80ac8c51ea8d18820a6b8a9893) **fix:** add package.json


### 2.10.1

* chore: remove co - **[@aotarola](https://github.com/aotarola)** [#47](https://github.com/testiumjs/testium-driver-wd/pull/47)
  - [`2aa7e68`](https://github.com/testiumjs/testium-driver-wd/commit/2aa7e683931f0c2a354f229992f0966a4ba274aa) **chore:** remove co
  - [`8044508`](https://github.com/testiumjs/testium-driver-wd/commit/8044508cfcb1794124cd17304bcaf0ba0982e818) **test:** linter string
  - [`b7dbe8a`](https://github.com/testiumjs/testium-driver-wd/commit/b7dbe8ab566028697497875aef2341cf77bbba51) **chore:** update deps & syntax


### 2.10.0

* feat: new a11yAudit function - **[@JimLiu](https://github.com/JimLiu)** [#46](https://github.com/testiumjs/testium-driver-wd/pull/46)
  - [`64dc418`](https://github.com/testiumjs/testium-driver-wd/commit/64dc4188e3cf6ed61adf79ce8f5b9868a9789b38) **feat:** new a11yAudit function


### 2.9.0

* feat: Add new evaluateAsync function - **[@JimLiu](https://github.com/JimLiu)** [#45](https://github.com/testiumjs/testium-driver-wd/pull/45)
  - [`0fa2987`](https://github.com/testiumjs/testium-driver-wd/commit/0fa2987cc20315adff46a2d507d815eb9d5f564c) **feat:** Add new evaluateAsync function


### 2.8.1

* fix: pass flags to lighthouse audit from loadPage - **[@anil-groupon](https://github.com/anil-groupon)** [#44](https://github.com/testiumjs/testium-driver-wd/pull/44)
  - [`f13b310`](https://github.com/testiumjs/testium-driver-wd/commit/f13b310b38a4c8b2d49be017fa810d6972372803) **fix:** pass flag to lighthouse from loadPage


### 2.8.0

* feat: optional accessibility check with loadPage - **[@anil-groupon](https://github.com/anil-groupon)** [#43](https://github.com/testiumjs/testium-driver-wd/pull/43)
  - [`379327c`](https://github.com/testiumjs/testium-driver-wd/commit/379327c685f263376ca38aa05eb1d63663b2aecf) **feat:** optional accessibility check with loadPage
  - [`830c5e7`](https://github.com/testiumjs/testium-driver-wd/commit/830c5e75796ac678cec5c52398cc7c7ece222c9b) **fix:** linting issue


### 2.7.1

* chore: update dependencies - **[@aaarichter](https://github.com/aaarichter)** [#41](https://github.com/testiumjs/testium-driver-wd/pull/41)
  - [`28588d5`](https://github.com/testiumjs/testium-driver-wd/commit/28588d5d494a6d839ebf472c0c30eabaa5724a93) **chore:** update dependencies
  - [`4f4c33d`](https://github.com/testiumjs/testium-driver-wd/commit/4f4c33d3361a9c53c84ed8e74d048872f5093bfe) **fix:** path change of accessibility audit
  - [`0f62ecd`](https://github.com/testiumjs/testium-driver-wd/commit/0f62ecd678c12899bd159cda8053b54fc82fbf52) **fix:** small change in LH result parser


### 2.7.0

* feat: have loadPage() wait for load event by default - **[@davidmichaelryan](https://github.com/davidmichaelryan)** [#39](https://github.com/testiumjs/testium-driver-wd/pull/39)
  - [`3344ea9`](https://github.com/testiumjs/testium-driver-wd/commit/3344ea9849b98c3aab0a8bdfa356e4fbe60fc566) **feat:** have loadPage() wait for load event by default
  - [`e155867`](https://github.com/testiumjs/testium-driver-wd/commit/e155867ad3f890caf1e4745f3f3d51584f1e9bb5) **chore:** address comments


### 2.6.0

* feat: Add supporting APIs for lighthouse - **[@anil-groupon](https://github.com/anil-groupon)** [#38](https://github.com/testiumjs/testium-driver-wd/pull/38)
  - [`51fb38f`](https://github.com/testiumjs/testium-driver-wd/commit/51fb38f92921c8bd1db540c2013c8c323d756b34) **feat:** Add supporting APIs for lighthouse
  - [`47115be`](https://github.com/testiumjs/testium-driver-wd/commit/47115be5fbfe7d5055937b953a5699f1fa8db4bd) **chore:** fix linting
  - [`dbf5b7a`](https://github.com/testiumjs/testium-driver-wd/commit/dbf5b7a555a7b78946ae11378e4df30aed233faf) **chore:** handle comments
  - [`a34b9d1`](https://github.com/testiumjs/testium-driver-wd/commit/a34b9d175ad8940dcacd6fe4192449d232f74188) **chore:** fix linting
  - [`dc34a68`](https://github.com/testiumjs/testium-driver-wd/commit/dc34a68af21dd77d8aa6eafed5ec886821921c5d) **chore:** test fixes
  - [`070ad14`](https://github.com/testiumjs/testium-driver-wd/commit/070ad14e54e348e53a843c2830112c614f2ab467) **chore:** throw error when audits results can't be fetched


### 2.5.1

* chore: upgrade wd to v1.10.1 - **[@aaarichter](https://github.com/aaarichter)** [#37](https://github.com/testiumjs/testium-driver-wd/pull/37)
  - [`d280f02`](https://github.com/testiumjs/testium-driver-wd/commit/d280f029f639c81d549a88fd01caaa73ad171e1f) **chore:** upgrade wd to v1.10.1


### 2.5.0

* Add puppeteer and lighthouse integration - **[@jkrems](https://github.com/jkrems)** [#36](https://github.com/testiumjs/testium-driver-wd/pull/36)
  - [`b7582a5`](https://github.com/testiumjs/testium-driver-wd/commit/b7582a5123865f9946fa0664b2e804a401f8a8c9) **feat:** Add puppeteer and lighthouse integration
  - [`33d7144`](https://github.com/testiumjs/testium-driver-wd/commit/33d71440c2905c071e3a31b8ef39e75979794e68) **chore:** Stop testing on node 4 (EOL)
  - [`15d98aa`](https://github.com/testiumjs/testium-driver-wd/commit/15d98aaffa6aacfe6c582931e0c23294e9a02b17) **feat:** Expose lighthouse config argument


### 2.4.0

* feat: expose getChromeDevtoolsPort method - **[@anil-groupon](https://github.com/anil-groupon)** [#35](https://github.com/testiumjs/testium-driver-wd/pull/35)
  - [`4517c0a`](https://github.com/testiumjs/testium-driver-wd/commit/4517c0ac99138e64f58e3e3c8b42003384e0b38e) **feat:** expose getChromeDevtoolsPort method
  - [`2299ec7`](https://github.com/testiumjs/testium-driver-wd/commit/2299ec7cb7a1da7c00f8c5a2cad92688dd0f3b81) **fix:** eslint


### 2.3.0

* use all `desiredCapabilities` in driver - **[@dbushong](https://github.com/dbushong)** [#34](https://github.com/testiumjs/testium-driver-wd/pull/34)
  - [`e47b081`](https://github.com/testiumjs/testium-driver-wd/commit/e47b081114423aad425cad9353c24e744591577f) **feat:** use all `desiredCapabilities` in driver


### 2.2.0

* drop bluebird dependency - **[@dbushong](https://github.com/dbushong)** [#33](https://github.com/testiumjs/testium-driver-wd/pull/33)
  - [`d90a8e5`](https://github.com/testiumjs/testium-driver-wd/commit/d90a8e5c6e7cb151ba9cf1f7d19b9a105372b0cb) **feat:** drop bluebird dependency


### 2.1.0

* generate a default X-Request-Id header - **[@dbushong](https://github.com/dbushong)** [#32](https://github.com/testiumjs/testium-driver-wd/pull/32)
  - [`ef74efe`](https://github.com/testiumjs/testium-driver-wd/commit/ef74efe29655c27a2268f82ae04e665e57a42e42) **feat:** generate a default X-Request-Id header


### 2.0.0

#### Breaking Changes

now requires node >= 4.x

*See: [`f079e1b`](https://github.com/testiumjs/testium-driver-wd/commit/f079e1bbe8335958df860c4869994bfd5757521c)*

#### Commits

* re-run generator and stop using babel - **[@dbushong](https://github.com/dbushong)** [#31](https://github.com/testiumjs/testium-driver-wd/pull/31)
  - [`f079e1b`](https://github.com/testiumjs/testium-driver-wd/commit/f079e1bbe8335958df860c4869994bfd5757521c) **chore:** re-run generator and stop using babel


### 1.9.1

* fix: don't pass expectedStatusCode thru as option - **[@dbushong](https://github.com/dbushong)** [#29](https://github.com/testiumjs/testium-driver-wd/pull/29)
  - [`846b9f6`](https://github.com/testiumjs/testium-driver-wd/commit/846b9f699280df5d8a86c6b8f5c7ea97abd9f9de) **fix:** don't pass expectedStatusCode thru as option


### 1.9.0

* feat: wait for document states - **[@aaarichter](https://github.com/aaarichter)** [#27](https://github.com/testiumjs/testium-driver-wd/pull/27)
  - [`0d169cd`](https://github.com/testiumjs/testium-driver-wd/commit/0d169cddb0a978cb1dd91914a0d55472f55bbbee) **feat:** wait for document states


### 1.8.1

* fix: use proper Q library through wd - **[@dbushong](https://github.com/dbushong)** [#26](https://github.com/testiumjs/testium-driver-wd/pull/26)
  - [`3c49a2b`](https://github.com/testiumjs/testium-driver-wd/commit/3c49a2b5306d9e6cfcb3e264b02efda7febcae70) **fix:** use proper Q library through wd


### 1.8.0

* feat: browser.assertElementsNumber(selector, num) - **[@dbushong](https://github.com/dbushong)** [#25](https://github.com/testiumjs/testium-driver-wd/pull/25)
  - [`c33702f`](https://github.com/testiumjs/testium-driver-wd/commit/c33702f30e8082aa9b57d8af70e8836c632349db) **feat:** browser.assertElementsNumber(selector, num)


### 1.7.1

* fix: don't die if we can't set longStackTrace - **[@dbushong](https://github.com/dbushong)** [#24](https://github.com/testiumjs/testium-driver-wd/pull/24)
  - [`6363eb3`](https://github.com/testiumjs/testium-driver-wd/commit/6363eb3388087876f7cf377e5a05661b9f52a9cf) **fix:** don't die if we can't set longStackTrace


### 1.7.0

* feat: show long stack traces on errors - **[@dbushong](https://github.com/dbushong)** [#23](https://github.com/testiumjs/testium-driver-wd/pull/23)
  - [`32d44b5`](https://github.com/testiumjs/testium-driver-wd/commit/32d44b576f16a640a0ff41d203c70417a8ba2009) **feat:** show long stack traces on errors
  - [`d24d8c6`](https://github.com/testiumjs/testium-driver-wd/commit/d24d8c654c8822b43cfddb9299a734c76f60eb7a) **chore:** bump node versions for testing


### 1.6.1

* fix: support `mixins.wd[] = 'some-module'` - **[@dbushong](https://github.com/dbushong)** [#22](https://github.com/testiumjs/testium-driver-wd/pull/22)
  - [`97ca84f`](https://github.com/testiumjs/testium-driver-wd/commit/97ca84f4fd66448bb29ef1f0c11ff864c0099457) **fix:** support `mixins.wd[] = 'some-module'`


### 1.6.0

* feat: add browser.loadPage as better navigateTo - **[@dbushong](https://github.com/dbushong)** [#21](https://github.com/testiumjs/testium-driver-wd/pull/21)
  - [`fa450b4`](https://github.com/testiumjs/testium-driver-wd/commit/fa450b4b9b5c9faeee742901bca34bd355b15426) **feat:** add browser.loadPage as better navigateTo


### 1.5.1

* fix: fallback default for setCookieValue - **[@dbushong](https://github.com/dbushong)** [#20](https://github.com/testiumjs/testium-driver-wd/pull/20)
  - [`1aa6ce4`](https://github.com/testiumjs/testium-driver-wd/commit/1aa6ce401875b7e8ff1f6a906e6e90c9b23fa783) **fix:** fallback default for setCookieValue


### 1.5.0

* feat: add setCookieValues() method - **[@dbushong](https://github.com/dbushong)** [#18](https://github.com/testiumjs/testium-driver-wd/pull/18)
  - [`7186580`](https://github.com/testiumjs/testium-driver-wd/commit/718658005e2733059550271fa37caf8f85b88e26) **feat:** add setCookieValues() method


### 1.4.0

* feat: add 2 missing methods - **[@dbushong](https://github.com/dbushong)** [#17](https://github.com/testiumjs/testium-driver-wd/pull/17)
  - [`b728a17`](https://github.com/testiumjs/testium-driver-wd/commit/b728a17ce04aaf6e690d9170c9e3ee7e41adf12a) **feat:** add 2 missing methods


### 1.3.0

* cookie domain & upgrades - **[@dbushong](https://github.com/dbushong)** [#16](https://github.com/testiumjs/testium-driver-wd/pull/16)
  - [`7bdcbda`](https://github.com/testiumjs/testium-driver-wd/commit/7bdcbda778b66610384c5027d0f3e7227a861d02) **chore:** bump versions of wd, lint, etc
  - [`ed27493`](https://github.com/testiumjs/testium-driver-wd/commit/ed274934b5771a6e8a62a4c18f44e8240d28bc14) **feat:** set the cookie domain to the proxy host


### 1.2.4

* Compatible with phantomjs 2.1 - **[@jkrems](https://github.com/jkrems)** [#15](https://github.com/testiumjs/testium-driver-wd/pull/15)
  - [`253b3b5`](https://github.com/testiumjs/testium-driver-wd/commit/253b3b527abaaaffc4af83969993d6d890912ba8) **fix:** Compatible with phantomjs 2.1


### 1.2.3

* fix: typo of debug prefix - **[@dbushong](https://github.com/dbushong)** [#14](https://github.com/testiumjs/testium-driver-wd/pull/14)
  - [`3b22ebc`](https://github.com/testiumjs/testium-driver-wd/commit/3b22ebccc8f2459ec11419fe6b5af0a97f445acf) **fix:** typo of debug prefix


### 1.2.2

* test: add buttonUp/Down moveTo tests - **[@dbushong](https://github.com/dbushong)** [#13](https://github.com/testiumjs/testium-driver-wd/pull/13)
  - [`76c19eb`](https://github.com/testiumjs/testium-driver-wd/commit/76c19ebd4d24794f7010a3d5a8c52c93a5af5044) **test:** add buttonUp/Down moveTo tests


### 1.2.1

* Apply latest nlm generator - **[@i-tier-bot](https://github.com/i-tier-bot)** [#11](https://github.com/testiumjs/testium-driver-wd/pull/11)
  - [`54b18ce`](https://github.com/testiumjs/testium-driver-wd/commit/54b18ce17c476b9070efb5cd39e19be784510316) **chore:** Apply latest nlm generator
  - [`ffe2020`](https://github.com/testiumjs/testium-driver-wd/commit/ffe2020b93c97b81847b355ae3ca5def0e07462f) **chore:** Shuffle contributors for better release commits
  - [`baa037b`](https://github.com/testiumjs/testium-driver-wd/commit/baa037b7c5565e731148222b602fdaae8e58f4aa) **fix:** Lodash v4: pairs -> toPairs
  - [`77ad855`](https://github.com/testiumjs/testium-driver-wd/commit/77ad8557bcbd940ffc4d2eab2fee6d3665d85c0f) **chore:** Add missing license headers


1.2.0
-----
fe7a4d6 Merge pull request #10 from testiumjs/fill-fields
7b9b213 feat: Add `fillFields` to fill multiple form fields
616e5c0 Merge pull request #9 from testiumjs/jk-eslint-style
bab0e66 style: eslint --fix
18daf87 Merge pull request #8 from testiumjs/jk-use-groupon-config
7a3d524 Use eslint-config-groupon
d9d13b1 Merge pull request #7 from testiumjs/jk-contributors
edd48a2 Port contributor info, add code of conduct

1.1.0
-----
Big release that tries to achieve parity with the sync driver.

More info: https://github.com/testiumjs/testium-driver-wd/pull/4

2769c15 Merge pull request #4 from testiumjs/jk-the-rest
7721cfa Add {get,set}CookieValue
e447b6f Add browser.{clear,type}
40ee931 Fix casing of bluebird import
7df4a69 Use latest example app with fixed frame setup
0e9338d Port window tests
7661dff Enable ssl test, move unicode into form test
2277f83 Combine screenshot test with page data test
bbe2df9 Enable proxy test
94c7eea Add form tests
fea3701 Stabilize test suite on chrome
271d80a Port page data tests
89b1e75 Add support for non-browser tests
690337d Header tests enabled
25b52ce Dialog tests
a5be8bf Merge branch 'master' into jk-element
196df23 Merge pull request #6 from testiumjs/jk-mixins
9cc56ea Add support for mixins
95dde04 Mention getElementOrNull when element is missing
7fb44d1 Properly generate the too many elements error
33898e3 Make use of the stored capabilities
d276afd Use element.get over element.getAttribute
be128a8 Be more explicit about why we need our own waitFor
0ea541c Remove commented-out code
66115b1 Add remaining element & evaluate tests
c2c966e WIP - exist/displayed assertions
4a0341f WIP - More element methods
3a0169f WIP - Add element exist assertions
06d4ab1 Merge pull request #2 from testiumjs/jk-console-tests
c6111c8 Add console test
46a1113 Only pass test/ into babel

1.0.0
-----
* Initial release
