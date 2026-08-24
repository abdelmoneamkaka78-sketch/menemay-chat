export default async function handler(req, res) {
  // التأكد من أن الطلب هو POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // الاتصال المباشر بـ OpenAI API باستخدام المفتاح السري المخزن في Vercel
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // يمكنك تغيير النموذج حسب رغبتك (مثل gpt-4o أو gpt-3.5-turbo)
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

    // إرسال رد الذكاء الاصطناعي إلى الواجهة الأمامية
    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

