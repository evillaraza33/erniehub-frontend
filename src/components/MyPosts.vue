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
        <router-link to="/my-posts" class="nav-item active" :class="{ active: currentView === 'myposts' }">
          <span class="nav-icon">📋</span> My Posts
        </router-link>
        <router-link to="/create-post" class="nav-item" :class="{ active: currentView === 'create' }">
          <span class="nav-icon">+</span> Create
        </router-link>
        <a class="nav-item" @click="comingSoon">
          <span class="nav-icon">🔔</span> Notifications
        </a>
        <router-link to="/profile" class="nav-item" :class="{ active: currentView === 'profile' }">
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

    <!-- 📄 RIGHT — My Posts Feed -->
    <main class="dashboard-feed">
      <h1 class="feed-title">My Posts</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-text">Loading your posts...</div>

      <!-- Posts List -->
      <div v-else-if="posts.length > 0" class="posts-list">
        <div v-for="post in posts" :key="post._id" class="post-card">
          <!-- Post Header -->
          <div class="post-header">
            <div class="post-author">
              <div class="post-avatar">{{ getInitials(post.username) }}</div>
              <div class="post-meta">
                <div class="post-author-name">{{ post.username || 'You' }}</div>
                <div class="post-time">{{ formatTime(post.createdAt) }}</div>
              </div>
            </div>
            <!-- ✏️ EDIT & 🗑️ DELETE BUTTONS -->
            <div class="post-owner-actions">
              <button class="edit-btn" @click="editPost(post._id)">✏️ Edit</button>
              <button class="delete-btn" @click="confirmDelete(post._id)">🗑️ Delete</button>
            </div>
          </div>

          <!-- Post Content -->
          <div class="post-content-text">{{ post.content }}</div>

          <!-- 🖼️ Post Image -->
          <div v-if="post.imageUrl" class="post-image-container">
            <img :src="post.imageUrl" alt="Post image" class="post-image" @error="handleImageError" />
          </div>
          <div v-else class="post-image-placeholder">🖼️</div>

          <!-- ✅ Action Buttons: Like • Comment • Share -->
          <div class="post-actions">
            <button class="action-btn-like" @click="toggleLike(post._id)">
              ❤️ {{ post.likes?.length || 0 }} Like
            </button>
            
            <!-- 💬 COMMENT BUTTON + FORM -->
            <button 
              class="action-btn-comment" 
              @click="toggleCommentForm(post._id)"
              :class="{ active: openCommentId === post._id }"
            >
              💬 Comment
            </button>
            
            <button class="action-btn-share" @click="comingSoon">🔁 Share</button>
          </div>

          <!-- ✅ COMMENT FORM — Expands when clicking Comment -->
          <div v-if="openCommentId === post._id" class="comment-form-wrapper">
            <textarea
              v-model="newComment"
              class="comment-textarea"
              placeholder="Write a comment..."
              maxlength="500"
            ></textarea>
            <div class="comment-form-actions">
              <button class="cancel-comment-btn" @click="openCommentId = null">Cancel</button>
              <button class="submit-comment-btn" @click="addComment(post._id)">💬 Post Comment</button>
            </div>
            <p v-if="commentError" class="comment-error">{{ commentError }}</p>
          </div>

          <!-- ✅ EXISTING COMMENTS -->
          <div v-if="post.comments && post.comments.length > 0" class="comments-list">
            <div v-for="(comment, idx) in post.comments" :key="idx" class="comment-item">
              <div class="comment-avatar">{{ getInitials(comment.username) }}</div>
              <div class="comment-content">
                <span class="comment-author">{{ comment.username || 'User' }}</span>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>You haven't created any posts yet! ✍️</p>
        <router-link to="/create-post" class="create-first-post-btn">Create your first post →</router-link>
      </div>
    </main>

    <!-- 📱 MOBILE: Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item" :class="{ active: currentView === 'home' }">
        <span class="mobile-icon">🏠</span>
        <span class="mobile-label">Home</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item active" :class="{ active: currentView === 'myposts' }">
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
      <router-link to="/profile" class="mobile-nav-item" :class="{ active: currentView === 'profile' }">
        <span class="mobile-icon">👤</span>
        <span class="mobile-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '/src/assets/logo.png'

const openCommentId = ref(null)
const newComment = ref('')
const commentError = ref('')

const router = useRouter()
const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const posts = ref([])
const loading = ref(true)
const token = ref(localStorage.getItem('token') || '')

// ✅ TOGGLE COMMENT FORM
const toggleCommentForm = (postId) => {
  if (openCommentId.value === postId) {
    openCommentId.value = null
    newComment.value = ''
  } else {
    openCommentId.value = postId
    newComment.value = ''
    commentError.value = ''
  }
}

// ✅ ADD COMMENT — Matches YOUR backend route!
const addComment = async (postId) => {
  if (!newComment.value.trim()) {
    commentError.value = 'Comment cannot be empty!'
    return
  }

  try {
    const res = await fetch(`${API_URL}/posts/comment/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: newComment.value })
    })

    const data = await res.json()

    if (res.ok) {
      openCommentId.value = null
      newComment.value = ''
      commentError.value = ''
      fetchPosts() // ✅ Refresh to show NEW comment instantly!
    } else {
      commentError.value = data.error || 'Failed to add comment'
    }
  } catch (err) {
    commentError.value = 'Server error. Please try again.'
  }
}

// Highlight "My Posts" in sidebar
const currentView = computed(() => 'myposts')

// Get user initials for avatar
const getInitials = (username) => {
  if (!username) return 'U'
  return username.charAt(0).toUpperCase()
}

// Format timestamp
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const hours = Math.floor((now - date) / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Fetch ONLY MY posts
const fetchMyPosts = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/posts/my-posts`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) {
      posts.value = data.posts || data || []
    }
  } catch (err) {
    console.error('Error fetching your posts:', err)
  }
  loading.value = false
}

// Toggle like
const toggleLike = async (postId) => {
  try {
    await fetch(`${API_URL}/posts/toggleLike/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    fetchMyPosts()
  } catch (err) {
    console.error('Like error:', err)
  }
}

// Edit Post
const editPost = (postId) => {
  router.push(`/edit-post/${postId}`)
}

// Delete Post with Confirmation
// ✅ DELETE POST — Matches your backend route exactly!
const confirmDelete = async (postId) => {
  if (!confirm('⚠️ Are you sure you want to delete this post? This cannot be undone!')) {
    return
  }
  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {  // ✅ Matches /posts/:id
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    if (res.ok) {
      alert('✅ Post deleted successfully!')
      fetchMyPosts() // ✅ Refresh list — post disappears instantly!
    } else {
      const data = await res.json()
      alert(`❌ ${data.error || 'Failed to delete post'}`)
    }
  } catch (err) {
    alert('❌ Server error. Please try again.')
  }
}

// Handle broken image
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// Logout
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
  else fetchMyPosts()
})
</script>