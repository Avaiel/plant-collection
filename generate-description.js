// Netlify Function: proxies a description-generation request to the Gemini API.
// Keeps GEMINI_API_KEY on the server so it's never exposed to the browser.
//
// Set up:
// 1. Get a key at https://aistudio.google.com/apikey
// 2. In Netlify: Site settings -> Environment variables -> add GEMINI_API_KEY
// 3. Deploy. This function will be reachable at /.netlify/functions/generate-description

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: '请求格式不对' }) };
  }

  const { name, sci, location, imageBase64, mediaType } = payload;

  if (!name) {
    return { statusCode: 400, body: JSON.stringify({ error: '缺少植物名称' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: '服务端还没配置 GEMINI_API_KEY 环境变量' }) };
  }

  const parts = [];
  if (imageBase64 && mediaType) {
    parts.push({ inline_data: { mime_type: mediaType, data: imageBase64 } });
  }
  parts.push({
    text: `这是一株植物，名称是「${name}」${sci ? `，学名 ${sci}` : ''}${location ? `，收藏地点是 ${location}` : ''}。` +
          `请用中文写一段 60-100 字的简介，语气平实、像笔记一样，可以提到它的外观特征、习性或有趣之处，` +
          `不要用"亲爱的"这类称呼语，也不要分点，直接给出这段文字，不要任何其他说明。`
  });

  try {
    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      const message = (data && data.error && data.error.message) || 'Gemini 接口调用失败';
      return { statusCode: resp.status, body: JSON.stringify({ error: message }) };
    }

    const candidate = data.candidates && data.candidates[0];
    const text = candidate && candidate.content && candidate.content.parts
      ? candidate.content.parts.map(p => p.text || '').join('').trim()
      : '';

    if (!text) {
      return { statusCode: 502, body: JSON.stringify({ error: 'AI 没有返回文字内容，换张图或稍后再试试' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || '请求失败' }) };
  }
};
