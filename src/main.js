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
  { path: '/posts', component: Dashboard },           // ✅ Regular user
  { path: '/my-posts', component: MyPosts },
  { path: '/create-post', component: CreatePost },
  { path: '/edit-post/:id', component: EditPost },
  { path: '/profile', component: Profile },            
  
  // ✅ ADMIN ROUTES — NOW POINT TO ADMINDASHBOARD!
  { path: '/admin', component: AdminDashboard },      // ✅ NO REDIRECT!
  { path: '/admin/users', component: AdminDashboard },
  { path: '/admin/posts', component: AdminDashboard },
  { path: '/admin/hidden-posts', component: AdminDashboard },
  { path: '/admin/hidden-users', component: AdminDashboard },
  { path: '/admin/locked-comments', component: AdminDashboard },
  
  { path: '/', redirect: '/posts' }                    // ✅ Default → regular timeline
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')