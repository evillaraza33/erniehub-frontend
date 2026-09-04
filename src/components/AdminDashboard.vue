<template>
  <div class="dashboard-container">
    <!-- 💻 ADMIN Left Sidebar — DESKTOP ONLY -->
    <aside class="dashboard-sidebar d-none d-md-flex admin-sidebar">
      <router-link to="/posts" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <router-link to="/posts" class="nav-item" :class="{ active: $route.path === '/posts' }">
          <span class="nav-icon">🏠</span> Home
        </router-link>
        <router-link to="/admin/users" class="nav-item" :class="{ active: activeView === 'users' }">
          <span class="nav-icon">👥</span> All Users
        </router-link>
        <router-link to="/admin/posts" class="nav-item" :class="{ active: activeView === 'posts' }">
          <span class="nav-icon">📄</span> All Posts
        </router-link>
        <router-link to="/admin/hidden-posts" class="nav-item" :class="{ active: activeView === 'hidden-posts' }">
          <span class="nav-icon">🙈</span> Hidden Posts
        </router-link>
        <router-link to="/admin/locked-comments" class="nav-item" :class="{ active: activeView === 'locked-comments' }">
          <span class="nav-icon">🔒</span> Locked Comments
        </router-link>
        <router-link to="/admin/hidden-users" class="nav-item" :class="{ active: activeView === 'hidden-users' }">
          <span class="nav-icon">🚫</span> Blocked Users
        </router-link>
        <router-link to="/profile" class="nav-item" :class="{ active: activeView === 'profile' }">
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

    <!-- 📱 ADMIN MOBILE BOTTOM NAVIGATION — ✅ NEW! -->
    <nav class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span>
        <span>Home</span>
      </router-link>
      <router-link to="/admin/users" class="mobile-nav-item">
        <span class="mobile-nav-icon">👥</span>
        <span>Users</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-btn">
        <span class="plus-icon">+</span>
      </router-link>
      <router-link to="/admin/posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">📄</span>
        <span>Posts</span>
      </router-link>
      <button @click="logout" class="mobile-nav-item logout-btn">
        <span class="mobile-nav-icon">🚪</span>
        <span>Logout</span>
      </button>
    </nav>

    <!-- 📄 MAIN CONTENT AREA -->
    <main class="dashboard-feed admin-feed">
      <!-- 🏠 ADMIN HOME — Shows ALL Posts -->
      <div v-if="activeView === 'home'">
        <h1 class="feed-title">All Posts</h1>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else-if="allPosts.length > 0">
          <div v-for="post in allPosts" :key="post._id" class="post-card">
            <div class="post-header">
              <div class="post-author">
                <div class="post-avatar">{{ getInitials(post.username) }}</div>
                <div class="post-meta">
                  <div class="post-author-name">{{ post.username || 'User' }}</div>
                  <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                </div>
              </div>
              <div class="admin-post-actions">
                <button 
                  class="admin-lock-btn" 
                  :class="{ locked: post.isLocked }"
                  @click="toggleLock(post._id, post.isLocked)"
                  :title="post.isLocked ? '🔓 Unlock Comments' : '🔒 Lock Comments'"
                >
                  {{ post.isLocked ? '🔓' : '🔒' }}
                </button>
                <button 
                  class="admin-hide-btn" 
                  :class="{ hidden: post.isHidden }"
                  @click="toggleHide(post._id, post.isHidden)"
                  :title="post.isHidden ? '👁️ Unhide Post' : '🙈 Hide Post'"
                >
                  {{ post.isHidden ? '👁️' : '🙈' }}
                </button>
              </div>
            </div>
            <div class="post-content-text">{{ post.content }}</div>
            <div v-if="post.imageUrl" class="post-image-container">
              <img :src="post.imageUrl" alt="Post" class="post-image" />
            </div>
            <div v-if="post.isLocked || post.isHidden" class="admin-status-badges">
              <span v-if="post.isLocked" class="badge-locked">🔒 Comments Locked</span>
              <span v-if="post.isHidden" class="badge-hidden">🙈 Hidden from Public</span>
            </div>
            <div class="post-actions">
              <button class="action-btn-like">❤️ {{ post.likes?.length || 0 }}</button>
              <button class="action-btn-comment">💬 {{ post.comments?.length || 0 }}</button>
              <button class="action-btn-share" @click="comingSoon">🔁 Share</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>No posts yet.</p>
        </div>
      </div>

      <!-- 👥 ALL USERS TAB -->
      <div v-if="activeView === 'users'">
        <div class="admin-header-bar">
          <h1 class="feed-title">All Users</h1>
          <input 
            v-model="searchUser" 
            type="text" 
            class="admin-search-input" 
            placeholder="🔍 Search users..."
          />
        </div>
        <div v-if="loading" class="loading-text">Loading users...</div>
        <div v-else class="users-list">
          <div v-for="user in filteredUsers" :key="user._id" class="user-list-item">
            <div class="user-avatar-small">{{ getInitials(user.username || user.name) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.username || user.name || 'User' }}</div>
              <div class="user-handle">@{{ user.username || 'user' }}</div>
              <div class="user-stats-small">{{ user.postCount || 0 }} posts</div>
            </div>
            <div class="user-actions">
              <button 
                class="block-user-btn" 
                :class="{ blocked: user.isBlocked }"
                @click="toggleBlockUser(user._id, user.isBlocked)"
                :title="user.isBlocked ? 'Unblock User' : 'Block User'"
              >
                {{ user.isBlocked ? '✅' : '🚫' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 📄 ALL POSTS TAB -->
      <div v-if="activeView === 'posts'">
        <h1 class="feed-title">All Posts</h1>
        <p class="admin-subtitle">All public posts</p>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else class="posts-list">
          <div v-for="post in allPosts" :key="post._id" class="post-card">
            <div class="post-header">
              <div class="post-author">
                <div class="post-avatar">{{ getInitials(post.username) }}</div>
                <div class="post-meta">
                  <div class="post-author-name">{{ post.username }}</div>
                  <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                </div>
              </div>
              <div class="admin-post-actions">
                <button 
                  class="admin-lock-btn" 
                  :class="{ locked: post.isLocked }"
                  @click="toggleLock(post._id, post.isLocked)"
                >
                  {{ post.isLocked ? '🔓' : '🔒' }}
                </button>
                <button 
                  class="admin-hide-btn" 
                  :class="{ hidden: post.isHidden }"
                  @click="toggleHide(post._id, post.isHidden)"
                >
                  {{ post.isHidden ? '👁️' : '🙈' }}
                </button>
              </div>
            </div>
            <div class="post-content-text">{{ post.content }}</div>
            <div v-if="post.imageUrl" class="post-image-container">
              <img :src="post.imageUrl" alt="Post" class="post-image" />
            </div>
            <div v-if="post.isLocked || post.isHidden" class="admin-status-badges">
              <span v-if="post.isLocked" class="badge-locked">🔒 Locked</span>
              <span v-if="post.isHidden" class="badge-hidden">🙈 Hidden</span>
            </div>
            <div class="post-actions">
              <span class="action-btn-like">❤️ {{ post.likes?.length || 0 }}</span>
              <span class="action-btn-comment">💬 {{ post.comments?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 🙈 HIDDEN POSTS TAB -->
      <div v-if="activeView === 'hidden-posts'">
        <h1 class="feed-title">Hidden Posts</h1>
        <p class="admin-subtitle">Posts hidden from public view</p>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else-if="hiddenPosts.length > 0">
          <div v-for="post in hiddenPosts" :key="post._id" class="post-card">
            <div class="post-header">
              <div class="post-author">
                <div class="post-avatar">{{ getInitials(post.username) }}</div>
                <div class="post-meta">
                  <div class="post-author-name">{{ post.username }}</div>
                </div>
              </div>
              <button class="admin-hide-btn hidden" @click="toggleHide(post._id, true)">👁️ Unhide</button>
            </div>
            <div class="post-content-text">{{ post.content }}</div>
            <div v-if="post.imageUrl" class="post-image-container">
              <img :src="post.imageUrl" alt="Post" class="post-image" />
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>No hidden posts! 🎉</p>
        </div>
      </div>

      <!-- 🔒 LOCKED COMMENTS TAB -->
      <div v-if="activeView === 'locked-comments'">
        <h1 class="feed-title">Locked Comments</h1>
        <p class="admin-subtitle">Posts where comments are currently locked</p>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else-if="lockedPosts.length > 0">
          <div v-for="post in lockedPosts" :key="post._id" class="post-card">
            <div class="post-header">
              <div class="post-author">
                <div class="post-avatar">{{ getInitials(post.username) }}</div>
                <div class="post-meta">
                  <div class="post-author-name">{{ post.username }}</div>
                  <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                </div>
              </div>
              <button class="admin-lock-btn locked" @click="toggleLock(post._id, true)">🔓 Unlock Comments</button>
            </div>
            <div class="post-content-text">{{ post.content }}</div>
            <div v-if="post.imageUrl" class="post-image-container">
              <img :src="post.imageUrl" alt="Post" class="post-image" />
            </div>
            <div class="admin-status-badges">
              <span class="badge-locked">🔒 Comments are locked</span>
            </div>
            <div class="post-actions">
              <span class="action-btn-comment">💬 {{ post.comments?.length || 0 }} Comments (Locked)</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>No locked comments! 🎉</p>
        </div>
      </div>

      <!-- 🚫 BLOCKED USERS TAB -->
      <div v-if="activeView === 'hidden-users'">
        <h1 class="feed-title">Blocked Users</h1>
        <p class="admin-subtitle">Users suspended or blocked</p>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else-if="blockedUsers.length > 0" class="users-list">
          <div v-for="user in blockedUsers" :key="user._id" class="user-list-item">
            <div class="user-avatar-small">{{ getInitials(user.username || user.name) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.username || user.name }}</div>
              <div class="user-handle">@{{ user.username || 'user' }}</div>
            </div>
            <button class="block-user-btn blocked" @click="toggleBlockUser(user._id, true)">✅ Unblock</button>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>No blocked users! 🎉</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '/src/assets/logo.png'

const router = useRouter()
const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const token = ref(localStorage.getItem('token') || '')

// ✅ Tab navigation
const activeView = computed(() => {
  const path = route.path
  if (path === '/admin') return 'home'
  if (path === '/admin/users') return 'users'
  if (path === '/admin/posts') return 'posts'
  if (path === '/admin/hidden-posts') return 'hidden-posts'
  if (path === '/admin/locked-comments') return 'locked-comments'
  if (path === '/admin/hidden-users') return 'hidden-users'
  if (path === '/profile') return 'profile'
  return 'home'
})

// ✅ Filter posts that have comments LOCKED
const lockedPosts = computed(() => {
  return allPosts.value.filter(post => post.isLocked)
})

const searchUser = ref('')
const allPosts = ref([])
const allUsers = ref([])
const loading = ref(true)

// ✅ Filtered lists
const filteredUsers = computed(() => {
  if (!searchUser.value) return allUsers.value.filter(u => !u.isBlocked)
  return allUsers.value.filter(u => {
    const name = (u.username || u.name || '').toLowerCase()
    return name.includes(searchUser.value.toLowerCase()) && !u.isBlocked
  })
})

const hiddenPosts = computed(() => allPosts.value.filter(p => p.isHidden))
const blockedUsers = computed(() => allUsers.value.filter(u => u.isBlocked))

// ✅ Helpers
const getInitials = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const hours = Math.floor((now - date) / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ✅ Fetch all data
const fetchAllData = async () => {
  loading.value = true
  try {
    const postsRes = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const postsData = await postsRes.json()
    if (postsRes.ok) {
      allPosts.value = postsData.posts || postsData || []
    }
    const usersRes = await fetch(`${API_URL}/users/all`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const usersData = await usersRes.json()
    if (usersRes.ok) {
      allUsers.value = usersData.users || usersData || []
    }
  } catch (err) {
    console.error('Admin dashboard error:', err)
  }
  loading.value = false
}

// ✅ LOCK/UNLOCK — NO SCROLL JUMP!
const toggleLock = async (postId, currentState) => {
  const post = allPosts.value.find(p => p._id === postId);
  if (post) post.isLocked = !post.isLocked;
  try {
    await fetch(`${API_URL}/posts/lock/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    if (post) post.isLocked = currentState;
    alert('Action failed!');
  }
};

// ✅ HIDE/UNHIDE — NO SCROLL JUMP!
const toggleHide = async (postId, currentState) => {
  const post = allPosts.value.find(p => p._id === postId);
  if (post) post.isHidden = !post.isHidden;
  try {
    await fetch(`${API_URL}/posts/hide/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    if (post) post.isHidden = currentState;
    alert('Action failed!');
  }
};

const toggleBlockUser = async (userId, currentState) => {
  alert('Block user route coming soon! 🚀')
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
  else fetchAllData()
})
</script>