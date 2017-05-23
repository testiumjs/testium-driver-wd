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
