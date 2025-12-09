
export const getSmallImageUrl = (url: string): string => {
  if (!url) return url;
  if (url.includes("/normal/")) return url.replace("/normal/", "/small/");
  if (url.includes("/large/")) return url.replace("/large/", "/small/");
  return url;
};
