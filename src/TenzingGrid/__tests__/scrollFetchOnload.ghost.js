/* global describe */
/* global it */
import assert from 'assert';
import ghost from 'ghostjs';

describe('TenzingGrid > ScrollFetch onload', () => {
  it('Limits scrollFetch count', async () => {
    ghost.close();
    await ghost.open('http://localhost:3000/TenzingGrid?manualFetch=1', {
      viewportSize: {
        width: 800,
        height: 600,
      },
    });

    const initialFetchCount = await ghost.script(() => window.TEST_FETCH_COUNTS);
    assert.equal(initialFetchCount, null);

    // Fetches 1 time if the viewport is big enough
    ghost.close();
    await ghost.open('http://localhost:3000/TenzingGrid', {
      viewportSize: {
        width: 2000,
        height: 1000,
      },
    });
    await ghost.script(() => window.NEXT_FETCH());
    const largerFetchCount = await ghost.script(() => window.TEST_FETCH_COUNTS);
    assert.ok(largerFetchCount >= 1);
  });
});
