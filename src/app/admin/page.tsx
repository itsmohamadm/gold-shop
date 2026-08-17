'use client';

import { useEffect, useState } from 'react';

import LogoutButton from '@/components/admin/LogoutButton';

type Product = {
  id: number;
  name: string;
  category: string;
  weight: number;
  karat: number;
  laborPercent: number;
  profitPercent: number;
  taxPercent: number;
  manualPrice?: number | null;
  stock?: number;
  active: boolean;
  image?: string | null;
};

type Category = {
  id: number;
  value: string;
  label: string;
  active: boolean;
};

const emptyProduct: Product = {
  id: 0,
  name: '',
  category: 'other',
  weight: 1,
  karat: 18,
  laborPercent: 20,
  profitPercent: 7,
  taxPercent: 10,
  manualPrice: null,
  stock: 0,
  active: true,
  image: null,
};

export default function AdminPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  const [editing, setEditing] =
    useState<Product | null>(null);

  const [creating, setCreating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const res = await fetch(
        '/api/products',
        {
          cache: 'no-store',
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در دریافت محصولات'
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      alert(
        'خطا در دریافت محصولات'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      setCategoriesLoading(true);

      const res = await fetch(
        '/api/categories',
        {
          cache: 'no-store',
        }
      );

      const data =
        await res.json();

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
      setCategoriesLoading(false);
    }
  }

  function startCreate() {
    setCreating(true);

    const firstActiveCategory =
      categories.find(
        (category) =>
          category.active
      );

    setEditing({
      ...emptyProduct,
      category:
        firstActiveCategory?.value ||
        'other',
    });
  }

  function startEdit(
    product: Product
  ) {
    setCreating(false);

    setEditing({
      ...product,
      category:
        product.category ||
        'other',
    });
  }

  function closeModal() {
    if (saving) return;

    setEditing(null);
    setCreating(false);
  }

  function updateEditing(
    field: keyof Product,
    value: string
  ) {
    if (!editing) return;

    if (
      field === 'name' ||
      field === 'category' ||
      field === 'image'
    ) {
      setEditing({
        ...editing,
        [field]: value,
      });

      return;
    }

    setEditing({
      ...editing,
      [field]:
        value === ''
          ? 0
          : Number(value),
    } as Product);
  }

  async function saveProduct() {
    if (!editing) return;

    if (!editing.name.trim()) {
      alert(
        'نام محصول را وارد کنید'
      );
      return;
    }

    if (
      !Number.isFinite(
        editing.weight
      ) ||
      editing.weight <= 0
    ) {
      alert(
        'وزن محصول نامعتبر است'
      );
      return;
    }

    if (!editing.category) {
      alert(
        'دسته‌بندی محصول را انتخاب کنید'
      );
      return;
    }

    try {
      setSaving(true);

      const url = creating
        ? '/api/products'
        : `/api/products/${editing.id}`;

      const method = creating
        ? 'POST'
        : 'PUT';

      const res = await fetch(
        url,
        {
          method,
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: editing.name,
            category:
              editing.category,
            weight: editing.weight,
            karat: editing.karat,
            laborPercent:
              editing.laborPercent,
            profitPercent:
              editing.profitPercent,
            taxPercent:
              editing.taxPercent,
            manualPrice:
              editing.manualPrice,
            stock:
              editing.stock ?? 0,
            active:
              editing.active,
            image:
              editing.image ??
              null,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            (creating
              ? 'خطا در افزودن محصول'
              : 'خطا در ویرایش محصول')
        );
      }

      if (creating) {
        setProducts(
          (current) => [
            ...current,
            data,
          ]
        );

        alert(
          'محصول با موفقیت اضافه شد'
        );
      } else {
        setProducts(
          (current) =>
            current.map(
              (product) =>
                product.id ===
                data.id
                  ? data
                  : product
            )
        );

        alert(
          'محصول با موفقیت ویرایش شد'
        );
      }

      closeModal();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          'خطا در ذخیره محصول'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(
    id: number
  ) {
    const ok = confirm(
      'آیا از حذف این محصول مطمئن هستید؟'
    );

    if (!ok) return;

    try {
      const res = await fetch(
        `/api/products/${id}`,
        {
          method: 'DELETE',
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در حذف محصول'
        );
      }

      setProducts(
        (current) =>
          current.filter(
            (product) =>
              product.id !== id
          )
      );

      alert(
        'محصول با موفقیت حذف شد'
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          'خطا در حذف محصول'
      );
    }
  }

  async function toggleActive(
    product: Product
  ) {
    try {
      const res = await fetch(
        `/api/products/${product.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: product.name,
            category:
              product.category ||
              'other',
            weight: product.weight,
            karat: product.karat,
            laborPercent:
              product.laborPercent,
            profitPercent:
              product.profitPercent,
            taxPercent:
              product.taxPercent,
            manualPrice:
              product.manualPrice,
            stock:
              product.stock ?? 0,
            active:
              !product.active,
            image:
              product.image ??
              null,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            'خطا در تغییر وضعیت محصول'
        );
      }

      setProducts(
        (current) =>
          current.map(
            (item) =>
              item.id === data.id
                ? data
                : item
          )
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ||
          'خطا در تغییر وضعیت محصول'
      );
    }
  }

  function getCategoryLabel(
    value: string
  ) {
    return (
      categories.find(
        (category) =>
          category.value ===
          value
      )?.label ||
      'سایر'
    );
  }

  const selectableCategories =
    categories.filter(
      (category) =>
        category.active ||
        category.value ===
          editing?.category
    );

  return (
    <main className="container section">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            ADMIN PANEL
          </span>

          <h1>
            مدیریت محصولات
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            className="button"
            onClick={startCreate}
            disabled={
              categoriesLoading
            }
          >
            + افزودن محصول
          </button>

          <LogoutButton />
        </div>
      </div>

      {loading ? (
        <p>
          در حال دریافت محصولات...
        </p>
      ) : products.length === 0 ? (
        <div>
          <p>
            هیچ محصولی وجود ندارد.
          </p>

          <button
            type="button"
            className="button"
            onClick={startCreate}
            disabled={
              categoriesLoading
            }
          >
            افزودن اولین محصول
          </button>
        </div>
      ) : (
        <div className="products">
          {products.map(
            (product) => (
              <article
                className="product"
                key={product.id}
              >
                <div className="productImage">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit:
                          'cover',
                        borderRadius:
                          '12px',
                      }}
                    />
                  ) : (
                    <span>
                      {product.karat}K
                    </span>
                  )}
                </div>

                <h3>
                  {product.name}
                </h3>

                <p>
                  دسته‌بندی:{' '}
                  {getCategoryLabel(
                    product.category
                  )}
                </p>

                <p>
                  وزن:{' '}
                  {product.weight}{' '}
                  گرم
                </p>

                <p>
                  عیار:{' '}
                  {product.karat}
                </p>

                <p>
                  اجرت:{' '}
                  {
                    product.laborPercent
                  }٪
                </p>

                <p>
                  سود:{' '}
                  {
                    product.profitPercent
                  }٪
                </p>

                <p>
                  مالیات:{' '}
                  {
                    product.taxPercent
                  }٪
                </p>

                <p>
                  موجودی:{' '}
                  {product.stock ??
                    0}
                </p>

                <p>
                  وضعیت:{' '}
                  {product.active
                    ? 'فعال'
                    : 'غیرفعال'}
                </p>

                <div
                  style={{
                    display:
                      'flex',
                    gap: '8px',
                    marginTop:
                      '12px',
                    flexWrap:
                      'wrap',
                  }}
                >
                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      startEdit(
                        product
                      )
                    }
                  >
                    ویرایش
                  </button>

                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      toggleActive(
                        product
                      )
                    }
                  >
                    {product.active
                      ? 'غیرفعال'
                      : 'فعال'}
                  </button>

                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      deleteProduct(
                        product.id
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
            alignItems:
              'center',
            justifyContent:
              'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              color: '#111',
              width: '100%',
              maxWidth: '600px',
              borderRadius:
                '16px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY:
                'auto',
            }}
          >
            <h2>
              {creating
                ? 'افزودن محصول جدید'
                : 'ویرایش محصول'}
            </h2>

            <div
              style={{
                display:
                  'grid',
                gap: '12px',
                marginTop:
                  '20px',
              }}
            >
              <label>
                نام محصول

                <input
                  value={
                    editing.name
                  }
                  onChange={(e) =>
                    updateEditing(
                      'name',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                دسته‌بندی

                <select
                  value={
                    editing.category ||
                    ''
                  }
                  onChange={(e) =>
                    updateEditing(
                      'category',
                      e.target.value
                    )
                  }
                  disabled={
                    categoriesLoading
                  }
                >
                  <option value="">
                    انتخاب دسته‌بندی
                  </option>

                  {selectableCategories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.value
                        }
                      >
                        {category.label}
                        {!category.active
                          ? ' (غیرفعال)'
                          : ''}
                      </option>
                    )
                  )}
                </select>

                {!categoriesLoading &&
                  selectableCategories.length ===
                    0 && (
                    <small>
                      هیچ دسته‌بندی فعالی
                      وجود ندارد.
                    </small>
                  )}
              </label>

              <label>
                وزن

                <input
                  type="number"
                  step="0.01"
                  value={
                    editing.weight
                  }
                  onChange={(e) =>
                    updateEditing(
                      'weight',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                عیار

                <input
                  type="number"
                  value={
                    editing.karat
                  }
                  onChange={(e) =>
                    updateEditing(
                      'karat',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                اجرت درصدی

                <input
                  type="number"
                  step="0.01"
                  value={
                    editing.laborPercent
                  }
                  onChange={(e) =>
                    updateEditing(
                      'laborPercent',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                سود درصدی

                <input
                  type="number"
                  step="0.01"
                  value={
                    editing.profitPercent
                  }
                  onChange={(e) =>
                    updateEditing(
                      'profitPercent',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                مالیات درصدی

                <input
                  type="number"
                  step="0.01"
                  value={
                    editing.taxPercent
                  }
                  onChange={(e) =>
                    updateEditing(
                      'taxPercent',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                قیمت دستی

                <input
                  type="number"
                  value={
                    editing.manualPrice ??
                    ''
                  }
                  onChange={(e) =>
                    updateEditing(
                      'manualPrice',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                موجودی

                <input
                  type="number"
                  min="0"
                  value={
                    editing.stock ?? 0
                  }
                  onChange={(e) =>
                    updateEditing(
                      'stock',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                آدرس تصویر

                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={
                    editing.image ??
                    ''
                  }
                  onChange={(e) =>
                    updateEditing(
                      'image',
                      e.target.value
                    )
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
                  ? 'غیرفعال کردن محصول'
                  : 'فعال کردن محصول'}
              </button>
            </div>

            <div
              style={{
                display:
                  'flex',
                gap: '10px',
                marginTop:
                  '24px',
                flexWrap:
                  'wrap',
              }}
            >
              <button
                type="button"
                className="button"
                onClick={
                  saveProduct
                }
                disabled={
                  saving ||
                  categoriesLoading ||
                  !editing.category
                }
              >
                {saving
                  ? 'در حال ذخیره...'
                  : creating
                    ? 'افزودن محصول'
                    : 'ذخیره تغییرات'}
              </button>

              <button
                type="button"
                className="button"
                onClick={
                  closeModal
                }
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