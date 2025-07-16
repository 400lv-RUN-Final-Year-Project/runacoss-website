// blogApi.ts

const API_BASE = '/api/blogs';

export async function getBlogs() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch blogs');
  return res.json();
}

export async function deleteBlog(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete blog');
  return res.json();
} 