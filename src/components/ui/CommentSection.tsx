"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useState, useTransition } from "react"

type CommentItem = {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    image: string | null
  }
}

type CurrentUser = {
  id: string
  username: string
  image: string | null
} | null

type CommentSectionProps = {
  imageId: string
  currentUser: CurrentUser
  initialComments: CommentItem[]
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function CommentSection({
  imageId,
  currentUser,
  initialComments,
}: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, startTransition] = useTransition()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser) {
      router.push("/login")
      return
    }

    const trimmed = content.trim()

    if (!trimmed) {
      setError("Please write a comment before posting.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/image/${imageId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to post comment")
      }

      setComments((prev) => [data.comment as CommentItem, ...prev])
      setContent("")

      startTransition(() => {
        router.refresh()
      })
    } catch (submitError) {
      console.error(submitError)
      setError(submitError instanceof Error ? submitError.message : "Unable to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="image-comments">
      <div className="image-comments__header">
        <div>
          <h2 className="image-comments__title">Comments</h2>
          <p className="image-comments__subtitle">
            Share feedback, ask a question, or leave a quick reaction on this image.
          </p>
        </div>
        <span className="image-comments__count">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <form className="image-comment-form" onSubmit={handleSubmit}>
        <textarea
          className="image-comment-form__textarea"
          name="content"
          rows={4}
          maxLength={500}
          placeholder={currentUser ? "Write something thoughtful about this image..." : "Sign in to join the conversation."}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isSubmitting}
        />

        <div className="image-comment-form__footer">
          <p className="image-comment-form__hint">
            {currentUser ? `${content.trim().length}/500 characters` : "Login is required to post a comment."}
          </p>

          <button
            type="submit"
            className="image-comment-form__button"
            disabled={isSubmitting}
          >
            {currentUser ? (isSubmitting ? "Posting..." : "Post comment") : "Login to comment"}
          </button>
        </div>

        {error ? <p className="image-comment-form__error">{error}</p> : null}
      </form>

      <div className="image-comment-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="image-comment">
              <img
                src={comment.user.image ?? "/default-avatar.svg"}
                alt={comment.user.username}
                className="image-comment__avatar"
              />

              <div className="image-comment__body">
                <div className="image-comment__meta">
                  <span className="image-comment__author">{comment.user.username}</span>
                  <time className="image-comment__date" dateTime={comment.createdAt}>
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </div>

                <p className="image-comment__content">{comment.content}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="image-comments__empty">
            <p>No comments yet. Start the conversation on this image.</p>
          </div>
        )}
      </div>
    </section>
  )
}
