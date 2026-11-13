import test from 'node:test';
import assert from 'node:assert/strict';

const errorBase = process.env.TEST_ERROR_BASE_URL;
const emptyBase = process.env.TEST_EMPTY_BASE_URL;

test('error scenario consistently fails reads and desired-state writes', {skip: !errorBase}, async () => {
  for (const suffix of ['?resource=catalog', '?resource=search&q=Kevin', '?resource=playlist&id=acoustic']) {
    const response = await fetch(`${errorBase}/api/music${suffix}`);
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'DEMO_ERROR');
  }
  const response = await fetch(`${errorBase}/api/music`, {
    method: 'POST', body: JSON.stringify({trackId: 'carefree', liked: true}),
    headers: {'Content-Type': 'application/json'},
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'DEMO_ERROR');
});

test('empty scenario has valid empty collections and no phantom detail', {skip: !emptyBase}, async () => {
  const response = await fetch(`${emptyBase}/api/music`);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, {
    tracks: [], playlists: [], categories: [], notifications: [], currentTrackId: null,
  });
  const search = await fetch(`${emptyBase}/api/music?resource=search&q=Kevin`);
  assert.deepEqual((await search.json()).data, {tracks: [], playlists: [], artists: []});
  const detail = await fetch(`${emptyBase}/api/music?resource=playlist&id=acoustic`);
  assert.equal(detail.status, 404);
  assert.equal((await detail.json()).error.code, 'NOT_FOUND');
});
