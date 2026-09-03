<template>
  <div class="dashboard-container">
    <!-- 💻 DESKTOP: Left Sidebar -->
    <aside class="dashboard-sidebar d-none d-md-flex">
      <router-link to="/posts" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <router-link to="/posts" class="nav-item" :class="{ active: currentView === 'home' }">
          <span class="nav-icon">🏠</span> Home
        </router-link>
        <router-link to="/my-posts" class="nav-item" :class="{ active: currentView === 'myposts' }">
          <span class="nav-icon">📋</span> My Posts
        </router-link>
        <router-link to="/create-post" class="nav-item" :class="{ active: currentView === 'create' }">
          <span class="nav-icon">+</span> Create
        </router-link>
        <a class="nav-item" @click="comingSoon">
          <span class="nav-icon">🔔</span> Notifications
        </a>
        <router-link to="/profile" class="nav-item active" :class="{ active: currentView === 'profile' }">
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

    <!-- 📄 RIGHT — Profile Content ✅ WITH proper padding class -->
    <main class="dashboard-feed profile-feed">
      <h1 class="feed-title">Profile</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-text">Loading profile...</div>

      <!-- Profile Content -->
      <div v-else-if="user" class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header-card">
          <div class="profile-avatar-large">{{ getInitials(user.username || user.name) }}</div>
          
          <div class="profile-info">
            <h2 class="profile-name">{{ user.username || user.name || 'User' }}</h2>
            <p class="profile-username">@{{ user.username || 'user' }}</p>
            <p class="profile-bio">This is your bio...</p>
          </div>

          <!-- Stats Row -->
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-number">{{ stats.posts }}</div>
              <div class="stat-label">Posts</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.liked }}</div>
              <div class="stat-label">Liked</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.followers }}</div>
              <div class="stat-label">Followers</div>
            </div>
          </div>

          <!-- Edit Profile Button -->
          <button class="edit-profile-btn" @click="comingSoon">✏️ Edit Profile</button>
        </div>

        <!-- Tabs: Posts / Saved / Liked -->
        <div class="profile-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'posts' }"
            @click="activeTab = 'posts'"
          >
            📄 Posts
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'saved' }"
            @click="activeTab = 'saved'"
          >
            🔖 Saved
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'liked' }"
            @click="activeTab = 'liked'"
          >
            ❤️ Liked
          </button>
        </div>

        <!-- 📄 USER'S OWN POSTS TAB -->
        <div v-if="activeTab === 'posts'">
          <div v-if="userPosts.length > 0" class="posts-grid">
            <div v-for="post in userPosts" :key="post._id" class="grid-post-card">
              <router-link to="/my-posts" class="grid-post-link">
                <img v-if="post.imageUrl" :src="post.imageUrl" alt="Post" class="grid-post-image" />
                <div v-else class="grid-post-placeholder">📷</div>
              </router-link>
            </div>
          </div>
          <div v-else class="profile-empty">
            <p>No posts yet! ✍️</p>
            <router-link to="/create-post" class="create-first-post-btn">Create your first post →</router-link>
          </div>
        </div>

        <!-- ❤️ LIKED POSTS TAB -->
        <div v-if="activeTab === 'liked'">
          <div v-if="likedPosts.length > 0" class="posts-grid">
            <div v-for="post in likedPosts" :key="post._id" class="grid-post-card">
              <img v-if="post.imageUrl" :src="post.imageUrl" alt="Post" class="grid-post-image" />
              <div v-else class="grid-post-placeholder">❤️</div>
            </div>
          </div>
          <div v-else class="profile-empty">
            <p>You haven't liked any posts yet! ❤️</p>
            <router-link to="/posts" class="create-first-post-btn">Browse Timeline →</router-link>
          </div>
        </div>

        <!-- 🔖 SAVED POSTS TAB (Coming Soon) -->
        <div v-if="activeTab === 'saved'" class="profile-empty">
          <p>🔖 Saved posts coming soon!</p>
        </div>
      </div>
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
      <router-link to="/create-post" class="mobile-nav-item create-btn" :class="{ active: currentView === 'create' }">
        <span class="mobile-icon">+</span>
      </router-link>
      <router-link to="#" class="mobile-nav-item" @click.prevent="comingSoon">
        <span class="mobile-icon">🔔</span>
        <span class="mobile-label">Notifications</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item active" :class="{ active: currentView === 'profile' }">
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

const user = ref(null)
const userPosts = ref([])
const likedPosts = ref([])
const loading = ref(true)
const activeTab = ref('posts')
const token = ref(localStorage.getItem('token') || '')

// Highlight "Profile" in sidebar
const currentView = computed(() => 'profile')

// Get user initials for avatar
const getInitials = (username) => {
  if (!username) return 'U'
  return username.charAt(0).toUpperCase()
}

// Stats
const stats = ref({
  posts: 0,
  liked: 0,
  followers: 340
})

// Fetch ALL posts → filter LIKED ones locally
const fetchProfile = async () => {
  loading.value = true
  try {
    // Get logged-in user
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }

    // Get ALL posts from timeline
    const res = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    
    if (res.ok) {
      const allPosts = data.posts || data || []
      
      // ✅ Filter: YOUR posts
      userPosts.value = allPosts.filter(p => {
        const userId = typeof p.userId === 'object' ? p.userId._id : p.userId
        return userId === user.value?._id
      })
      
      // ✅ Filter: POSTS YOU'VE LIKED
      likedPosts.value = allPosts.filter(p => {
        const likes = p.likes || []
        return likes.includes(user.value?._id)
      })
      
      // ✅ Update stats
      stats.value.posts = userPosts.value.length
      stats.value.liked = likedPosts.value.length
    }
  } catch (err) {
    console.error('Error loading profile:', err)
  }
  loading.value = false
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
  else fetchProfile()
})
</script>

<!-- ✅ ADD THIS STYLE BLOCK RIGHT HERE ↓↓↓ -->
<style scoped>
/* ✅ Make room for bottom nav bar on mobile */
@media (max-width: 767px) {
  .profile-feed {
    padding-bottom: 80px !important;
  }
}
</style>