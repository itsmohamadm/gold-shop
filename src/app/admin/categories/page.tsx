'use client';

import { useEffect, useState } from 'react';

type Category = {
  id: number;
  value: string;
  label: string;
  active: boolean;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState<Category | null>(null);

  const [creating, setCreating] =
    useState(false);

  const emptyCategory: Category = {
    id: 0,
    value: '',
    label: '',
    active: true,
  };

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(
        '/api/categories',
        {
          cache: 'no-store',
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در دریافت دسته‌بندی‌ها'
        );
      }

      setCategories(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      alert(
        'خطا در دریافت دسته‌بندی‌ها'
      );
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setCreating(true);

    setEditing({
      ...emptyCategory,
    });
  }

  function startEdit(
    category: Category
  ) {
    setCreating(false);

    setEditing({
      ...category,
    });
  }

  async function saveCategory() {
    if (!editing) return;

    if (
      !editing.value.trim() ||
      !editing.label.trim()
    ) {
      alert(
        'نام و شناسه دسته‌بندی الزامی است'
      );
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        creating
          ? '/api/categories'
          : `/api/categories/${editing.id}`,
        {
          method: creating
            ? 'POST'
            : 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            value: editing.value,
            label: editing.label,
            active: editing.active,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در ذخیره دسته‌بندی'
        );
      }

      if (creating) {
        setCategories(
          (current) => [
            ...current,
            data,
          ]
        );
      } else {
        setCategories(
          (current) =>
            current.map(
              (category) =>
                category.id ===
                data.id
                  ? data
                  : category
            )
        );
      }

      setEditing(null);
      setCreating(false);

      alert(
        creating
          ? 'دسته‌بندی ایجاد شد'
          : 'دسته‌بندی ویرایش شد'
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          'خطا در ذخیره دسته‌بندی'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    id: number
  ) {
    if (
      !confirm(
        'آیا از حذف این دسته‌بندی مطمئن هستید؟'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/categories/${id}`,
        {
          method: 'DELETE',
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در حذف دسته‌بندی'
        );
      }

      setCategories(
        (current) =>
          current.filter(
            (category) =>
              category.id !== id
          )
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          'خطا در حذف دسته‌بندی'
      );
    }
  }

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            ADMIN CATEGORIES
          </span>

          <h1>
            مدیریت دسته‌بندی‌ها
          </h1>
        </div>

        <button
          className="button"
          type="button"
          onClick={startCreate}
        >
          + افزودن دسته‌بندی
        </button>
      </div>

      {loading ? (
        <p>
          در حال دریافت دسته‌بندی‌ها...
        </p>
      ) : (
        <div className="products">
          {categories.map(
            (category) => (
              <article
                className="product"
                key={category.id}
              >
                <h3>
                  {category.label}
                </h3>

                <p>
                  شناسه:{' '}
                  {category.value}
                </p>

                <p>
                  وضعیت:{' '}
                  {category.active
                    ? 'فعال'
                    : 'غیرفعال'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                  }}
                >
                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      startEdit(
                        category
                      )
                    }
                  >
                    ویرایش
                  </button>

                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      deleteCategory(
                        category.id
                      )
                    }
                  >
                    حذف
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}

      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              color: '#111',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h2>
              {creating
                ? 'افزودن دسته‌بندی'
                : 'ویرایش دسته‌بندی'}
            </h2>

            <div
              style={{
                display: 'grid',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <label>
                شناسه

                <input
                  value={
                    editing.value
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      value:
                        e.target.value
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            '-'
                          ),
                    })
                  }
                  disabled={!creating}
                />
              </label>

              <label>
                نام دسته‌بندی

                <input
                  value={
                    editing.label
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      label:
                        e.target.value,
                    })
                  }
                />
              </label>

              <button
                type="button"
                className="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    active:
                      !editing.active,
                  })
                }
              >
                {editing.active
                  ? 'غیرفعال کردن'
                  : 'فعال کردن'}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              <button
                type="button"
                className="button"
                onClick={saveCategory}
                disabled={saving}
              >
                {saving
                  ? 'در حال ذخیره...'
                  : 'ذخیره'}
              </button>

              <button
                type="button"
                className="button"
                onClick={() => {
                  setEditing(null);
                  setCreating(false);
                }}
                disabled={saving}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}