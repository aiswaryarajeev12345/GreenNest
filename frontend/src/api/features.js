import api from "./axios";

export const getImage = (url) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `http://127.0.0.1:8000${url}`;
};


// GET request
export async function get(path, config = {}) {
  return api.get(path, config);
}


// POST request
export async function upload(path, payload, config = {}) {
  return api.post(path, payload, {
    ...config,
    headers: {
      ...(config.headers || {}),
      "Content-Type": "multipart/form-data",
    },
  });
}


// PUT request
export async function update(path, payload, config = {}) {
  return api.put(path, payload, {
    ...config,
    headers: {
      ...(config.headers || {}),
      "Content-Type": "multipart/form-data",
    },
  });
}


// PATCH request
export async function patch(path, payload, config = {}) {
  return api.patch(path, payload, {
    ...config,
    headers: {
      ...(config.headers || {}),
      "Content-Type": "multipart/form-data",
    },
  });
}


// DELETE request
export async function remove(path, config = {}) {
  return api.delete(path, config);
}
