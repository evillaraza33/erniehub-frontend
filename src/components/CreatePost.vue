<template>
  <div class="dashboard-container">
    <!-- 💻 ADMIN Sidebar — IF ADMIN -->
    <aside v-if="isAdmin" class="dashboard-sidebar d-none d-md-flex admin-sidebar">
      <router-link to="/admin" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item">
          <span class="nav-icon">🏠</span> Home
        </router-link>
        <router-link to="/admin/users" class="nav-item">
          <span class="nav-icon">👥</span> All Users
        </router-link>
        <router-link to="/admin/posts" class="nav-item">
          <span class="nav-icon">📄</span> All Posts
        </router-link>
        <router-link to="/admin/hidden-posts" class="nav-item">
          <span class="nav-icon">🙈</span> Hidden Posts
        </router-link>
        <router-link to="/admin/locked-comments" class="nav-item">
          <span class="nav-icon">🔒</span> Locked Comments
        </router-link>
        <router-link to="/admin/hidden-users" class="nav-item">
          <span class="nav-icon">🚫</span> Blocked Users
        </router-link>
        <router-link to="/profile" class="nav-item">
          <span class="nav-icon">👤</span> Profile
        </router-link>
        <router-link to="/create-post" class="nav-item create-post-sidebar active">
          <span class="nav-icon">➕</span> Create Post
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
    <!-- 💻 REGULAR USER Sidebar -->
    <aside v-else class="dashboard-sidebar d-none d-md-flex">
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
          <span class="nav-icon">➕</span> Create
        </router-link>
        <router-link to="/notifications" class="nav-item">
          <span class="nav-icon">🔔</span> Notifications
        </router-link>
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
    <!-- 📱 ADMIN Mobile Bottom Nav -->
    <nav v-if="isAdmin" class="mobile-bottom-nav d-md-none">
      <router-link to="/admin" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span>
      </router-link>
      <router-link to="/admin/users" class="mobile-nav-item">
        <span class="mobile-nav-icon">👥</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-post-mobile">
        <span class="mobile-nav-icon">➕</span>
      </router-link>
      <router-link to="/admin/posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">📄</span>
      </router-link>
      <router-link to="/admin/hidden-posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">🙈</span>
      </router-link>
      <router-link to="/admin/locked-comments" class="mobile-nav-item">
        <span class="mobile-nav-icon">🔒</span>
      </router-link>
      <router-link to="/admin/hidden-users" class="mobile-nav-item">
        <span class="mobile-nav-icon">🚫</span>
      </router-link>
      <button @click="logout" class="mobile-nav-item logout-btn">
        <span class="mobile-nav-icon">➡️</span>
      </button>
    </nav>
    <!-- 📱 REGULAR USER Mobile Bottom Nav -->
    <nav v-else class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">📋</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-post-mobile">
        <span class="mobile-nav-icon">➕</span>
      </router-link>
      <router-link to="/notifications" class="mobile-nav-item">
        <span class="mobile-nav-icon">🔔</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item">
        <span class="mobile-nav-icon">👤</span>
      </router-link>
    </nav>
    <!-- ✅ MAIN CREATE POST FORM -->
    <main class="dashboard-feed create-post-feed">
      <div class="create-post-container">
        <h1 class="feed-title">Create Post</h1>
        
        <textarea
          v-model="postContent"
          class="create-post-textarea"
          placeholder="What's on your mind?"
          maxlength="3000"
        ></textarea>
        
        <div class="char-count">{{ postContent.length }} / 3000</div>
        
        <input
          v-model="imageUrl"
          type="url"
          class="image-url-input"
          placeholder="Paste image URL here (optional)"
        />

        <!-- 🖼️ LIVE IMAGE PREVIEW — NEW! -->
        <div v-if="imageUrl" class="image-preview-container">
          <p class="preview-label">🖼️ Image Preview:</p>
          <img :src="imageUrl" alt="Preview" class="image-preview" @error="imageError = true" />
          <button type="button" class="remove-image-btn" @click="imageUrl = ''">✕ Remove Image</button>
        </div>
        
        <div class="create-post-buttons">
          <button class="cancel-btn" @click="goBack">Cancel</button>
          <button class="post-btn" @click="submitPost">Post</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '/src/assets/logo.png'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const token = ref(localStorage.getItem('token') || '')
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = ref(!!currentUser?.isAdmin)

const postContent = ref('')
const imageUrl = ref('')
const imageError = ref(false) // ✅ NEW: handles broken image links

const goBack = () => {
  router.back() // ✅ Goes to PREVIOUS page in browser history!
}

const submitPost = async () => {
  const content = postContent.value.trim()
  if (!content) {
    alert('Please fill out this field.')
    return
  }
  try {
    const res = await fetch(`${API_URL}/posts/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: content,
        imageUrl: imageUrl.value || null
      })
    })
    const data = await res.json()
    if (res.ok) {
      alert('Post created successfully! 🎉')
      postContent.value = ''
      imageUrl.value = ''
      goBack()
    } else {
      alert(data.error || 'Failed to create post.')
    }
  } catch (err) {
    console.error('Create post error:', err)
    alert('Something went wrong!')
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
</script>