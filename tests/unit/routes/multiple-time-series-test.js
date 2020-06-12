import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | multiple-time-series', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:multiple-time-series');
    assert.ok(route);
  });
});
