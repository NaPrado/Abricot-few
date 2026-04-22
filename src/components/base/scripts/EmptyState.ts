import type { Component } from 'vue'

export interface EmptyStateProps {
  title?: string
  description?: string
  /** Alias for `title` (legacy templates) */
  message?: string
  /** Alias for `description` (legacy templates) */
  hint?: string
  icon?: Component
}
