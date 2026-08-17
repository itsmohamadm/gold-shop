const path = require('path');
const fs = require('fs');

const dotenv = require('dotenv');
const Database = require('better-sqlite3');

const {
  PrismaClient,
} = require('@prisma/client');

const {
  PrismaPg,
} = require('@prisma/adapter-pg');

dotenv.config({
  path: path.join(
    process.cwd(),
    '.env.local'
  ),
  quiet: true,
});

const connectionString =
  process.env.DATABASE_URL;

if (
  !connectionString ||
  !connectionString.startsWith(
    'postgresql://'
  )
) {
  throw new Error(
    'DATABASE_URL باید یک PostgreSQL connection string معتبر باشد.'
  );
}

const adapter =
  new PrismaPg({
    connectionString,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

const sqlitePath =
  path.join(
    process.cwd(),
    'dev.db'
  );

async function main() {
  if (
    !fs.existsSync(sqlitePath)
  ) {
    throw new Error(
      `فایل SQLite پیدا نشد:\n${sqlitePath}`
    );
  }

  console.log(
    '🔹 اتصال به SQLite...'
  );

  const sqlite =
    new Database(
      sqlitePath,
      {
        readonly: true,
      }
    );

  console.log(
    '🔹 بررسی PostgreSQL...'
  );

  const existingCounts = {
    products:
      await prisma.product.count(),

    categories:
      await prisma.category.count(),

    admins:
      await prisma.admin.count(),

    customers:
      await prisma.customer.count(),

    orders:
      await prisma.order.count(),

    orderItems:
      await prisma.orderItem.count(),

    wishlists:
      await prisma.wishlist.count(),
  };

  const hasExistingData =
    Object.values(
      existingCounts
    ).some(
      (count) => count > 0
    );

  if (hasExistingData) {
    sqlite.close();

    console.table(
      existingCounts
    );

    throw new Error(
      'دیتابیس PostgreSQL خالی نیست؛ انتقال برای جلوگیری از Duplicate متوقف شد.'
    );
  }

  function readTable(
    tableName
  ) {
    return sqlite
      .prepare(
        `SELECT * FROM "${tableName}"`
      )
      .all();
  }

  const products =
    readTable('Product');

  const categories =
    readTable('Category');

  const admins =
    readTable('Admin');

  const customers =
    readTable('Customer');

  const orders =
    readTable('Order');

  const orderItems =
    readTable('OrderItem');

  const wishlists =
    readTable('Wishlist');

  console.log(
    '\n📦 اطلاعات SQLite:'
  );

  console.table({
    Product: products.length,
    Category:
      categories.length,
    Admin: admins.length,
    Customer:
      customers.length,
    Order: orders.length,
    OrderItem:
      orderItems.length,
    Wishlist:
      wishlists.length,
  });

  console.log(
    '\n🚀 شروع انتقال...'
  );

  await prisma.$transaction(
    async (tx) => {
      if (products.length) {
        await tx.product.createMany({
          data: products.map(
            (row) => ({
              id: Number(
                row.id
              ),
              name: String(
                row.name
              ),
              category:
                String(
                  row.category
                ),
              weight: Number(
                row.weight
              ),
              karat: Number(
                row.karat
              ),
              laborPercent:
                Number(
                  row.laborPercent
                ),
              profitPercent:
                Number(
                  row.profitPercent
                ),
              taxPercent:
                Number(
                  row.taxPercent
                ),
              manualPrice:
                row.manualPrice ===
                null
                  ? null
                  : Number(
                      row.manualPrice
                    ),
              stock: Number(
                row.stock
              ),
              active:
                Boolean(
                  row.active
                ),
              image:
                row.image == null
                  ? null
                  : String(
                      row.image
                    ),
              createdAt:
                new Date(
                  row.createdAt
                ),
              updatedAt:
                new Date(
                  row.updatedAt
                ),
            })
          ),
        });

        console.log(
          `✅ Product: ${products.length}`
        );
      }

      if (categories.length) {
        await tx.category.createMany({
          data: categories.map(
            (row) => ({
              id: Number(
                row.id
              ),
              value: String(
                row.value
              ),
              label: String(
                row.label
              ),
              active:
                Boolean(
                  row.active
                ),
              createdAt:
                new Date(
                  row.createdAt
                ),
              updatedAt:
                new Date(
                  row.updatedAt
                ),
            })
          ),
        });

        console.log(
          `✅ Category: ${categories.length}`
        );
      }

      if (admins.length) {
        await tx.admin.createMany({
          data: admins.map(
            (row) => ({
              id: Number(
                row.id
              ),
              username: String(
                row.username
              ),
              passwordHash:
                String(
                  row.passwordHash
                ),
              createdAt:
                new Date(
                  row.createdAt
                ),
              updatedAt:
                new Date(
                  row.updatedAt
                ),
            })
          ),
        });

        console.log(
          `✅ Admin: ${admins.length}`
        );
      }

      if (customers.length) {
        await tx.customer.createMany({
          data: customers.map(
            (row) => ({
              id: Number(
                row.id
              ),
              name: String(
                row.name
              ),
              phone: String(
                row.phone
              ),
              passwordHash:
                String(
                  row.passwordHash
                ),
              address:
                row.address == null
                  ? null
                  : String(
                      row.address
                    ),
              createdAt:
                new Date(
                  row.createdAt
                ),
              updatedAt:
                new Date(
                  row.updatedAt
                ),
            })
          ),
        });

        console.log(
          `✅ Customer: ${customers.length}`
        );
      }

      if (orders.length) {
        await tx.order.createMany({
          data: orders.map(
            (row) => ({
              id: Number(
                row.id
              ),
              orderNumber:
                String(
                  row.orderNumber
                ),
              customerName:
                String(
                  row.customerName
                ),
              phone: String(
                row.phone
              ),
              address: String(
                row.address
              ),
              notes:
                row.notes == null
                  ? null
                  : String(
                      row.notes
                    ),
              total: Number(
                row.total
              ),
              status: String(
                row.status
              ),
              paymentStatus:
                String(
                  row.paymentStatus
                ),
              paymentRef:
                row.paymentRef ==
                null
                  ? null
                  : String(
                      row.paymentRef
                    ),
              paidAt:
                row.paidAt == null
                  ? null
                  : new Date(
                      row.paidAt
                    ),
              customerId:
                row.customerId ==
                null
                  ? null
                  : Number(
                      row.customerId
                    ),
              createdAt:
                new Date(
                  row.createdAt
                ),
              updatedAt:
                new Date(
                  row.updatedAt
                ),
            })
          ),
        });

        console.log(
          `✅ Order: ${orders.length}`
        );
      }

      if (orderItems.length) {
        await tx.orderItem.createMany({
          data: orderItems.map(
            (row) => ({
              id: Number(
                row.id
              ),
              orderId: Number(
                row.orderId
              ),
              productId:
                row.productId ==
                null
                  ? null
                  : Number(
                      row.productId
                    ),
              productName:
                String(
                  row.productName
                ),
              unitPrice:
                Number(
                  row.unitPrice
                ),
              quantity:
                Number(
                  row.quantity
                ),
              weight: Number(
                row.weight
              ),
              karat: Number(
                row.karat
              ),
              subtotal:
                Number(
                  row.subtotal
                ),
            })
          ),
        });

        console.log(
          `✅ OrderItem: ${orderItems.length}`
        );
      }

      if (wishlists.length) {
        await tx.wishlist.createMany({
          data: wishlists.map(
            (row) => ({
              id: Number(
                row.id
              ),
              customerId:
                Number(
                  row.customerId
                ),
              productId:
                Number(
                  row.productId
                ),
              createdAt:
                new Date(
                  row.createdAt
                ),
            })
          ),
        });

        console.log(
          `✅ Wishlist: ${wishlists.length}`
        );
      }
    }
  );

  console.log(
    '\n🔧 تنظیم sequence ها...'
  );

  const sequenceTables = [
    'Product',
    'Order',
    'OrderItem',
    'Admin',
    'Category',
    'Customer',
    'Wishlist',
  ];

  for (
    const table of sequenceTables
  ) {
    await prisma.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE(
          (
            SELECT MAX("id")
            FROM "${table}"
          ),
          1
        ),
        true
      );
    `);
  }

  sqlite.close();

  console.log(
    '\n✅ انتقال با موفقیت کامل شد.'
  );
}

main()
  .catch((error) => {
    console.error(
      '\n❌ MIGRATION ERROR:\n',
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });