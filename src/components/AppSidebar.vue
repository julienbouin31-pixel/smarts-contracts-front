<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-icon">◈</div>
      <div class="brand-name">MutuBet</div>
    </div>

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

    <div class="sidebar-footer">
      <div class="wallet-card">
        <div class="wallet-top">
          <div class="wallet-dot"></div>
          <span class="wallet-addr">{{ shortAddr }}</span>
          <button class="btn-refresh" @click="$emit('refresh')" :disabled="loading" title="Actualiser">
            <span :class="{ spin: loading }">↻</span>
          </button>
        </div>
        <div class="wallet-balance">{{ ethBalance }} <span>ETH</span></div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps(['page', 'isAdmin', 'shortAddr', 'ethBalance', 'loading']);
defineEmits(['update:page', 'refresh']);
</script>

<style scoped>
.sidebar {
  width: 210px;
  flex-shrink: 0;
  background: #0f1117;
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  padding: 22px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
  gap: 6px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  margin-bottom: 6px;
}

.brand-icon {
  font-size: 1.1rem;
  color: #3b82f6;
  line-height: 1;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.45);
  font-size: 0.88rem;
  font-weight: 500;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
.nav-item.active {
  background: rgba(59,130,246,0.15);
  color: #60a5fa;
  font-weight: 600;
}

.sidebar-footer { margin-top: auto; }

.wallet-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px 14px;
}

.wallet-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.wallet-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 5px #22c55e;
}

.wallet-addr {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  font-family: monospace;
  flex: 1;
}

.wallet-balance {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.wallet-balance span {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  font-weight: 400;
  margin-left: 2px;
}

.btn-refresh {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
  transition: color 0.12s;
}

.btn-refresh:hover:not(:disabled) { color: rgba(255,255,255,0.7); }
.spin { display: inline-block; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
