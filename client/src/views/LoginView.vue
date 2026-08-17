<template>
  <div>
    <h2>FCDBB Điểm Danh</h2>
    <form @submit.prevent="handleLogin">
      <label>Tài khoản (Tên viết liền không dấu):</label>
      <input type="text" v-model="username" placeholder="VD: lunu" required>
      
      <label>Mật khẩu (Ngày sinh DDMMYYYY):</label>
      <input type="password" v-model="password" placeholder="VD: 01012000" required>
      
      <button type="submit">Đăng Nhập</button>
      <p v-if="errorMsg" style="color: red; text-align: center; margin-top: 10px;">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('username', username.value.toLowerCase())
    .eq('password', password.value)
    .single()

  if (error || !data) {
    errorMsg.value = 'Sai tài khoản hoặc mật khẩu!'
    return
  }

  // Lưu user vào localStorage
  localStorage.setItem('fcdbb_user', JSON.stringify(data))
  
  if (data.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/checkin')
  }
}
</script>