<template>
  <div class="login-container">
    <!-- LEFT SIDE — Login Form -->
    <div class="login-form-section">
      <div class="form-wrapper">
        <!-- Logo — Same top-left position -->
        <router-link to="/register" class="app-logo">
          <img :src="logo" alt="ErnieHub" />
        </router-link>
        <h1 class="form-title">Welcome back!</h1>
        <p class="form-subtitle">Login to continue</p>
        <form @submit.prevent="login" class="login-form">
          <input
            v-model="email"
            type="email"
            class="form-input"
            placeholder="Email"
            required
          />
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Password"
              required
            />
            <button type="button" class="eye-icon" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '🙈' }}
            </button>
          </div>
          <router-link to="#" class="forgot-link">Forgot password?</router-link>
          <button type="submit" class="submit-btn">
            Login
          </button>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
        <p class="register-link">
          Don't have an account?
          <router-link to="/register"> Register</router-link>
        </p>
      </div>
    </div>
    <!-- ✅ RIGHT SIDE — Hero Section -->
    <div class="login-hero-section">
      <div class="hero-image-bg"></div>
      <div class="hero-content">
        <h2 class="hero-title">A space for everyone to share, connect, and be heard.</h2>
        <p class="hero-subtitle">
          Your next great connection is just one post away.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '/src/assets/logo.png'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const login = async () => {
  try {
    error.value = ''
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // ✅ ADMIN CHECK — THIS IS THE ONLY PART I CHANGED!
      const user = data.user
      if (user?.isAdmin) {
        router.push('/admin')    // 🛡️ Admin → Admin Dashboard!
      } else {
        router.push('/posts')    // 👤 Regular user → Regular Dashboard
      }
      
    } else {
      error.value = data.error || 'Invalid email or password'
    }
  } catch (err) {
    error.value = 'Server error. Please try again.'
  }
}
</script>