<template>
  <aside class="sidebar">
    <div class="logo">PMD</div>

    <nav>
      <button :class="['nav-item', { active: page === 'matchs' }]" @click="$emit('update:page', 'matchs')">
        Matchs
      </button>
      <button :class="['nav-item', { active: page === 'mesParis' }]" @click="$emit('update:page', 'mesParis')">
        Mes paris
      </button>
      <button v-if="isAdmin" :class="['nav-item', { active: page === 'admin' }]" @click="$emit('update:page', 'admin')">
        Admin
      </button>
    </nav>

    <div class="footer">
      <div class="wallet">
        <div class="wallet-dot"></div>
        <div>
          <div class="addr">{{ shortAddr }}</div>
          <div class="bal">{{ points }} pts</div>
          <div class="eth">{{ ethBalance }} ETH</div>
        </div>
      </div>
      <button class="btn-refresh" @click="$emit('refresh')" :disabled="loading" :title="loading ? 'Chargement…' : 'Actualiser'">
        <span :class="{ spin: loading }">↻</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps(['page', 'isAdmin', 'shortAddr', 'points', 'ethBalance', 'loading']);
defineEmits(['update:page', 'refresh']);
</script>

<style scoped>
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e2e4e8;
  display: flex;
  flex-direction: column;
  padding: 24px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.logo {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 28px;
  padding-left: 6px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 9px 10px;
  border-radius: 7px;
  cursor: pointer;
}

.nav-item:hover {
  background: #f0f2f5;
  color: #111;
}

.nav-item.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f6f8;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 12px;
}

.wallet {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wallet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}

.addr {
  font-size: 0.7rem;
  color: #888;
  font-family: monospace;
}

.bal {
  font-size: 0.85rem;
  font-weight: 700;
  color: #111;
}

.eth {
  font-size: 0.72rem;
  color: #888;
}

.btn-refresh {
  background: transparent;
  border: none;
  color: #aaa;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}

.btn-refresh:hover:not(:disabled) {
  color: #555;
}

.spin {
  display: inline-block;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
