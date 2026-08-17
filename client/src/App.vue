<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style>
:root {
  --primary: #4f46e5;
  --success: #16a34a;
  --danger: #dc2626;
  --bg: #f3f4f6;
  --card: #ffffff;
  --text: #1f2937;
}
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.app-container {
  width: 100%;
  max-width: 480px;
  background: var(--card);
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}
button {
  width: 100%;
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 12px 16px;
  font-size: 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  margin-top: 10px;
}
button:hover { opacity: 0.9; }
button.secondary { background-color: #4b5563; }
button.success { background-color: var(--success); }
button.danger { background-color: var(--danger); }
input, select {
  width: 100%;
  padding: 10px;
  margin: 8px 0 15px 0;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
}
label { font-weight: 600; font-size: 0.9rem; }
h2 { text-align: center; color: var(--primary); margin-top: 0;}
</style>