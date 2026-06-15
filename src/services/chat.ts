import { ChatMessage, ConnectionSettings, ResponseMode } from '../types';

type ChatAnswer = {
  mode: ResponseMode;
  text: string;
};

const offlineAnswers: Array<{ patterns: RegExp[]; answers: string[] }> = [
  {
    patterns: [/^\s*(سلام|سلام علیکم|salam|درود|صبح بخیر|شب بخیر)[!؟?.,،\s]*$/i],
    answers: [
      'سلام! خیلی خوشحالم که اینجایی. امروز چه کاری می‌تونم برات انجام بدم؟',
      'سلام و درود! آماده‌ام با هم گپ بزنیم یا به سؤالت جواب بدم.',
      'سلام! من اینجام؛ بگو امروز دوست داری درباره چی صحبت کنیم؟',
      'درود به تو! هر سؤالی داری بپرس تا با هم بررسیش کنیم.',
      'سلام رفیق! آماده‌ام کمکت کنم یا یک گفت‌وگوی خوب داشته باشیم.',
      'سلام! چه خبر؟ بگو از کجا شروع کنیم.',
      'سلام و وقت بخیر! امروز چطور می‌تونم مفید باشم؟',
      'سلام! آرمین جی‌پی‌تی آماده‌ست؛ موضوع امروز چیه؟',
      'درود! خوش اومدی. سؤال، ایده یا کاری داری که با هم انجام بدیم؟',
      'سلام! با انرژی کامل اینجام؛ بگو چه کمکی ازم برمیاد.',
    ],
  },
  {
    patterns: [/^\s*(خوبی|چطوری|حالت چطوره)[!؟?.,،\s]*$/i],
    answers: [
      'مرسی که پرسیدی، من عالی‌ام و آماده کمک کردن! تو چطوری؟',
      'خوبم و آماده‌ام! حال تو چطوره؟',
      'عالی‌ام، مخصوصاً وقتی می‌تونم کمکت کنم. تو خوبی؟',
      'من همیشه آماده‌ام؛ ممنون که پرسیدی. امروز حالت چطوره؟',
      'خوب و پرانرژی‌ام! تو چه خبر؟',
      'همه‌چیز خوبه؛ بگو امروز چه کاری با هم انجام بدیم؟',
    ],
  },
  {
    patterns: [/^\s*(خداحافظ|فعلا|bye)[!؟?.,،\s]*$/i],
    answers: [
      'خداحافظ! هر وقت خواستی من اینجا هستم.',
      'فعلاً! امیدوارم دوباره زود ببینمت.',
      'خداحافظ و موفق باشی! هر زمان سؤال داشتی برگرد.',
      'به امید دیدار! مراقب خودت باش.',
      'فعلاً دوست من؛ گفت‌وگوی خوبی بود.',
      'خداحافظ! روز خوبی داشته باشی.',
    ],
  },
];

let previousOfflineAnswer = '';

function getOfflineAnswer(text: string): string | undefined {
  const match = offlineAnswers.find((item) => item.patterns.some((pattern) => pattern.test(text)));
  if (!match) return undefined;

  const available = match.answers.filter((answer) => answer !== previousOfflineAnswer);
  const answers = available.length ? available : match.answers;
  const answer = answers[Math.floor(Math.random() * answers.length)];
  previousOfflineAnswer = answer;
  return answer;
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
      text: 'برای پاسخ هوشمند آنلاین، ابتدا از دکمه امن بالای صفحه رمز خانواده را وارد کن.',
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
