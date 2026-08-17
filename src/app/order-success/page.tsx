import Link from 'next/link';

type Props = {
  searchParams: {
    order?: string;
  };
};

export default function OrderSuccessPage({
  searchParams,
}: Props) {
  const orderNumber =
    searchParams?.order;

  return (
    <main className="container section">
      <div
        style={{
          maxWidth: '650px',
          margin: '60px auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            marginBottom: '20px',
          }}
        >
          ✅
        </div>

        <span className="eyebrow">
          ORDER SUCCESS
        </span>

        <h1>
          سفارش با موفقیت ثبت شد
        </h1>

        {orderNumber && (
          <p
            style={{
              marginTop: '20px',
              fontSize: '18px',
            }}
          >
            شماره سفارش:
            <strong
              style={{
                marginRight: '8px',
              }}
            >
              {orderNumber}
            </strong>
          </p>
        )}

        <p>
          سفارش شما با موفقیت ثبت شده و
          در انتظار بررسی فروشگاه است.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '30px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/shop"
            className="button"
          >
            بازگشت به فروشگاه
          </Link>

          <Link
            href="/"
            className="button"
          >
            صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  );
}