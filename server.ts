import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INITIAL_DEFAULT_LIST = {
  id: 'list-1',
  title: 'أشهر 100 اسم ولد سعودي',
  category: 'السعودية والخليج',
  description: 'أشهر الأسماء الرجالية المنتمية للمجتمع والثقافة السعودية عبر الأجيال.',
  criteria: 'مرتبة حسب الأكثر انتشاراً وشهرة في السجلات والثقافة السعودية',
  answers: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    rank: i + 1,
    text: `عنصر ${i + 1}`,
    points: i + 1,
    synonyms: []
  }))
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const PORT = process.env.PORT || 3000;

  let serverGameState: any = {
    status: 'setup',
    settings: {
      team1: { id: 'team1', name: 'صقور السعودية', color: '#922D50', avatar: '🦅', score: 0, strikes: 0 },
      team2: { id: 'team2', name: 'فرسان نجد', color: '#D99AAA', avatar: '⭐', score: 0, strikes: 0 },
      totalRounds: 3,
      currentRoundIndex: 0,
      maxStrikes: 3,
      roundDurationSeconds: 60,
      gameMode: 'normal',
      soundEnabled: true,
      selectedListIds: ['list-1']
    },
    currentList: INITIAL_DEFAULT_LIST,
    activeTeamId: 'team1',
    revealedAnswerIds: [],
    currentStrikes: 0,
    timerSecondsLeft: 60,
    isTimerRunning: false,
    logs: [],
    historyRounds: []
  };

  let sseClients: any[] = [];

  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify(serverGameState)}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter(client => client !== res);
    });
  });

  app.get('/api/state', (req, res) => {
    res.json(serverGameState);
  });

  app.post('/api/state', (req, res) => {
    if (req.body && req.body.settings) {
      serverGameState = req.body;
      
      const payload = `data: ${JSON.stringify(serverGameState)}\n\n`;
      sseClients.forEach(client => {
        try {
          client.write(payload);
        } catch {
          // ignore
        }
      });
    }
    res.json({ success: true, state: serverGameState });
  });

  // API endpoint to generate 100-item Saudi list using Gemini AI with points equal to rank (Rank 1 = 1 point, Rank 100 = 100 points)
  app.post('/api/generate-list', async (req, res) => {
    try {
      const { topic, category } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: 'مفتاح GEMINI_API_KEY غير متوفر في الخادم.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `أنت خبير في الثقافة والمجتمع السعودي. قم بتوليد قائمة دقيقة ومترابطة من 100 عنصر حقيقي ومختلف حول الموضوع التالي: "${topic}" ضمن التصنيف "${category || 'السعودية والخليج'}".
الشروط:
1. يجب أن تحتوي القائمة على 100 إجابة فريدة ومرتبة تصاعدياً من الأكثر شهرة وانتشاراً في السعودية (الرقم 1 هو الأكثر شهرة والأخير هو الأقل).
2. الإجابات يجب أن تكون سعودية بحتة ومفهومة للجمهور.
3. أجب بصيغة JSON فقط دون أي نصوص إضافية، بالشكل التالي:
{
  "title": "${topic}",
  "category": "${category || 'السعودية والخليج'}",
  "description": "قائمة تفصيلية تضم 100 عنصر حول ${topic}",
  "criteria": "مرتبة حسب الشهرة والانتشار في السعودية",
  "answers": [
    { "id": 1, "rank": 1, "text": "العنصر الأول", "points": 1 }
  ]
}
تأكد من أن يكون عدد العناصر في مصفوفة answers تماماً 100 عنصر مرتبة من 1 إلى 100.`;

      const modelsToTry = ['gemini-4-hydrogen', 'gemini-4-neon', 'gemini-3.1-flash-lite'];
      let responseText = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              systemInstruction: 'أنت مساعد متخصص في توليد قوائم دقيقة من 100 عنصر للثقافة السعودية بصيغة JSON صحيحة.',
            }
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} experienced high demand or error, trying next...`, err.message);
        }
      }

      if (!responseText) {
        throw lastError || new Error('النماذج تعاني من ضغط مرتفع حالياً. يرجى المحاولة بعد لحظات.');
      }

      const listData = JSON.parse(responseText);

      // Enforce rule: Points MUST equal rank (Rank 1 = 1 point, Rank 100 = 100 points)
      if (listData && Array.isArray(listData.answers)) {
        listData.answers = listData.answers.slice(0, 100).map((ans: any, idx: number) => {
          const rank = idx + 1;
          const text = ans.text || `عنصر ${rank}`;
          return {
            id: rank,
            rank: rank,
            text: text,
            points: rank, // Points equal rank!
            synonyms: ans.synonyms || [text, text.replace(/^ال/, ''), `ال${text}`]
          };
        });

        while (listData.answers.length < 100) {
          const rank = listData.answers.length + 1;
          listData.answers.push({
            id: rank,
            rank: rank,
            text: `عنصر ${rank}`,
            points: rank,
            synonyms: []
          });
        }
      }

      res.json(listData);
    } catch (error: any) {
      console.error('Gemini Generation Error:', error);
      res.status(500).json({ error: error.message || 'فشل في توليد القائمة بسبب الضغط المؤقت. يرجى المحاولة مرة أخرى.' });
    }
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
