import type { MessageSchema } from './es'

// TypeScript enforces that every key in MessageSchema exists here.
// A missing or misspelled key is a compile error, not a silent blank string.
const en: MessageSchema = {
  common: {
    save: 'Save changes',
    cancel: 'Cancel',
    retry: 'Retry',
    required: 'required',
  },
  nav: {
    restaurants: 'Restaurants',
    logout: 'Log out',
  },
  auth: {
    loginSubtitle: 'Sign in to your account',
    registerSubtitle: 'Create your free account',
    email: 'Email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    passwordHint: '(min. 8 characters)',
    loginButton: 'Sign in',
    loginLoading: 'Signing in...',
    registerButton: 'Create account',
    registerLoading: 'Creating account...',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    sessionExpired: 'Your session expired. Please sign in again.',
    errors: {
      passwordLength: 'Password must be at least 8 characters',
      login: 'Failed to sign in',
      register: 'Failed to create account',
    },
  },
  restaurant: {
    title: 'Restaurants',
    subtitle: 'Manage all your locations',
    new: 'New restaurant',
    edit: 'Edit restaurant',
    create: 'Create restaurant',
    empty: 'No restaurants yet',
    emptyHint: 'Create your first location to get started',
    deleteConfirm: 'Delete this restaurant? This action cannot be undone.',
    fields: {
      name: 'Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email (optional)',
      description: 'Description (optional)',
      photo: 'Photo (optional)',
    },
    photo: {
      select: 'Select image',
      change: 'Change',
      upload: 'Upload photo',
      uploadChange: 'Change photo',
    },
    detail: {
      createdAt: 'Created',
    },
    toast: {
      created: 'Restaurant created successfully',
      updated: 'Restaurant updated successfully',
      deleted: 'Restaurant deleted',
      photoOk: 'Photo updated successfully',
      saveError: 'Failed to save',
      photoError: 'Failed to upload photo',
      deleteError: 'Failed to delete',
    },
  },
  errors: {
    generic: 'An unexpected error occurred.',
    network: 'Network error. Check your connection.',
  },
}

export default en
