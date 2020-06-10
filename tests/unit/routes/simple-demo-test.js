import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | simple-demo', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:simple-demo');
    assert.ok(route);
  });
});
