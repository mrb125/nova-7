import { useEffect, useRef } from 'react'

interface Props {
  question: string
  keywords?: string[]  // kept for caller compatibility, no longer used for auto-scoring
  onSubmit: (text: string, score: number) => void
  disabled?: boolean
}

export default function JustificationField({ onSubmit }: Props) {
  const called = useRef(false)

  // Auto-submit immediately — no justification required in this version
  useEffect(() => {
    if (!called.current) {
      called.current = true
      onSubmit('', 0)
    }
  }, [onSubmit])

  return null  // No UI rendered
}
