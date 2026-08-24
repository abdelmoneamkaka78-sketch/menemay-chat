module.exports = async function handler(req, res) {
  // التأكد من أن الطلب هو POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // قراءة البيانات بأمان تام سواء كانت كائن أو نص
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const messages = body && body.messages;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // التأكد من وجود مفتاح الـ API في إعدادات Vercel
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API Key is missing in Vercel settings' });
    }

    // الاتصال بـ OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // إرسال رد الذكاء الاصطناعي للواجهة الأمامية
    return res.status(200).json({ reply: reply });

  } {
    catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
