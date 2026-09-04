<template>
  <div class="dashboard-container">
    <aside class="dashboard-sidebar d-none d-md-flex">
      <router-link to="/posts" class="sidebar-logo">
        <img :src="logo" alt="ErnieHub" />
      </router-link>
      <nav class="sidebar-nav">
        <template v-if="!isAdmin">
          <router-link to="/posts" class="nav-item" :class="{ active: currentView === 'home' }">
            <span class="nav-icon">🏠</span> Home
          </router-link>
          <router-link to="/my-posts" class="nav-item" :class="{ active: currentView === 'myposts' }">
            <span class="nav-icon">📋</span> My Posts
          </router-link>
          <router-link to="/create-post" class="nav-item" :class="{ active: currentView === 'create' }">
            <span class="nav-icon">+</span> Create Post
          </router-link>
          <router-link to="/profile" class="nav-item" :class="{ active: currentView === 'profile' }">
            <span class="nav-icon">👤</span> Profile
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

    <nav class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">🏠</span><span>Home</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item">
        <span class="mobile-nav-icon">📋</span><span>My Posts</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-fab-btn">
        <span class="create-icon">+</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item">
        <span class="mobile-nav-icon">👤</span><span>Profile</span>
      </router-link>
      <button @click="logout" class="mobile-nav-item">
        <span class="mobile-nav-icon">➡️</span><span>Logout</span>
      </button>
    </nav>

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
            <img :src="post.imageUrl" alt="Post image" class="post-image" />
          </div>

          <div class="post-actions">
            <button class="action-btn-like" @click="toggleLike(post._id)">
              ❤️ {{ post.likes?.length || 0 }}
            </button>
            <button class="action-btn-comment" @click="toggleCommentInput(post._id)">
              💬 {{ post.comments?.length || 0 }}
            </button>
            <button class="action-btn-share" @click="comingSoon">🔁 Share</button>
          </div>

          <div v-if="showCommentInput[post._id]" class="comment-input-area">
            <textarea
              v-if="!post.isLocked"
              v-model="commentText[post._id]"
              class="comment-textarea"
              placeholder="Write a comment..."
            ></textarea>
            <p v-else class="locked-message">🔒 Comments are locked by Admin.</p>
            <div v-if="!post.isLocked" class="comment-buttons">
              <button class="cancel-btn" @click="showCommentInput[post._id] = false">Cancel</button>
              <button class="submit-btn" @click="submitComment(post._id)">Post Comment</button>
            </div>
          </div>

          <div v-if="post.comments?.length > 0" class="comments-section">
            <div 
              v-for="(comment, idx) in post.comments" 
              :key="idx" 
              class="comment-item"
              v-show="!comment.isHidden"
            >
              <div class="comment-avatar">{{ getInitials(comment.username) }}</div>
              <div class="comment-content-wrapper">
                <div class="comment-header-row">
                  <span class="comment-author-name">{{ comment.username || 'User' }}</span>
                  <span class="comment-dot">·</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="comment-text-body">{{ comment.content }}</p>
              </div>
            </div>
          </div>
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
const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = ref(!!currentUser?.isAdmin)

const currentView = computed(() => {
  const path = route.path
  if (path === '/posts') return 'home'
  if (path === '/my-posts') return 'myposts'
  if (path === '/create-post') return 'create'
  if (path === '/profile') return 'profile'
  return 'home'
})

const posts = ref([])
const loading = ref(true)
const showCommentInput = ref({})
const commentText = ref({})

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

const toggleLike = async (postId) => {
  const post = posts.value.find(p => p._id === postId)
  if (!post) return
  const userId = currentUser._id
  const hasLiked = post.likes?.includes(userId)
  if (hasLiked) {
    post.likes = post.likes.filter(id => id !== userId)
  } else {
    if (!post.likes) post.likes = []
    post.likes.push(userId)
  }
  try {
    await fetch(`${API_URL}/posts/like/${postId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token.value}`, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    alert('Like failed!')
  }
}

const toggleCommentInput = (postId) => {
  showCommentInput.value[postId] = !showCommentInput.value[postId]
}

const submitComment = async (postId) => {
  const text = commentText.value[postId]?.trim()
  if (!text) return
  const tempComment = {
    content: text,
    userId: currentUser._id,
    username: currentUser.username,
    createdAt: new Date().toISOString(),
    isHidden: false
  }
  const post = posts.value.find(p => p._id === postId)
  if (post) {
    if (!post.comments) post.comments = []
    post.comments.push(tempComment)
  }
  commentText.value[postId] = ''
  showCommentInput.value[postId] = false
  try {
    await fetch(`${API_URL}/posts/comment/${postId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    })
  } catch (err) {
    if (post) post.comments.pop()
    alert('Comment failed!')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const comingSoon = () => {
  alert('This feature is coming soon!')
}

onMounted(() => {
  if (!token.value) router.push('/login')
  else fetchPosts()
})
</script>