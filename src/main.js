import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import App from './App.vue'
import Register from './components/Register.vue'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'   
import CreatePost from './components/CreatePost.vue'
import MyPosts from './components/MyPosts.vue'
import EditPost from './components/EditPost.vue'
import Profile from './components/Profile.vue' 
import AdminDashboard from './components/AdminDashboard.vue'

const routes = [
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  
  // 👤 REGULAR USER routes → load Dashboard.vue
  { path: '/posts', component: Dashboard },
  { path: '/my-posts', component: MyPosts },
  { path: '/create-post', component: CreatePost },
  { path: '/edit-post/:id', component: EditPost },
  { path: '/profile', component: Profile },
  
  // 🛡️ ADMIN routes → load AdminDashboard.vue
  { path: '/admin', component: AdminDashboard },
  { path: '/admin/users', component: AdminDashboard },
  { path: '/admin/posts', component: AdminDashboard },
  { path: '/admin/hidden-posts', component: AdminDashboard },
  { path: '/admin/locked-comments', component: AdminDashboard },
  { path: '/admin/hidden-users', component: AdminDashboard }, // ✅ KEPT ONCE!

  // 🏠 Redirects
  { path: '/', redirect: '/posts' },
  { path: '/:pathMatch(.*)*', redirect: '/posts' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')