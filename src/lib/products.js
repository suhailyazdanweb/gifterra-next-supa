export function mapProductRecord(record) {
  return {
    id: record.slug,
    title: record.title,
    subtitle: record.description,
    price: `Rs. ${new Intl.NumberFormat("en-IN").format(record.price)}/-`,
    status: record.status,
    rating: String(record.rating ?? 0),
    itemLabel: "Add to Cart",
    actionLabel: "View Details",
    tags: record.tags ?? [],
    image: record.image_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${record.image_path}`
      : "",
    imagePath: record.image_path,
  };
}
