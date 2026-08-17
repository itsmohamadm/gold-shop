# Gold Shop MVP

فروشگاه اولیه طلا با Next.js و موتور قیمت‌گذاری پویا.

## اجرا

```powershell
npm install
npm run dev
```

سپس: http://localhost:3000

## اتصال BRS API

به دلیل اینکه endpoint و قالب دقیق پاسخ BRS از پنل/مستندات عمومی قابل تأیید نبود، endpoint را عمداً حدس نمی‌زنیم.

فایل `.env.local` را از روی `.env.example` بسازید و مقادیر واقعی پنل BRS را وارد کنید:

- `BRS_API_KEY`
- `BRS_GOLD_ENDPOINT`
- `BRS_PRICE_FIELD`
- `BRS_UPDATED_FIELD`
- در صورت نیاز: `BRS_API_KEY_HEADER`، `BRS_AUTH_SCHEME` یا `BRS_API_KEY_PARAM`

نمونه:

```env
BRS_API_KEY=YOUR_NEW_KEY
BRS_GOLD_ENDPOINT=https://example.com/api/gold
BRS_PRICE_FIELD=data.gold18k
BRS_UPDATED_FIELD=data.updated_at
```

پس از تغییر `.env.local` سرور dev را یک بار متوقف و دوباره اجرا کنید.

## امنیت

API key را commit نکنید و در Frontend قرار ندهید. `.env.local` را در Git نگه ندارید.
