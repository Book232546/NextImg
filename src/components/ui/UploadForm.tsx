"use client";

import { useState } from "react";

export default function UploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addTag = () => {
    const trimmed = tagsInput.trim();
    if (!trimmed) return;

    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }

    setTagsInput("");
    setError("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter an image title.");
      return;
    }

    if (tags.length === 0) {
      setError("Please add at least 1 tag before uploading.");
      return;
    }

    if (!file) {
      setError("Please choose an image file.");
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

      setSuccess("Image uploaded successfully.");
      setTitle("");
      setDescription("");
      setTagsInput("");
      setTags([]);
      setFile(null);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <div className="upload-form__header">
        <span className="upload-form__badge">New Post</span>
        <div>
          <h2 className="upload-form__title">Upload image</h2>
          <p className="upload-form__subtitle">
            A title and at least one tag are required before publishing.
          </p>
        </div>
      </div>

      {error && <div className="upload-form__message upload-form__message--error">{error}</div>}
      {success && <div className="upload-form__message upload-form__message--success">{success}</div>}

      <div className="upload-form__fields">
        <label className="upload-form__field">
          <span className="upload-form__label">Image Title</span>
          <input
            type="text"
            placeholder="Evening light over the city"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="upload-form__input"
          />
        </label>

        <label className="upload-form__field">
          <span className="upload-form__label">Description</span>
          <textarea
            placeholder="Share context, mood, or the story behind this image."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="upload-form__textarea"
            rows={5}
          />
        </label>

        <div className="upload-form__field">
          <span className="upload-form__label">Tags</span>
          <div className="upload-form__tag-row">
            <input
              type="text"
              placeholder="Add tag..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="upload-form__input"
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
              className="upload-form__tag-button"
            >
              Add
            </button>
          </div>

          <p className="upload-form__hint">Add at least 1 tag so your image can be discovered.</p>

          <div className="upload-form__tags">
            {tags.map((tag) => (
              <span key={tag} className="upload-form__tag">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="upload-form__tag-remove">
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        <label className="upload-form__field">
          <span className="upload-form__label">Image File</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="upload-form__file"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="upload-form__submit"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}
