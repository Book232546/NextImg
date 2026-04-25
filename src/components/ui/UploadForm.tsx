"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_IMAGE_DIMENSION = 1600;
const OUTPUT_QUALITY = 0.82;

async function optimizeImageFile(file: File) {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to process the selected image."));
      img.src = objectUrl;
    });

    const longestSide = Math.max(image.width, image.height);
    const scale =
      longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const optimizedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", OUTPUT_QUALITY);
    });

    if (!optimizedBlob || optimizedBlob.size >= file.size) {
      return file;
    }

    const optimizedName = file.name.replace(/\.[^.]+$/, "") || "upload";
    return new File([optimizedBlob], `${optimizedName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

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

    try {
      setUploading(true);
      setProcessing(true);
      const optimizedFile = await optimizeImageFile(file);
      setProcessing(false);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: (() => {
          const nextFormData = new FormData();
          nextFormData.append("title", title.trim());
          nextFormData.append("description", description.trim());
          nextFormData.append("tags", JSON.stringify(tags));
          nextFormData.append("file", optimizedFile);
          return nextFormData;
        })(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      router.push(`/image/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setProcessing(false);
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

      <div className="upload-form__fields">
        <label className="upload-form__field">
          <span className="upload-form__label">Image Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="upload-form__input"
          />
        </label>

        <label className="upload-form__field">
          <span className="upload-form__label">Description</span>
          <textarea
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
        disabled={uploading || processing}
        className="upload-form__submit"
      >
        {processing ? "Optimizing image..." : uploading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}
