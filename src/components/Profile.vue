<template>
  <div class="dashboard-container">
    <!-- 💻 ADMIN Sidebar -->
    <aside v-if="isAdmin" class="dashboard-sidebar d-none d-md-flex admin-sidebar">
      <router-link to="/posts" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <router-link to="/posts" class="nav-item">
          <span class="nav-icon">🏠</span> Home
        </router-link>
        <router-link to="/create-post" class="nav-item">
          <span class="nav-icon">➕</span> Create Post
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
        <router-link to="/profile" class="nav-item active">
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
        <router-link to="/create-post" class="nav-item">
          <span class="nav-icon">➕</span> Create
        </router-link>
        <router-link to="/notifications" class="nav-item">
          <span class="nav-icon">🔔</span> Notifications
        </router-link>
        <router-link to="/profile" class="nav-item active">
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

    <!-- ✅ FIXED: Added v-if="isAdmin" so v-else works! -->
    <!-- 📱 ADMIN Mobile Bottom Nav -->
    <nav v-if="isAdmin" class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item" :class="{ active: $route.path === '/posts' }">
        <span class="mobile-nav-icon">🏠</span>
        <span class="mobile-nav-label">Home</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-post-mobile">
        <span class="mobile-nav-icon">➕</span>
      </router-link>
      <router-link to="/admin/users" class="mobile-nav-item" :class="{ active: $route.path === '/admin/users' }">
        <span class="mobile-nav-icon">👥</span>
        <span class="mobile-nav-label">Users</span>
      </router-link>
      <router-link 
        v-if="$route.path !== '/profile'" 
        to="/profile" 
        class="mobile-nav-item"
        :class="{ active: $route.path === '/profile' }"
      >
        <span class="mobile-nav-icon">👤</span>
        <span class="mobile-nav-label">Profile</span>
      </router-link>
      <router-link 
        v-else 
        to="/admin/posts" 
        class="mobile-nav-item"
        :class="{ active: $route.path === '/admin/posts' }"
      >
        <span class="mobile-nav-icon">📄</span>
        <span class="mobile-nav-label">All Posts</span>
      </router-link>
      <div class="mobile-nav-item more-menu-container" @click="showMoreMenu = !showMoreMenu">
        <span class="mobile-nav-icon">⋯</span>
        <span class="mobile-nav-label">More</span>
        <div v-if="showMoreMenu" class="more-dropdown-menu dropdown-up" @click="showMoreMenu = false">
          <!-- ✅ Only show All Posts when NOT on Profile page -->
          <router-link v-if="$route.path !== '/profile'" to="/admin/posts" class="dropdown-item">📄 All Posts</router-link>
          
          <!-- ✅ HIDE Profile when ALREADY ON Profile page -->
          <router-link v-if="$route.path !== '/profile'" to="/profile" class="dropdown-item">👤 Profile</router-link>
          
          <router-link to="/admin/hidden-posts" class="dropdown-item">🙈 Hidden Posts</router-link>
          <router-link to="/admin/locked-comments" class="dropdown-item">🔒 Locked Comments</router-link>
          <router-link to="/admin/hidden-users" class="dropdown-item">🚫 Blocked Users</router-link>
          <hr class="dropdown-divider" />
          <a class="dropdown-item" @click.stop="comingSoon">⚙️ Settings</a>
          <a class="dropdown-item logout-item" @click.stop="logout">➡️ Logout</a>
        </div>
      </div>
    </nav>

    <!-- 📱 REGULAR USER Mobile Bottom Nav -->
    <nav v-else class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span>
        <span class="mobile-nav-label">Home</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">📋</span>
        <span class="mobile-nav-label">My Posts</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-post-mobile">
        <span class="mobile-nav-icon">➕</span>
      </router-link>
      <router-link to="/notifications" class="mobile-nav-item">
        <span class="mobile-nav-icon">🔔</span>
        <span class="mobile-nav-label">Alerts</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item active">
        <span class="mobile-nav-icon">👤</span>
        <span class="mobile-nav-label">Profile</span>
      </router-link>
    </nav>

    <!-- ✅ PROFILE CONTENT -->
    <main class="dashboard-feed">
      <div class="profile-page-wrapper">
        <div class="profile-header-section">
          <div class="profile-avatar-large">
            {{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <h2 class="profile-display-name">{{ currentUser?.username }}</h2>
          <p class="profile-handle">@{{ currentUser?.username?.toLowerCase() }}</p>
          <p class="profile-email">{{ currentUser?.email }}</p>
        </div>
        <div class="profile-stats-row">
          <div class="profile-stat">
            <span class="stat-number">{{ myPostsCount }}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="profile-stat">
            <span class="stat-number">{{ likedPosts.length }}</span>
            <span class="stat-label">Liked</span>
          </div>
          <div class="profile-stat">
            <span class="stat-number">340</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>
        <div class="edit-button-wrapper">
          <button class="edit-profile-btn" @click="showEditForm = !showEditForm">
            ✏️ Edit Profile
          </button>
        </div>
        <div v-if="showEditForm" class="edit-form-container">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="updateForm.username" type="text" class="form-input" :placeholder="currentUser?.username" />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input v-model="updateForm.email" type="email" class="form-input" :placeholder="currentUser?.email" />
            </div>
            <div class="form-group">
              <label>New Password <small>(leave blank to keep current)</small></label>
              <input v-model="updateForm.password" type="password" class="form-input" placeholder="Enter new password" />
            </div>
            <div class="form-button-group">
              <button type="button" class="cancel-btn" @click="showEditForm = false">Cancel</button>
              <button type="submit" class="save-btn" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
        <div class="profile-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'posts' }"
            @click="switchTab('posts')"
          >
            📄 <span>Posts</span>
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'saved' }"
            @click="switchTab('saved')"
          >
            📁 <span>Saved</span>
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'liked' }"
            @click="switchTab('liked')"
          >
            ❤️ <span>Liked</span>
          </button>
        </div>
        <div class="tab-content-area">
          <div v-if="activeTab === 'posts'">
            <div v-if="isLoading" class="empty-state-container">
              <div class="empty-icon">⏳</div>
              <h3>Loading your posts...</h3>
            </div>
            <div v-else-if="myPostsCount > 0" class="liked-posts-list">
              <div v-for="post in myPosts" :key="post._id" class="liked-post-card">
                <p class="liked-post-content">{{ post.content }}</p>
                <div v-if="post.imageUrl" class="liked-post-image-wrapper">
                  <img :src="post.imageUrl" alt="Post image" class="liked-post-image" />
                </div>
                <div class="liked-post-meta">
                  <span>📝 Your post</span>
                  <span>{{ new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
                </div>
                <div class="post-owner-actions">
                  <router-link :to="`/edit-post/${post._id}`" class="edit-post-btn">✏️ Edit</router-link>
                  <button class="delete-post-btn" @click="deletePost(post._id)">🗑️ Delete</button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-container">
              <div class="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Your posts will appear here. Start sharing your thoughts with the world!</p>
              <router-link to="/create-post" class="create-first-post-btn">
                ✨ Create Your First Post
              </router-link>
            </div>
          </div>
          <div v-if="activeTab === 'saved'" class="empty-state-container">
            <div class="empty-icon">📁</div>
            <h3>Saved Posts</h3>
            <p>Saved posts will appear here. Coming soon!</p>
          </div>
          <div v-if="activeTab === 'liked'">
            <div v-if="isLoading" class="empty-state-container">
              <div class="empty-icon">⏳</div>
              <h3>Loading...</h3>
            </div>
            <div v-else-if="likedPosts.length > 0" class="liked-posts-list">
              <div v-for="post in likedPosts" :key="post._id" class="liked-post-card">
                <p class="liked-post-content">{{ post.content }}</p>
                <div v-if="post.imageUrl" class="liked-post-image-wrapper">
                  <img :src="post.imageUrl" alt="Post image" class="liked-post-image" />
                </div>
                <div class="liked-post-meta">
                  <span>❤️ Liked by you</span>
                  <span>{{ new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-container">
              <div class="empty-icon">❤️</div>
              <h3>No liked posts yet</h3>
              <p>When you like a post, it will appear here. Start exploring and show some love!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '/src/assets/logo.png'

const router = useRouter()
const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const isAdmin = ref(!!currentUser.value?.isAdmin)
const showMoreMenu = ref(false)
const showEditForm = ref(false)
const activeTab = ref('posts')
const myPosts = ref([])
const myPostsCount = ref(0)
const likedPosts = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const token = localStorage.getItem('token')
const userId = currentUser.value?._id
const username = currentUser.value?.username

console.log('👤 CURRENT USER:', { _id: userId, username, isAdmin: isAdmin.value })

const switchTab = async (tabName) => {
  activeTab.value = tabName
  if (tabName === 'posts') await fetchMyPosts()
  if (tabName === 'liked') await fetchLikedPosts()
}

const fetchMyPosts = async () => {
  if (!token) return
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    
    let allPosts = []
    if (Array.isArray(data)) allPosts = data
    else if (data.posts && Array.isArray(data.posts)) allPosts = data.posts
    else if (data.data && Array.isArray(data.data)) allPosts = data.data
    else if (data.message && Array.isArray(data.message)) allPosts = data.message
    
    console.log('📦 TOTAL POSTS LOADED:', allPosts.length)
    
    if (allPosts.length > 0) {
      myPosts.value = allPosts.filter(post => {
        const matchesById = post.userId === userId || post.user === userId
        const matchesByName = post.username === username
        return matchesById || matchesByName
      })
      myPostsCount.value = myPosts.value.length
      console.log('✅ YOUR POSTS:', myPostsCount.value)
    }
  } catch (err) {
    console.log('❌ ERROR:', err)
  } finally {
    isLoading.value = false
  }
}

const deletePost = async (postId) => {
  if (!confirm('⚠️ Are you sure you want to delete this post? This cannot be undone!')) return
  
  try {
    const res = await fetch(`${API_URL}/posts/delete/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (res.ok) {
      alert('✅ Post deleted successfully!')
      await fetchMyPosts()
    } else {
      const data = await res.json()
      alert('❌ ' + (data.error || 'Failed to delete post'))
    }
  } catch (err) {
    console.log('❌ Delete error:', err)
    alert('❌ Server error. Please try again.')
  }
}

const fetchLikedPosts = async () => {
  if (!token) return
  isLoading.value = true
  try {
    const res = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    
    let allPosts = []
    if (Array.isArray(data)) allPosts = data
    else if (data.posts && Array.isArray(data.posts)) allPosts = data.posts
    else if (data.data && Array.isArray(data.data)) allPosts = data.data
    else if (data.message && Array.isArray(data.message)) allPosts = data.message
    
    if (allPosts.length > 0) {
      likedPosts.value = allPosts.filter(post => {
        if (!post.likes || !Array.isArray(post.likes)) return false
        return post.likes.includes(userId)
      })
    }
  } catch (err) {
    console.log('❌ ERROR:', err)
  } finally {
    isLoading.value = false
  }
}

const updateForm = ref({
  username: '',
  email: '',
  password: ''
})

const updateProfile = async () => {
  if (!token) return alert('Please log in first')
  
  isSaving.value = true
  try {
    const payload = {}
    if (updateForm.value.username && updateForm.value.username !== currentUser.value.username) {
      payload.username = updateForm.value.username
    }
    if (updateForm.value.email && updateForm.value.email !== currentUser.value.email) {
      payload.email = updateForm.value.email
    }
    if (updateForm.value.password && updateForm.value.password.trim() !== '') {
      payload.password = updateForm.value.password
    }
    
    if (Object.keys(payload).length === 0) {
      alert('No changes were made!')
      return
    }
    
    const res = await fetch(`${API_URL}/users/update`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const result = await res.json()
    
    if (res.ok) {
      const updatedUser = { ...currentUser.value, ...result.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      currentUser.value = updatedUser
      
      alert('✅ Profile updated successfully!')
      showEditForm.value = false
      updateForm.value.password = ''
    } else {
      alert('❌ Error: ' + (result.error || 'Could not update profile'))
    }
  } catch (err) {
    alert('❌ Something went wrong. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const comingSoon = () => {
  alert('Coming soon! 🚀')
}

onMounted(() => {
  if (currentUser.value) {
    updateForm.value.username = currentUser.value.username || ''
    updateForm.value.email = currentUser.value.email || ''
  }
  fetchMyPosts()
  fetchLikedPosts()
})
</script>