import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | temperatures-over-time', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:temperatures-over-time');
    assert.ok(route);
  });
});
