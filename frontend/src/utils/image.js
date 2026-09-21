const BACKEND_URL = "http://127.0.0.1:8000";

export function getImage(url) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${BACKEND_URL}${url}`;
}
