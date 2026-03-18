<template>
  <div>
    <div class="page-header">
      <h2>Mes paris</h2>
    </div>

    <!-- Résumé -->
    <div v-if="mesParis.length > 0" class="stats">
      <div class="stat">
        <div class="stat-label">Total misé</div>
        <div class="stat-value">{{ totalMise.toFixed(4) }} ETH</div>
      </div>
      <div class="stat stat-won">
        <div class="stat-label">Total gagné</div>
        <div class="stat-value">+{{ totalGagne.toFixed(4) }} ETH</div>
      </div>
      <div class="stat stat-lost">
        <div class="stat-label">Total perdu</div>
        <div class="stat-value">-{{ totalPerdu.toFixed(4) }} ETH</div>
      </div>
      <div class="stat" :class="bilan >= 0 ? 'stat-won' : 'stat-lost'">
        <div class="stat-label">Bilan net</div>
        <div class="stat-value">{{ bilan >= 0 ? '+' : '' }}{{ bilan.toFixed(4) }} ETH</div>
      </div>
    </div>

    <div v-if="mesParis.length === 0" class="empty">Tu n'as pas encore parié.</div>

    <div v-for="p in mesParis" :key="p.idx" class="card">
      <div class="card-head">
        <span class="card-title">{{ p.equipeDomicile }} vs {{ p.equipeExterieur }}</span>
        <span :class="['pill', p.estClos ? 'pill-closed' : 'pill-open']">
          {{ p.estClos ? (p.vainqueur === 1 ? p.equipeDomicile : p.equipeExterieur) + ' gagne' : 'En cours' }}
        </span>
      </div>

      <div class="details">
        <span>Équipe choisie : <strong>{{ p.choix === 1 ? p.equipeDomicile : p.equipeExterieur }}</strong></span>
        <span>Mise : <strong>{{ p.mise.toFixed(4) }} ETH</strong></span>
        <span v-if="p.estClos && p.choix === p.vainqueur" class="won">Gagné</span>
        <span v-else-if="p.estClos" class="lost">Perdu</span>
        <span v-else class="pending">En attente</span>
      </div>

      <div v-if="p.estClos && p.choix === p.vainqueur && p.miseActuelle > 0" class="gain-row">
        <span class="gain-label">Gains : <strong>{{ calculerGain(p).toFixed(4) }} ETH</strong></span>
        <button class="btn-gain" @click="retirerGains(p.idx)" :disabled="txPending">
          Retirer mes gains
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useContract } from '../composables/useContract.js';

const { mesParis, txPending, retirerGains } = useContract();

const calculerGain = (p) => {
  const pot = p.totalMiseA + p.totalMiseB;
  const gagnants = p.vainqueur === 1 ? p.totalMiseA : p.totalMiseB;
  return gagnants > 0 ? (p.mise * pot) / gagnants * 0.9 : 0;
};

const totalMise   = computed(() => mesParis.value.reduce((s, p) => s + p.mise, 0));
const totalGagne  = computed(() => mesParis.value.filter(p => p.estClos && p.choix === p.vainqueur).reduce((s, p) => s + calculerGain(p), 0));
const totalPerdu  = computed(() => mesParis.value.filter(p => p.estClos && p.choix !== p.vainqueur).reduce((s, p) => s + p.mise, 0));
const bilan       = computed(() => totalGagne.value - totalMise.value);
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

h2 { font-size: 1.2rem; font-weight: 700; color: #111; }
.empty { color: #999; font-size: 0.9rem; padding: 12px 0; }

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.stat {
  background: #fff;
  border: 1px solid #e2e4e8;
  border-radius: 10px;
  padding: 14px 16px;
}

.stat-won { border-color: #86efac; background: #f0fdf4; }
.stat-lost { border-color: #fca5a5; background: #fef2f2; }

.stat-label { font-size: 0.72rem; color: #888; margin-bottom: 4px; }
.stat-value { font-size: 1rem; font-weight: 700; color: #111; }
.stat-won .stat-value { color: #16a34a; }
.stat-lost .stat-value { color: #dc2626; }

.card {
  background: #fff;
  border: 1px solid #e2e4e8;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 12px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.card-title { font-weight: 600; font-size: 0.95rem; color: #111; }

.pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

.pill-open   { background: #dcfce7; color: #16a34a; }
.pill-closed { background: #f1f3f5; color: #888; }

.details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: #555;
  margin-bottom: 10px;
}

.details strong { color: #111; }
.won     { color: #16a34a; font-weight: 600; }
.lost    { color: #dc2626; font-weight: 600; }
.pending { color: #888; }

.gain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 7px;
  padding: 8px 12px;
  gap: 12px;
}

.gain-label {
  font-size: 0.88rem;
  color: #15803d;
}

.btn-gain {
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 14px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-gain:hover:not(:disabled) { background: #15803d; }
.btn-gain:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
