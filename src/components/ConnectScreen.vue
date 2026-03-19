<template>
  <div class="connect-screen">
    <div class="connect-box">
      <div class="brand">
        <div class="brand-icon">◈</div>
        <div class="brand-name">MutuBet</div>
      </div>

      <h1>Paris décentralisés<br>sur Ethereum</h1>
      <p>Pariez sur des matchs sportifs sans intermédiaire. Les gains sont distribués automatiquement par le contrat intelligent.</p>

      <div class="features">
        <div class="feature">
          <span class="feature-icon">⛓</span>
          <span>100% on-chain</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🔒</span>
          <span>Sans confiance</span>
        </div>
        <div class="feature">
          <span class="feature-icon">⚡</span>
          <span>Instantané</span>
        </div>
      </div>

      <button class="btn-connect" @click="$emit('connect')">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" class="fox-icon" alt="MetaMask" />
        Connecter MetaMask
      </button>
      <div class="hint">Réseau Sepolia requis</div>
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
  background: #0f1117;
  background-image: radial-gradient(ellipse at 60% 0%, rgba(37, 99, 235, 0.15) 0%, transparent 60%),
                    radial-gradient(ellipse at 20% 100%, rgba(37, 99, 235, 0.08) 0%, transparent 50%);
}

.connect-box {
  text-align: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 52px 48px;
  width: 420px;
  backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
}

.brand-icon {
  font-size: 1.4rem;
  color: #3b82f6;
  line-height: 1;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -0.03em;
}

p {
  color: rgba(255,255,255,0.45);
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 28px;
}

.features {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 99px;
  padding: 5px 12px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.6);
}

.feature-icon { font-size: 0.85rem; }

.btn-connect {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 13px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  margin-bottom: 12px;
}

.btn-connect:hover { background: #1d4ed8; transform: translateY(-1px); }
.btn-connect:active { transform: translateY(0); }

.fox-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.hint {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.25);
}
</style>
