<template>
  <div class="connect-screen">
    <div class="connect-box">
      <div class="logo">MB</div>
      <h1>MutuBet</h1>
      <p>Plateforme de paris décentralisée</p>
      <button class="btn-primary" @click="$emit('connect')">
        🦊 Connecter MetaMask
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['connect']);
</script>

<style scoped>
.connect-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
}

.connect-box {
  text-align: center;
  background: #fff;
  border: 1px solid #e2e4e8;
  border-radius: 12px;
  padding: 48px 40px;
  width: 340px;
}

.logo {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: #888;
  margin-bottom: 20px;
  font-weight: 600;
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111;
}

p {
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 28px;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 11px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
