import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | simple-linear', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:simple-linear');
    assert.ok(route);
  });
});
