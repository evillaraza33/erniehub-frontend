<template>
  <div class="dashboard-container">
    <!-- 📱 LEFT SIDEBAR -->
    <aside class="dashboard-sidebar d-none d-md-flex">
      <router-link to="/posts" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <!-- 👤 REGULAR USER MENU → Shows when NOT Admin -->
        <template v-if="!isAdmin">
          <router-link to="/posts" class="nav-item" :class="{ active: currentView === 'home' }">
            <span class="nav-icon">🏠</span> Home
          </router-link>
          <router-link to="/my-posts" class="nav-item" :class="{ active: currentView === 'myposts' }">
            <span class="nav-icon">📋</span> My Posts
          </router-link>
          <router-link to="/create-post" class="nav-item" :class="{ active: currentView === 'create' }">
            <span class="nav-icon">➕</span> Create
          </router-link>
          <a class="nav-item" @click="comingSoon">
            <span class="nav-icon">🔔</span> Notifications
          </a>
          <router-link to="/profile" class="nav-item" :class="{ active: currentView === 'profile' }">
            <span class="nav-icon">👤</span> Profile
          </router-link>
        </template>

        <!-- 🛡️ ADMIN MENU → SAME Home link → full comment/like abilities! -->
        <template v-else>
          <router-link to="/posts" class="nav-item" :class="{ active: currentView === 'home' }">
            <span class="nav-icon">🏠</span> Home
          </router-link>
          <router-link to="/admin/users" class="nav-item" :class="{ active: currentView === 'users' }">
            <span class="nav-icon">👥</span> All Users
          </router-link>
          <router-link to="/admin/posts" class="nav-item" :class="{ active: currentView === 'posts' }">
            <span class="nav-icon">📄</span> All Posts
          </router-link>
          <router-link to="/admin/hidden-posts" class="nav-item" :class="{ active: currentView === 'hidden' }">
            <span class="nav-icon">🙈</span> Hidden Posts
          </router-link>
          <router-link to="/admin/locked-comments" class="nav-item" :class="{ active: currentView === 'locked-comments' }">
            <span class="nav-icon">🔒</span> Locked Comments
          </router-link>
          <router-link to="/admin/hidden-users" class="nav-item" :class="{ active: currentView === 'blocked' }">
            <span class="nav-icon">🚫</span> Blocked Users
          </router-link>
        </template>
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

    <!-- 📄 MAIN FEED -->
    <main class="dashboard-feed">
      <h1 class="feed-title">Home</h1>
      <div v-if="loading" class="loading-text">Loading posts...</div>
      <div v-else-if="posts.length === 0" class="empty-state">
        <p>No posts yet. Be the first to post something!</p>
      </div>
      <div v-else class="posts-list">
        <div v-for="post in posts" :key="post._id" class="post-card">
          <div class="post-header">
            <div class="post-author">
              <div class="post-avatar">{{ getInitials(post.username) }}</div>
              <div class="post-meta">
                <div class="post-author-name">{{ post.username }}</div>
                <div class="post-time">{{ formatTime(post.createdAt) }}</div>
              </div>
            </div>
            <span v-if="post.isLocked" class="locked-badge">🔒</span>
          </div>
          <div class="post-content-text">{{ post.content }}</div>
          <div v-if="post.imageUrl" class="post-image-container">
            <img :src="post.imageUrl" alt="Post image" class="post-image" @error="handleImageError" />
          </div>
          <div class="post-actions">
            <button class="action-btn-like" @click="toggleLike(post._id)">
              ❤️ {{ post.likes?.length || 0 }}
            </button>
            <button class="action-btn-comment" @click="toggleCommentForm(post._id, post.isLocked)">
              💬 {{ post.comments?.length || 0 }}
            </button>
            <button class="action-btn-share" @click="comingSoon">🔁 Share</button>
            <!-- Admin quick actions -->
            <div v-if="isAdmin" class="admin-post-actions">
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

          <!-- Comment Input Area -->
          <div v-if="openCommentId === post._id" class="comment-input-area">
            <textarea
              v-if="!post.isLocked"
              v-model="newComment"
              class="comment-textarea"
              placeholder="Write a comment..."
            ></textarea>
            <p v-else class="locked-message">🔒 Comments are locked by Admin.</p>
            <p v-if="commentError" class="error-message">{{ commentError }}</p>
            <div v-if="!post.isLocked" class="comment-buttons">
              <button class="cancel-btn" @click="openCommentId = null; newComment=''; commentError=''">Cancel</button>
              <button class="submit-btn" @click="addComment(post._id)">Post Comment</button>
            </div>
          </div>

          <!-- Comments List -->
          <div v-if="post.comments?.length > 0" class="comments-section">
            <div 
              v-for="(comment, idx) in post.comments" 
              :key="idx" 
              class="comment-item"
              v-show="isAdmin || !comment.isHidden"
            >
              <div class="comment-avatar">{{ getInitials(comment.username) }}</div>
              <div class="comment-content-wrapper">
                <div class="comment-header-row">
                  <span class="comment-author-name">{{ comment.username || 'User' }}</span>
                  <span class="comment-dot">·</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  <button 
                    v-if="isAdmin"
                    class="comment-hide-icon" 
                    @click="toggleCommentVisibility(post._id, idx, comment.isHidden)"
                    :title="comment.isHidden ? '👁️ Unhide Comment' : '🙈 Hide Comment'"
                  >
                    {{ comment.isHidden ? '👁️' : '🙈' }}
                  </button>
                </div>
                <p class="comment-text-body">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 📱 MOBILE BOTTOM NAVIGATION -->
    <nav class="mobile-bottom-nav d-md-none">
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
      <div class="mobile-nav-item more-menu-container" @click="showMoreMenu = !showMoreMenu">
        <span class="mobile-nav-icon">⋯</span>
        <span class="mobile-nav-label">More</span>
        
        <div v-if="showMoreMenu" class="more-dropdown-menu dropdown-up" @click="showMoreMenu = false">
          <router-link to="/profile" class="dropdown-item">👤 Profile</router-link>
          <a class="dropdown-item" @click.stop="comingSoon">⚙️ Settings</a>
          <a class="dropdown-item logout-item" @click.stop="logout">➡️ Logout</a>
        </div>
      </div>
    </nav>
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
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const showMoreMenu = ref(false)

// ✅ Auto-detect Admin!
const isAdmin = computed(() => user.value?.isAdmin === true)

// ✅ Route highlighting
const currentView = computed(() => {
  const path = route.path
  if (path === '/posts') return 'home'
  if (path === '/my-posts') return 'myposts'
  if (path === '/create-post') return 'create'
  if (path.startsWith('/admin')) {
    if (path === '/admin/users') return 'users'
    if (path === '/admin/posts') return 'posts'
    if (path === '/admin/hidden-posts') return 'hidden'
    if (path === '/admin/locked-comments') return 'locked-comments'
    if (path === '/admin/hidden-users') return 'blocked'
  }
  if (path === '/profile') return 'profile'
  return 'home'
})

const posts = ref([])
const loading = ref(true)
const openCommentId = ref(null)
const newComment = ref('')
const commentError = ref('')

// ✅ Lock-aware comment form toggle
const toggleCommentForm = (postId, isLocked) => {
  if (isLocked) {
    commentError.value = '🔒 Comments are locked by Admin'
    return
  }
  openCommentId.value = openCommentId.value === postId ? null : postId
  newComment.value = ''
  commentError.value = ''
}

// ✅ Add comment — instant UI update
const addComment = async (postId) => {
  const post = posts.value.find(p => p._id === postId)
  if (post?.isLocked) {
    commentError.value = '🔒 Comments are locked for this post.'
    return
  }
  if (!newComment.value.trim()) {
    commentError.value = 'Comment cannot be empty!'
    return
  }
  // Optimistic UI update
  const tempComment = {
    _id: 'temp-' + Date.now(),
    username: user.value?.username || 'You',
    content: newComment.value.trim(),
    createdAt: new Date().toISOString(),
    isHidden: false
  }
  if (post) {
    if (!post.comments) post.comments = []
    post.comments.push(tempComment)
  }
  const commentText = newComment.value
  openCommentId.value = null
  newComment.value = ''
  commentError.value = ''
  // Send to server
  try {
    const res = await fetch(`${API_URL}/posts/comment/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: commentText })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add comment')
  } catch (err) {
    // Rollback on error
    if (post) post.comments = post.comments.filter(c => c._id !== tempComment._id)
    commentError.value = err.message || 'Server error. Please try again.'
  }
}

// ✅ Admin: Toggle Lock Comments
const toggleLock = async (postId, currentState) => {
  const post = posts.value.find(p => p._id === postId)
  if (post) post.isLocked = !currentState
  try {
    await fetch(`${API_URL}/posts/lock/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    if (post) post.isLocked = currentState
    alert('Failed to toggle lock!')
  }
}

// ✅ Admin: Toggle Hide Post
const toggleHide = async (postId, currentState) => {
  const post = posts.value.find(p => p._id === postId)
  if (post) post.isHidden = !currentState
  try {
    await fetch(`${API_URL}/posts/hide/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    if (post) post.isHidden = currentState
    alert('Failed to toggle visibility!')
  }
}

// ✅ Admin: Toggle Hide/Unhide Comment
const toggleCommentVisibility = async (postId, commentIndex, currentHidden) => {
  const post = posts.value.find(p => p._id === postId)
  if (!post || !post.comments[commentIndex]) return
  post.comments[commentIndex].isHidden = !currentHidden
  try {
    await fetch(`${API_URL}/posts/toggle-comment-hidden/${postId}/${commentIndex}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    post.comments[commentIndex].isHidden = currentHidden
    alert('Action failed!')
  }
}

// ✅ Handle broken images
const handleImageError = (e) => { e.target.style.display = 'none' }

// ✅ Get initials for avatars
const getInitials = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

// ✅ Format timestamp
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const hours = Math.floor((now - date) / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ✅ Fetch posts
const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) posts.value = data.posts || data || []
  } catch (err) {
    console.error('Error fetching posts:', err)
  }
  loading.value = false
}

// ✅ Toggle Like — instant UI update
const toggleLike = async (postId) => {
  const postIndex = posts.value.findIndex(p => p._id === postId)
  if (postIndex === -1) return
  const post = posts.value[postIndex]
  const hadLiked = post.likes?.includes(user.value?._id)
  if (hadLiked) {
    post.likes = post.likes.filter(id => id !== user.value?._id)
  } else {
    if (!post.likes) post.likes = []
    post.likes.push(user.value?._id)
  }
  try {
    await fetch(`${API_URL}/posts/like/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    fetchPosts()
    console.error('Like error:', err)
  }
}

// ✅ Logout
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
  else fetchPosts()
})
</script>