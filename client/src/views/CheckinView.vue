<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Xin chào, {{ user.full_name }}!</h2>
      <button @click="logout" class="secondary" style="width: auto; padding: 6px 12px; margin: 0;">Đăng xuất</button>
    </div>

    <div class="info-box">
      <strong>🕒 Thời gian:</strong> {{ currentTime }}
    </div>

    <label>Chọn Sân/Địa điểm Điểm Danh:</label>
    <select v-model="selectedLocationId">
      <option v-for="loc in locations" :key="loc.id" :value="loc.id">
        {{ loc.name }} (Bán kính: {{ loc.radius }}m)
      </option>
    </select>

    <button class="success" @click="processCheckin" :disabled="loading">
      {{ loading ? 'Đang kiểm tra vị trí...' : '📍 Gửi Điểm Danh' }}
    </button>

    <div v-if="resultMessage" :class="['info-box', isSuccess ? 'success-box' : 'danger-box']">
      <span v-html="resultMessage"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('fcdbb_user'))
const locations = ref([])
const selectedLocationId = ref(null)
const currentTime = ref('')
const loading = ref(false)
const resultMessage = ref('')
const isSuccess = ref(false)
let timer = null

const fetchLocations = async () => {
  const { data } = await supabase.from('locations').select('*')
  locations.value = data || []
  if (locations.value.length > 0) selectedLocationId.value = locations.value[0].id
}

const updateClock = () => {
  currentTime.value = new Date().toLocaleString('vi-VN', { hour12: false })
}

onMounted(() => {
  if(!user) return router.push('/login')
  fetchLocations()
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => clearInterval(timer))

const logout = () => {
  localStorage.removeItem('fcdbb_user')
  router.push('/login')
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const processCheckin = () => {
  if (!selectedLocationId.value) return alert('Chưa chọn địa điểm!')
  if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ GPS.')

  loading.value = true
  resultMessage.value = ''

  const targetLoc = locations.value.find(l => l.id === selectedLocationId.value)

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const distance = calculateDistance(position.coords.latitude, position.coords.longitude, targetLoc.lat, targetLoc.lng)
      const distRounded = Math.round(distance)

      if (distRounded <= targetLoc.radius) {
        const { error } = await supabase.from('checkins').insert([{
          player_id: user.id,
          location_id: targetLoc.id,
          distance: distRounded
        }])

        if (!error) {
          isSuccess.value = true
          resultMessage.value = `✅ <b>Điểm danh thành công!</b><br>Sân: ${targetLoc.name}<br>Sai số: ${distRounded}m`
        } else {
          isSuccess.value = false
          resultMessage.value = `❌ Lỗi hệ thống: ${error.message}`
        }
      } else {
        isSuccess.value = false
        resultMessage.value = `❌ <b>Thất bại!</b><br>Bạn cách sân ${distRounded}m (Cho phép: ${targetLoc.radius}m). Hãy vào sân!`
      }
      loading.value = false
    },
    (err) => {
      loading.value = false
      isSuccess.value = false
      resultMessage.value = '❌ Lỗi GPS. Hãy bật vị trí trên điện thoại/trình duyệt.'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}
</script>

<style scoped>
.info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin: 15px 0; }
.success-box { background: #dcfce7; border-color: #86efac; color: #166534; }
.danger-box { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
</style>