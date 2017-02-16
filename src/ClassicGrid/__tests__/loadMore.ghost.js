/* global describe */
/* global it */
import assert from 'assert';
import ghost from 'ghostjs';

const selectors = {
  gridItem: '[class^="Grid__Grid__Item"]',
  staticItem: '.static',
};

describe('ClassicGrid > Scrolls', () => {
  it('Loads more when it gets to the bottom of the viewport', async () => {
    // First load the page with javascript disabled to get the item position
    ghost.close();
    await ghost.open('http://localhost:3000/ClassicGrid?deferMount=1&manualFetch=1', {
      viewportSize: {
        width: 3000,
        height: 2000,
      },
    });

    const serverItems = await ghost.findElements(selectors.staticItem);

    // Hard-coded value for initial pins in server.js
    const initialServerItemCount = 20;
    assert.equal(serverItems.length, initialServerItemCount);

    await ghost.script(() => {
      window.dispatchEvent(new CustomEvent('trigger-mount'));
    });

    // We should fetch more items on render to fill the viewport.
    await ghost.script(() => window.NEXT_FETCH());
    let afterLoadItemCount;
    let gridItems;
    await ghost.wait(async () => {
      gridItems = await ghost.findElements(selectors.gridItem);
      afterLoadItemCount = gridItems.length;
      return afterLoadItemCount > initialServerItemCount;
    });
    await ghost.script(() => window.NEXT_FETCH());

    const initialFetchCount = await ghost.script(() => window.TEST_FETCH_COUNTS);
    assert.ok(initialFetchCount >= 1);

    // Scroll a few times to triggle multiple scrolls.
    await ghost.script(() => window.scrollTo(0, window.scrollMaxY));
    await ghost.wait(50);
    await ghost.script(() => window.scrollTo(0, window.scrollMaxY - 50));
    await ghost.wait(50);
    await ghost.script(() => window.scrollTo(0, window.scrollMaxY));
    await ghost.script(() => window.NEXT_FETCH());

    const newFetchCount = await ghost.script(() => window.TEST_FETCH_COUNTS);
    assert.equal(newFetchCount, initialFetchCount + 1);

    await ghost.wait(async () => {
      gridItems = await ghost.findElements(selectors.gridItem);
      return gridItems.length > afterLoadItemCount;
    });
  });
});
