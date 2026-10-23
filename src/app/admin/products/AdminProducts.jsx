"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  price: "",
  status: "",
  rating: "0",
  tags: "",
  is_active: true,
};

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function publicImageUrl(path) {
  if (!path) return null;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

export default function AdminProducts({ initialProducts, initialError }) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [feedback, setFeedback] = useState(
    initialError ? { type: "error", message: initialError } : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState(null);

  function resetForm() {
    setForm(emptyForm);
    setEditingSlug(null);
    setImageFile(null);
    setFeedback(null);
  }

  function editProduct(product) {
    setEditingSlug(product.slug);
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      status: product.status ?? "",
      rating: String(product.rating ?? 0),
      tags: (product.tags ?? []).join(", "),
      is_active: product.is_active,
    });
    setImageFile(null);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    const slug = editingSlug ?? slugify(form.slug || form.title);
    const price = Number(form.price);
    const rating = Number(form.rating);

    if (!slug) {
      setFeedback({ type: "error", message: "Enter a product name to create its URL slug." });
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setFeedback({ type: "error", message: "Enter a valid product price." });
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setFeedback({ type: "error", message: "Rating must be between 0 and 5." });
      return;
    }

    if (
      imageFile &&
      (!imageExtensions[imageFile.type] || imageFile.size > 5 * 1024 * 1024)
    ) {
      setFeedback({
        type: "error",
        message: "Choose a JPG, PNG, WebP, or AVIF image smaller than 5 MB.",
      });
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    let uploadedImagePath = null;

    try {
      const existingProduct = products.find((product) => product.slug === editingSlug);
      let imagePath = existingProduct?.image_path ?? null;

      if (imageFile) {
        uploadedImagePath = `${slug}/${crypto.randomUUID()}.${imageExtensions[imageFile.type]}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(uploadedImagePath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;
        imagePath = uploadedImagePath;
      }

      const productRecord = {
        slug,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        status: form.status.trim() || null,
        rating,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        image_path: imagePath,
        is_active: form.is_active,
      };

      const { data, error } = await supabase
        .from("products")
        .upsert(productRecord, { onConflict: "slug" })
        .select()
        .single();

      if (error) {
        if (uploadedImagePath) {
          const { error: cleanupError } = await supabase.storage
            .from("product-images")
            .remove([uploadedImagePath]);
          if (cleanupError) {
            console.error("Could not remove an unreferenced product image.", cleanupError);
          }
        }
        throw error;
      }

      setProducts((current) => [
        data,
        ...current.filter((product) => product.slug !== data.slug),
      ]);

      if (uploadedImagePath && existingProduct?.image_path) {
        const { error: removeError } = await supabase.storage
          .from("product-images")
          .remove([existingProduct.image_path]);

        if (removeError) {
          setFeedback({
            type: "error",
            message: `Product saved, but the old image could not be removed: ${removeError.message}`,
          });
        } else {
          setFeedback({
            type: "success",
            message: editingSlug ? "Product updated." : "Product added to your catalog.",
          });
        }
      } else {
        setFeedback({
          type: "success",
          message: editingSlug ? "Product updated." : "Product added to your catalog.",
        });
      }

      setForm(emptyForm);
      setEditingSlug(null);
      setImageFile(null);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save the product.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.title}" from your catalog?`)) return;

    setDeletingSlug(product.slug);
    setFeedback(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("slug", product.slug);

    if (error) {
      setFeedback({ type: "error", message: error.message });
      setDeletingSlug(null);
      return;
    }

    setProducts((current) => current.filter((item) => item.slug !== product.slug));

    if (product.image_path) {
      const { error: removeError } = await supabase.storage
        .from("product-images")
        .remove([product.image_path]);

      if (removeError) {
        setFeedback({
          type: "error",
          message: `Product deleted, but its image could not be removed: ${removeError.message}`,
        });
      } else {
        setFeedback({ type: "success", message: "Product deleted." });
      }
    } else {
      setFeedback({ type: "success", message: "Product deleted." });
    }

    if (editingSlug === product.slug) resetForm();
    setDeletingSlug(null);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Store management
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Products</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add products and images to Supabase. Active products appear in your shop.
        </p>
      </header>

      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-950">
          {editingSlug ? "Edit product" : "Add a product"}
        </h2>

        <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Product name
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              onChange={(event) => {
                const title = event.target.value;
                setForm((current) => ({
                  ...current,
                  title,
                  slug: editingSlug ? current.slug : slugify(title),
                }));
              }}
              required
              value={form.title}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            URL slug
            <input
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-cyan-600 disabled:text-slate-500"
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
              }
              required
              disabled={Boolean(editingSlug)}
              value={form.slug}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Price (INR)
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              required
              step="0.01"
              type="number"
              value={form.price}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Badge (optional)
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              placeholder="e.g. New, 10% off"
              value={form.status}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Rating (0–5)
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              max="5"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
              step="0.1"
              type="number"
              value={form.rating}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Description
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
              value={form.description}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Tags (comma-separated)
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600"
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Birthday, Personalised, Home"
              value={form.tags}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Product image (JPG, PNG, WebP, or AVIF; max 5 MB)
            <input
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              required={!editingSlug && !products.some((product) => product.slug === form.slug && product.image_path)}
              type="file"
            />
            {editingSlug && !imageFile ? (
              <span className="block text-xs font-normal text-slate-500">
                Leave empty to keep the current image.
              </span>
            ) : null}
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 sm:col-span-2">
            <input
              checked={form.is_active}
              className="h-4 w-4 accent-cyan-700"
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              type="checkbox"
            />
            Visible in the shop
          </label>

          {feedback ? (
            <p
              className={`rounded-xl px-4 py-3 text-sm sm:col-span-2 ${
                feedback.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
              }`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : editingSlug ? "Save changes" : "Add product"}
            </button>
            {editingSlug ? (
              <button
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
                onClick={resetForm}
                type="button"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">
          Catalog ({products.length})
        </h2>
        {products.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <article
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                key={product.slug}
              >
                {publicImageUrl(product.image_path) ? (
                  <Image
                    alt={product.title}
                    className="h-24 w-24 rounded-xl object-cover"
                    height={96}
                    src={publicImageUrl(product.image_path)}
                    unoptimized
                    width={96}
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{product.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Rs. {new Intl.NumberFormat("en-IN").format(product.price)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {product.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                      onClick={() => editProduct(product)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                      disabled={deletingSlug === product.slug}
                      onClick={() => deleteProduct(product)}
                      type="button"
                    >
                      {deletingSlug === product.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            No products yet. Add your first product above.
          </div>
        )}
      </section>
    </div>
  );
}
