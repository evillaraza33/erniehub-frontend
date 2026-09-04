<template>
  <div class="login-container"> <!-- ✅ CHANGED: Same container as Login -->
    <!-- LEFT SIDE — Registration Form (✅ UNCHANGED!) -->
    <div class="login-form-section"> <!-- ✅ CHANGED: Same class as Login -->
      <div class="form-wrapper">
        <router-link to="/login" class="app-logo">
          <img src="/src/assets/logo.png" alt="Logo" />
        </router-link>
        <h1 class="form-title">Create your account</h1>
        <p class="form-subtitle">Join the conversation!</p>
        <form @submit.prevent="register" class="login-form"> <!-- ✅ CHANGED: Same form class -->
          <input
            v-model="username"
            type="text"
            class="form-input"
            placeholder="Username"
            required
          />
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
          <button type="submit" class="submit-btn">
            Sign Up →
          </button>
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="message" class="success-message">{{ message }}</p>
        </form>
        <p class="register-link"> <!-- ✅ CHANGED: Same link class -->
          Already have an account?
          <router-link to="/login"> Login</router-link>
        </p>
      </div>
    </div>

    <!-- ✅ RIGHT SIDE — NOW EXACTLY MATCHES LOGIN PAGE! -->
    <div class="login-hero-section">
      <div class="hero-image-bg"></div> <!-- ✅ Background image overlay -->
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

const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const message = ref('')
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const register = async () => {
  try {
    error.value = ''
    message.value = ''
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })
    const data = await res.json()
    if (res.ok) {
      message.value = 'Account created successfully! Redirecting to Login...'
      setTimeout(() => router.push('/login'), 2000)
    } else {
      error.value = data.error || 'Registration failed'
    }
  } catch (err) {
    error.value = 'Server error. Please try again.'
  }
}
</script>