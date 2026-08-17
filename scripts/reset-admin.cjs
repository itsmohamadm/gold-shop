const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

function findDatabase() {
  const candidates = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return file;
    }
  }

  throw new Error(
    'فایل dev.db پیدا نشد'
  );
}

function ask(question) {
  const rl =
    readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

  return new Promise((resolve) => {
    rl.question(
      question,
      (answer) => {
        rl.close();
        resolve(answer);
      }
    );
  });
}

async function main() {
  const password = await ask(
    'رمز جدید ادمین را وارد کنید: '
  );

  if (!password || password.length < 8) {
    throw new Error(
      'رمز باید حداقل ۸ کاراکتر باشد.'
    );
  }

  const dbPath = findDatabase();

  console.log(
    `Database: ${dbPath}`
  );

  const db = new Database(dbPath);

  const admin =
    db.prepare(
      `
      SELECT "id", "username"
      FROM "Admin"
      WHERE "username" = ?
      LIMIT 1
      `
    ).get('admin');

  if (!admin) {
    db.close();

    throw new Error(
      'کاربر admin در دیتابیس پیدا نشد.'
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  const result =
    db.prepare(
      `
      UPDATE "Admin"
      SET "passwordHash" = ?
      WHERE "username" = ?
      `
    ).run(
      passwordHash,
      'admin'
    );

  db.close();

  if (result.changes !== 1) {
    throw new Error(
      'رمز ادمین تغییر نکرد.'
    );
  }

  console.log(
    'رمز ادمین با موفقیت تغییر کرد.'
  );

  console.log(
    'نام کاربری: admin'
  );
}

main().catch((error) => {
  console.error(
    '\nERROR:',
    error.message
  );

  process.exit(1);
});