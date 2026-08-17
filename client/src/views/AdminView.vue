<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>Quản Trị Admin</h2>
      <button @click="logout" class="secondary" style="width: auto; padding: 6px 12px; margin: 0;">Đăng xuất</button>
    </div>

    <!-- KHU VỰC THÊM SÂN BÓNG -->
    <div style="background: #fdf2f8; padding: 12px; border-radius: 8px; margin: 15px 0;">
      <h4 style="margin: 0 0 8px 0; color: #db2777;">Thêm Địa Điểm Mới</h4>
      <input type="text" v-model="newLoc.name" placeholder="Tên sân bóng...">
      <div style="display: flex; gap: 8px;">
        <input type="number" v-model="newLoc.lat" placeholder="Vĩ độ (Lat)">
        <input type="number" v-model="newLoc.lng" placeholder="Kinh độ (Lng)">
      </div>
      <button class="secondary" @click="getAdminGPS" style="font-size: 0.85rem; padding: 8px; margin-top: 0;">Lấy tọa độ hiện tại</button>
      <input type="number" v-model="newLoc.radius" placeholder="Bán kính (mét) VD: 50">
      <button @click="addLocation">➕ Thêm Sân Bóng</button>
    </div>

    <!-- DANH SÁCH SÂN -->
    <h3>Các sân đã tạo</h3>
    <div style="max-height: 150px; overflow-y: auto; margin-bottom: 20px;">
      <div v-for="loc in locations" :key="loc.id" style="display:flex; justify-content:space-between; background:#fff; padding:6px; border:1px solid #ddd; margin-bottom:4px; border-radius:4px; font-size:0.85rem;">
        <span><b>{{ loc.name }}</b> ({{ loc.radius }}m)</span>
        <button @click="deleteLocation(loc.id)" class="danger" style="width: auto; padding: 2px 6px; margin:0;">Xóa</button>
      </div>
    </div>

    <!-- LỊCH SỬ ĐIỂM DANH -->
    <h3>📋 Lịch sử Điểm Danh</h3>
    <div style="max-height: 250px; overflow-y: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
        <thead>
          <tr style="background: #e2e8f0;">
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Cầu thủ</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Sân</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in checkins" :key="log.id">
            <td style="padding: 8px; border: 1px solid #cbd5e1;"><b>{{ log.players?.full_name }}</b></td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ log.locations?.name }}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{{ new Date(log.checkin_time).toLocaleTimeString('vi-VN') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const locations = ref([])
const checkins = ref([])
const newLoc = ref({ name: '', lat: null, lng: null, radius: 50 })

const fetchData = async () => {
  // Lấy danh sách sân
  const { data: locs } = await supabase.from('locations').select('*').order('id', { ascending: false })
  locations.value = locs || []

  // Lấy lịch sử 
  const { data: logs } = await supabase
    .from('checkins')
    .select(`
      id, 
      checkin_time, 
      players (full_name), 
      locations (name)
    `)
    .order('checkin_time', { ascending: false })
  checkins.value = logs || []
}

onMounted(() => {
  fetchData()
})

const logout = () => {
  localStorage.removeItem('fcdbb_user')
  router.push('/login')
}

const getAdminGPS = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      newLoc.value.lat = pos.coords.latitude
      newLoc.value.lng = pos.coords.longitude
    })
  } else {
    alert('Không hỗ trợ GPS')
  }
}

const addLocation = async () => {
  if (!newLoc.value.name || !newLoc.value.lat || !newLoc.value.lng) return alert('Điền đủ thông tin!')
  await supabase.from('locations').insert([newLoc.value])
  newLoc.value = { name: '', lat: null, lng: null, radius: 50 }
  fetchData()
}

const deleteLocation = async (id) => {
  if (confirm('Xóa sân này? Lịch sử điểm danh tại sân này cũng sẽ bị lỗi hiển thị.')) {
    await supabase.from('locations').delete().eq('id', id)
    fetchData()
  }
}
</script>