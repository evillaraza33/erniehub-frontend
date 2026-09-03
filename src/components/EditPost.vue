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
        <router-link to="/create-post" class="nav-item">
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

    <!-- 📄 RIGHT — Edit Post Form -->
    <main class="dashboard-feed">
      <h1 class="feed-title">Edit Post</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-text">Loading post...</div>

      <!-- Edit Form -->
      <form v-else-if="post" @submit.prevent="updatePost" class="create-post-form">
        <textarea
          v-model="content"
          class="post-textarea"
          placeholder="What's on your mind?"
          required
          maxlength="3000"
        ></textarea>

        <!-- 🖼️ Image URL Field + Preview -->
        <div class="image-input-wrapper">
          <input
            v-model="imageUrl"
            type="url"
            class="image-url-input"
            placeholder="📷 Image URL (leave blank to remove)"
          />
          
          <!-- LIVE PREVIEW -->
          <div v-if="imageUrl" class="image-preview-container">
            <p class="preview-label">Image Preview:</p>
            <img :src="imageUrl" alt="Preview" class="image-preview" @error="imageError = true" />
            <button type="button" class="remove-image-btn" @click="imageUrl = ''">✕ Remove Image</button>
          </div>
        </div>

        <div class="form-footer">
          <span class="char-count">{{ content.length }} / 500</span>
          <div class="button-group">
            <router-link to="/my-posts" class="cancel-btn">Cancel</router-link>
            <button type="submit" class="save-btn">💾 Save Changes</button>
          </div>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">✅ Post updated successfully! Redirecting...</p>
      </form>

      <!-- Post Not Found -->
      <div v-else class="empty-state">
        <p>❌ Post not found or you don't have permission to edit it.</p>
        <router-link to="/my-posts" class="create-first-post-btn">← Back to My Posts</router-link>
      </div>
    </main>

    <!-- 📱 MOBILE: Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item">
        <span class="mobile-icon">🏠</span>
        <span class="mobile-label">Home</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item active">
        <span class="mobile-icon">📋</span>
        <span class="mobile-label">My Posts</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-btn">
        <span class="mobile-icon">+</span>
      </router-link>
      <router-link to="#" class="mobile-nav-item" @click.prevent="comingSoon">
        <span class="mobile-icon">🔔</span>
        <span class="mobile-label">Notifications</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item">
        <span class="mobile-icon">👤</span>
        <span class="mobile-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '/src/assets/logo.png'

const router = useRouter()
const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const post = ref(null)
const content = ref('')
const imageUrl = ref('')
const loading = ref(true)
const error = ref('')
const success = ref('')
const imageError = ref(false)
const token = ref(localStorage.getItem('token') || '')
const postId = route.params.id

// Fetch Post Data to Edit
const fetchPost = async () => {
  loading.value = true
  try {
    // Get all posts and find this one (or create a getSinglePost route later)
    const res = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) {
      const allPosts = data.posts || data || []
      post.value = allPosts.find(p => p._id === postId)
      if (post.value) {
        content.value = post.value.content
        imageUrl.value = post.value.imageUrl || ''
      }
    }
  } catch (err) {
    console.error('Error fetching post:', err)
  }
  loading.value = false
}

// Update Post
const updatePost = async () => {
  error.value = ''
  success.value = ''

  if (!content.value.trim()) {
    error.value = 'Post content cannot be empty!'
    return
  }

  try {
    const res = await fetch(`${API_URL}/posts/update/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: content.value,
        imageUrl: imageUrl.value || null
      })
    })

    const data = await res.json()

    if (res.ok) {
      success.value = '✅ Post updated successfully! Redirecting...'
      setTimeout(() => {
        router.push('/my-posts')
      }, 1200)
    } else {
      error.value = data.error || 'Failed to update post'
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
  if (!token.value) router.push('/login')
  else fetchPost()
})
</script>