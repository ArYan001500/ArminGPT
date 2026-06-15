import { ChatMessage, ConnectionSettings, ResponseMode } from '../types';

type ChatAnswer = {
  mode: ResponseMode;
  text: string;
};

const offlineAnswers: Array<{ patterns: RegExp[]; answers: string[] }> = [
  {
    patterns: [/^سلام/i, /^salam/i, /درود/i, /صبح بخیر/i, /شب بخیر/i],
    answers: [
      'سلام! خیلی خوشحالم که اینجایی. امروز چه کاری می‌تونم برات انجام بدم؟',
      'سلام و درود! آماده‌ام با هم گپ بزنیم یا به سؤالت جواب بدم.',
    ],
  },
  {
    patterns: [/خوبی/i, /چطوری/i, /حالت چطوره/i],
    answers: ['مرسی که پرسیدی، من عالی‌ام و آماده کمک کردن! تو چطوری؟'],
  },
  {
    patterns: [/خودت را معرفی/i, /کی هستی/i, /اسمت چیه/i],
    answers: [
      'من آرمین جی‌پی‌تی، دستیار هوشمند خانواده هستم؛ کاری از شرکت مهندسین فرزانگان آرمین پژوه.',
    ],
  },
  {
    patterns: [/لطیفه/i, /جوک/i],
    answers: ['چرا کامپیوتر رفت دکتر؟ چون یک ویروس گرفته بود!'],
  },
  {
    patterns: [/انگیزشی/i, /انگیزه/i],
    answers: ['قدم‌های کوچک اما پیوسته، مسیرهای بزرگ را می‌سازند.'],
  },
  {
    patterns: [/خداحافظ/i, /فعلا/i, /bye/i],
    answers: ['خداحافظ! هر وقت خواستی من اینجا هستم.'],
  },
];

function getOfflineAnswer(text: string): string | undefined {
  const match = offlineAnswers.find((item) => item.patterns.some((pattern) => pattern.test(text)));
  if (!match) return undefined;
  return match.answers[Math.floor(Math.random() * match.answers.length)];
}

export async function askArminGPT(
  messages: ChatMessage[],
  connection: ConnectionSettings,
): Promise<ChatAnswer> {
  const lastMessage = messages.at(-1)?.text ?? '';
  const offlineAnswer = getOfflineAnswer(lastMessage);

  if (offlineAnswer) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return { mode: 'offline', text: offlineAnswer };
  }

  if (!connection.apiUrl || !connection.familyKey) {
    return {
      mode: 'error',
      text: 'برای پاسخ هوشمند آنلاین، ابتدا از دکمه تنظیمات بالای صفحه آدرس سرور و رمز خانواده را وارد کن.',
    };
  }

  try {
    const response = await fetch(`${connection.apiUrl}/chat`, {
      body: JSON.stringify({
        messages: messages.slice(-12).map(({ role, text }) => ({ content: text, role })),
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Family-Key': connection.familyKey,
      },
      method: 'POST',
    });

    if (!response.ok) throw new Error(`Server returned ${response.status}`);

    const data = (await response.json()) as { text?: string };
    if (!data.text) throw new Error('Empty response');

    return { mode: 'online', text: data.text };
  } catch {
    return {
      mode: 'error',
      text: 'الان به هوش مصنوعی آنلاین دسترسی ندارم. اینترنت و تنظیمات سرور را بررسی کن؛ سلام و احوال‌پرسی همچنان آفلاین کار می‌کند.',
    };
  }
}
