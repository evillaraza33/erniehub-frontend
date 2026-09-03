<template>
  <div class="dashboard-container">
    <!-- 💻 DESKTOP: Left Sidebar -->
    <aside class="dashboard-sidebar d-none d-md-flex">
      <router-link to="/posts" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <router-link to="/posts" class="nav-item">
          <span class="nav-icon">🏠</span> Home
        </router-link>
        <router-link to="/my-posts" class="nav-item">
          <span class="nav-icon">📋</span> My Posts
        </router-link>
        <router-link to="/create-post" class="nav-item active">
          <span class="nav-icon">+</span> Create
        </router-link>
        <a class="nav-item" @click="comingSoon">
          <span class="nav-icon">🔔</span> Notifications
        </a>
        <router-link to="/profile" class="nav-item">
          <span class="nav-icon">👤</span> Profile
        </router-link>
      </nav>
      <div class="sidebar-bottom">
        <a class="nav-item" @click="comingSoon">
          <span class="nav-icon">⚙️</span> Settings
        </a>
        <a class="nav-item logout-btn" @click="logout">
          <span class="nav-icon">➡️</span> Logout
        </a>
      </div>
    </aside>

    <!-- 📄 RIGHT — Create Post Form -->
    <main class="dashboard-feed">
      <h1 class="feed-title">Create Post</h1>
      <form @submit.prevent="createPost" class="create-post-form">
        <textarea
          v-model="content"
          class="post-textarea"
          placeholder="What's on your mind?"
          required
          maxlength="3000"
        ></textarea>

        <!-- 🖼️ IMAGE URL FIELD + PREVIEW -->
        <div class="image-input-wrapper">
          <input
            v-model="imageUrl"
            type="url"
            class="image-url-input"
            placeholder="📷 Paste image URL here (optional)"
          />

          <!-- LIVE PREVIEW — Shows as user types -->
          <div v-if="imageUrl" class="image-preview-container">
            <p class="preview-label">Image Preview:</p>
            <img :src="imageUrl" alt="Preview" class="image-preview" @error="imageError = true" />
            <button type="button" class="remove-image-btn" @click="imageUrl = ''">✕ Remove</button>
          </div>
        </div>

        <div class="form-footer">
          <span class="char-count">{{ content.length }} / 3000</span>
          <!-- ✅ WRAP BUTTONS IN A DIV → they stick together! -->
          <div class="button-group">
            <router-link to="/posts" class="cancel-btn">Cancel</router-link>
            <button type="submit" class="post-btn">Post</button>
          </div>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">✅ Post created successfully! Redirecting...</p>
      </form>
    </main>

    <!-- 📱 MOBILE: Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item" :class="{ active: currentView === 'home' }">
        <span class="mobile-icon">🏠</span>
        <span class="mobile-label">Home</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item" :class="{ active: currentView === 'myposts' }">
        <span class="mobile-icon">📋</span>
        <span class="mobile-label">My Posts</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-btn" :class="{ active: true }">
        <span class="mobile-icon">+</span>
      </router-link>
      <router-link to="#" class="mobile-nav-item" @click.prevent="comingSoon">
        <span class="mobile-icon">🔔</span>
        <span class="mobile-label">Alerts</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item" :class="{ active: currentView === 'profile' }">
        <span class="mobile-icon">👤</span>
        <span class="mobile-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import logo from '/src/assets/logo.png'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ✅ Highlight "Create" in mobile nav
const currentView = computed(() => 'create')

const content = ref('')
const imageUrl = ref('')
const imageError = ref(false)
const error = ref('')
const success = ref('')
const token = ref(localStorage.getItem('token') || '')

const createPost = async () => {
  error.value = ''
  success.value = ''

  if (!content.value.trim()) {
    error.value = 'Please write something before posting!'
    return
  }

  try {
    const res = await fetch(`${API_URL}/posts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        content: content.value,
        imageUrl: imageUrl.value || null
      })
    })

    const data = await res.json()

    if (res.ok) {
      success.value = '✅ Post created successfully! Redirecting...'
      setTimeout(() => router.push('/posts'), 1500)
    } else {
      error.value = data.error || 'Failed to create post'
    }
  } catch (err) {
    error.value = 'Server error. Please try again.'
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const comingSoon = () => {
  alert('This feature is coming soon! 🚀')
}

onMounted(() => {
  if (!token.value) {
    router.push('/login')
  }
})
</script>