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
           <span class="nav-icon">+</span> Create
         </router-link>
         <a class="nav-item" @click="comingSoon">
           <span class="nav-icon">🔔</span> Notifications
         </a>
         <router-link to="/profile" class="nav-item" :class="{ active: currentView === 'profile' }">
           <span class="nav-icon">👤</span> Profile
         </router-link>
       </template>

       <!-- 🛡️ ADMIN MENU → CLEANED UP! NO DUPLICATE HOME! -->
       <template v-else>
         <!-- ✅ SAME "Home" link as regular users → FULL COMMENT/LIKE ABILITIES! -->
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

    <!-- 📄 RIGHT — Posts Feed -->
    <main class="dashboard-feed">
      <h1 class="feed-title">{{ isAdmin ? 'Admin Timeline' : 'Timeline' }}</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-text">Loading posts...</div>
      
      <!-- Posts List -->
      <div v-else-if="posts.length > 0" class="posts-list">
        <div v-for="post in posts" :key="post._id" class="post-card">
          <!-- ✅ Post Header WITH ADMIN BUTTONS -->
          <div class="post-header">
            <div class="post-author">
              <div class="post-avatar">{{ getInitials(post.username) }}</div>
              <div class="post-meta">
                <div class="post-author-name">{{ post.username || 'User' }}</div>
                <div class="post-time">{{ formatTime(post.createdAt) }}</div>
              </div>
            </div>
            <!-- ✅ ADMIN ONLY: Lock & Hide Buttons on EVERY POST! -->
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
          <!-- ✅ ADMIN STATUS BADGES -->
          <div v-if="isAdmin && (post.isLocked || post.isHidden)" class="admin-status-badges">
            <span v-if="post.isLocked" class="badge-locked">🔒 Comments Locked</span>
            <span v-if="post.isHidden" class="badge-hidden">🙈 Hidden from Public</span>
          </div>
          
          <!-- Post Content -->
          <div class="post-content-text">{{ post.content }}</div>
          
          <!-- 🖼️ Post Image -->
          <div v-if="post.imageUrl" class="post-image-container">
            <img :src="post.imageUrl" alt="Post image" class="post-image" @error="handleImageError" />
          </div>
          <div v-else class="post-image-placeholder">🖼️</div>
          
          <!-- ✅ Action Buttons: Like • Comment • Share → LOCK-AWARE! -->
          <div class="post-actions">
            <button class="action-btn-like" @click="toggleLike(post._id)">
              ❤️ {{ post.likes?.length || 0 }} Like
            </button>
            
            <!-- 💬 COMMENT BUTTON → LOCK DETECTED! -->
            <button 
              class="action-btn-comment" 
              @click="toggleCommentForm(post._id, post.isLocked)"
              :class="{ active: openCommentId === post._id, locked: post.isLocked }"
              :disabled="post.isLocked"
            >
              {{ post.isLocked ? '🔒 Comment Locked' : '💬 Comment' }}
            </button>
            
            <button class="action-btn-share" @click="comingSoon">🔁 Share</button>
          </div>
          
          <!-- ✅ COMMENT FORM → HIDDEN WHEN LOCKED! -->
          <div v-if="openCommentId === post._id && !post.isLocked" class="comment-form-wrapper">
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
          
          <!-- ✅ LOCKED MESSAGE → SHOWS INSTEAD OF FORM -->
          <div v-if="openCommentId === post._id && post.isLocked" class="comment-form-wrapper">
            <p class="locked-message">🔒 Comments are locked for this post.</p>
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
        <p>No posts yet. Be the first to share something! ✨</p>
      </div>
    </main>
    <!-- ======================================
         📱 MOBILE BOTTOM NAVIGATION — ONLY ON SMALL SCREENS
         ====================================== -->
    <nav class="mobile-bottom-nav d-md-none">
      <router-link to="/posts" class="mobile-nav-item" :class="{ active: currentView === 'home' }">
        <span class="mobile-nav-icon">🏠</span>
        <span class="mobile-nav-label">Home</span>
      </router-link>
      <router-link to="/my-posts" class="mobile-nav-item" :class="{ active: currentView === 'myposts' }">
        <span class="mobile-nav-icon">📋</span>
        <span class="mobile-nav-label">My Posts</span>
      </router-link>
      <router-link to="/create-post" class="mobile-nav-item create-btn">
        <span class="mobile-nav-icon">+</span>
      </router-link>
      <a class="mobile-nav-item" @click="comingSoon">
        <span class="mobile-nav-icon">🔔</span>
        <span class="mobile-nav-label">Alerts</span>
      </a>
      <router-link to="/profile" class="mobile-nav-item" :class="{ active: currentView === 'profile' }">
        <span class="mobile-nav-icon">👤</span>
        <span class="mobile-nav-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '/src/assets/logo.png'
const router = useRouter()
const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const token = ref(localStorage.getItem('token') || '')
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

// ✅ Auto-detect Admin!
const isAdmin = computed(() => {
  return user.value?.isAdmin === true
})

const posts = ref([])
const loading = ref(true)
const openCommentId = ref(null)
const newComment = ref('')
const commentError = ref('')

// ✅ UPDATED: "admin-home" → "home" so Home link highlights correctly!
const currentView = computed(() => {
  const path = route.path
  if (path === '/posts') return 'home'
  if (path === '/my-posts') return 'myposts'
  if (path === '/create-post') return 'create'
  if (path === '/profile') return 'profile'
  if (path.startsWith('/admin')) {
    if (path === '/admin/users') return 'users'
    if (path === '/admin/posts') return 'posts'
    if (path === '/admin/hidden-posts') return 'hidden'
    if (path === '/admin/locked-comments') return 'locked-comments'
    if (path === '/admin/hidden-users') return 'blocked'
  }
  return 'home'
})

// ✅ BLOCK opening if locked!
const toggleCommentForm = (postId, isLocked) => {
  if (isLocked) {
    commentError.value = '🔒 Comments are locked by Admin'
    return
  }
  if (openCommentId.value === postId) {
    openCommentId.value = null
    newComment.value = ''
  } else {
    openCommentId.value = postId
    newComment.value = ''
    commentError.value = ''
  }
}

// ✅ Double-check lock BEFORE sending!
// ✅ ADD COMMENT — NO SCROLL JUMP! Instantly adds comment locally!
const addComment = async (postId) => {
  const post = posts.value.find(p => p._id === postId);
  
  // ✅ Double-check lock BEFORE sending
  if (post?.isLocked) {
    commentError.value = '🔒 Comments are locked for this post.';
    return;
  }
  if (!newComment.value.trim()) {
    commentError.value = 'Comment cannot be empty!';
    return;
  }

  // ✅ Build NEW comment — show it INSTANTLY before server responds!
  const tempComment = {
    _id: 'temp-' + Date.now(), // fake ID temporarily
    username: user.value?.username || 'You',
    content: newComment.value.trim(),
    createdAt: new Date().toISOString()
  };

  // ✅ INSTANTLY add to UI — NO WAITING!
  if (post) {
    if (!post.comments) post.comments = [];
    post.comments.push(tempComment); // ✅ Appears IMMEDIATELY!
  }

  // ✅ Clear form & close it
  const commentText = newComment.value;
  openCommentId.value = null;
  newComment.value = '';
  commentError.value = '';

  // ✅ Send to server in BACKGROUND — NO reload!
  try {
    const res = await fetch(`${API_URL}/posts/comment/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: commentText })
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add comment');
    }
    // ✅ Server saved it — NO NEED TO RELOAD!
    
  } catch (err) {
    // ❌ If server fails — REMOVE the temp comment!
    if (post) {
      post.comments = post.comments.filter(c => c._id !== tempComment._id);
    }
    commentError.value = err.message || 'Server error. Please try again.';
    // Optionally re-open form
    openCommentId.value = postId;
    newComment.value = commentText;
  }
};

// ✅ ADMIN: Toggle Lock Comments
const toggleLock = async (postId, currentState) => {
  try {
    const res = await fetch(`${API_URL}/posts/lock/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    if (res.ok) {
      fetchPosts()
    } else {
      alert('Failed to toggle lock!')
    }
  } catch (err) {
    alert('Server error!')
  }
}

// ✅ ADMIN: Toggle Hide Post
const toggleHide = async (postId, currentState) => {
  try {
    const res = await fetch(`${API_URL}/posts/hide/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    })
    if (res.ok) {
      fetchPosts()
    } else {
      alert('Failed to toggle visibility!')
    }
  } catch (err) {
    alert('Server error!')
  }
}

// Handle broken image links
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
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

// Fetch posts
const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/posts/timeline`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) {
      posts.value = data.posts || data || []
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
  }
  loading.value = false
}

// Toggle like
// ✅ LIKE — NO PAGE JUMP! Update locally instead of reloading everything!
const toggleLike = async (postId) => {
  // 🔍 Find the post we clicked
  const postIndex = posts.value.findIndex(p => p._id === postId);
  if (postIndex === -1) return;

  // ✅ OPTIMISTIC UPDATE: Change count IMMEDIATELY (no wait!)
  const post = posts.value[postIndex];
  const hadLiked = post.likes?.includes(user.value?._id); // Check if already liked

  if (hadLiked) {
    // ❌ Unlike — remove my ID, decrease count
    post.likes = post.likes.filter(id => id !== user.value?._id);
  } else {
    // ❤️ Like — add my ID, increase count
    if (!post.likes) post.likes = [];
    post.likes.push(user.value?._id);
  }

  // ✅ Send to server in BACKGROUND — NO loading/spinner
  try {
    await fetch(`${API_URL}/posts/like/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    });
    // ✅ Server confirmed — NO NEED TO REFRESH!
  } catch (err) {
    // ❌ If server fails — REVERT the local change!
    fetchPosts(); // Only full reload on error
    console.error('Like error:', err);
  }
};

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
  const storedUser = localStorage.getItem('user')
  if (storedUser) user.value = JSON.parse(storedUser)
  if (!token.value) router.push('/login')
  else fetchPosts()
})
</script>