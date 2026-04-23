"use client";

import { useState } from "react";

export default function UploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const addTag = () => {
    const trimmed = tagsInput.trim();
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }

    setTagsInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      alert("กรุณาใส่ชื่อรูปและเลือกไฟล์");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("tags", JSON.stringify(tags));
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      alert("อัปโหลดสำเร็จ");
      setTitle("");
      setDescription("");
      setTagsInput("");
      setTags([]);
      setFile(null);
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="mb-3 font-bold">Upload Image</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 w-full rounded border px-2 py-1"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-2 w-full rounded border px-2 py-1"
      />

      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="Add tag..."
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full rounded border px-2 py-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />

        <button
          type="button"
          onClick={addTag}
          className="rounded bg-gray-500 px-3 text-white"
        >
          +
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm text-blue-700"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              x
            </button>
          </span>
        ))}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3"
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="w-full rounded bg-green-500 px-4 py-1 text-white disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
