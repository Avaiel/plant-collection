// Netlify Function: persists the whole plant collection to Netlify Blobs.
// This is the source of truth for the site's data — no external account needed,
// Netlify provisions and manages this storage automatically per site.
//
// GET  -> returns { plants: [...] }
// POST -> body { plants: [...] }, overwrites the stored collection

const { connectLambda, getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  connectLambda(event);
  const store = getStore('plant-collection');

  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get('collection', { type: 'json' });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plants: data || [] })
      };
    } catch (err) {
      console.error('plants GET failed:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message || '读取失败' }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const plants = Array.isArray(body.plants) ? body.plants : [];
      await store.setJSON('collection', plants);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, count: plants.length })
      };
    } catch (err) {
      console.error('plants POST failed:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message || '保存失败' }) };
    }
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
