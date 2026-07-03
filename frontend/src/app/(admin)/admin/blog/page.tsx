'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/admin/image-uploader';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { api } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

const EMPTY = { title: '', excerpt: '', content: '', coverImage: '', tags: '', published: true };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api<{ items: BlogPost[] }>('/blog?all=true&limit=30')
      .then((data) => setPosts(data.items))
      .catch(() => undefined);
  }, []);
  useEffect(load, [load]);

  function openForm(post?: BlogPost) {
    setEditing(post || null);
    setForm(
      post
        ? {
            title: post.title,
            excerpt: post.excerpt || '',
            content: post.content || '',
            coverImage: post.coverImage || '',
            tags: (post.tags || []).join(', '),
            published: post.published,
          }
        : EMPTY,
    );
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage || undefined,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published,
      };
      if (editing) {
        await api(`/blog/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Post updated');
      } else {
        await api('/blog', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Post created');
      }
      setShowForm(false);
      load();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    await api(`/blog/${post.id}`, { method: 'DELETE' }).catch(() => undefined);
    toast.success('Post deleted');
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Blog Posts</h1>
        <button onClick={() => openForm()} className="btn-primary">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      <div className="card-klass divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{post.title}</p>
              <p className="text-xs text-[#999999]">
                {formatDate(post.createdAt)} · {(post.tags || []).join(', ') || 'No tags'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-bold',
                  post.published
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                )}
              >
                {post.published ? 'Published' : 'Draft'}
              </span>
              <button onClick={() => openForm(post)} className="p-2 text-[#999999] hover:text-brand">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(post)} className="p-2 text-[#999999] hover:text-brand">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="card-klass my-8 w-full max-w-2xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Post title"
              className="input-klass"
            />
            <input
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Excerpt (shown on cards)"
              className="input-klass"
            />
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Write your article…"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="Tags, comma separated"
              className="input-klass"
            />
            <div>
              <p className="mb-2 text-xs font-semibold text-[#555555] dark:text-[#999999]">Featured image</p>
              <ImageUploader
                images={form.coverImage ? [form.coverImage] : []}
                onChange={(urls) => setForm((f) => ({ ...f, coverImage: urls[urls.length - 1] || '' }))}
                max={1}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="accent-brand"
              />
              Published
            </label>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
