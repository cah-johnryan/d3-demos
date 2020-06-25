import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | time-series-with-thresholds', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:time-series-with-thresholds');
    assert.ok(route);
  });
});
