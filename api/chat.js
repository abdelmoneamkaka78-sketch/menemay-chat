export default async function handler(req, res) {
  // 1. السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    // 2. التحقق من صحة البيانات المستقبلة
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'الرجاء إرسال مصفوفة رسائل صالحة.' });
    }

    // 3. التحقق من وجود مفتاح API في إعدادات Vercel
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'لم يتم ضبط OPENAI_API_KEY في Environment Variables بـ Vercel.' 
      });
    }

    // 4. الاتصال بـ OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // يمكنك تغييره إلى gpt-4o إذا أردت
        messages: messages,
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 5. معالجة الأخطاء القادمة من OpenAI (مثل نفاذ الرصيد أو مفتاح خاطئ)
    if (!response.ok) {
      console.error('OpenAI Error Details:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'حدث خطأ من طرف OpenAI.' 
      });
    }

    // 6. استخراج الرد وإرساله للواجهة الأمامية
    const reply = data.choices?.[0]?.message?.content || 'لم يتم استلام نص الرد.';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Internal Error:', error);
    return res.status(500).json({ error: 'حدث خطأ داخلي في الخادم.' });
  }
}
