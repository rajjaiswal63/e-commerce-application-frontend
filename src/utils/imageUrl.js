const backendUrl = (import.meta.env.VITE_BACK_END_URL || "http://localhost:8080")
  .replace(/\/+$/, "");

export const resolveProductImage = (image) => {
  if (!image) return `${backendUrl}/images/products/default.svg`;

  const value = String(image).trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${backendUrl}${value}`;
  if (value.startsWith("images/")) return `${backendUrl}/${value}`;

  // Cart responses contain the stored filename; catalog responses contain an absolute URL.
  return `${backendUrl}/images/products/${value}`;
};
