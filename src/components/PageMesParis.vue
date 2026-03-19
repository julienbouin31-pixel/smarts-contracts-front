<template>
  <div>
    <div class="page-header">
      <h2>Mes paris</h2>
      <span v-if="mesParis.length > 0" class="badge">{{ mesParis.length }} pari{{ mesParis.length > 1 ? 's' : '' }}</span>
    </div>

    <div v-if="mesParis.length > 0" class="stats">
      <div class="stat">
        <div class="stat-label">Total misé</div>
        <div class="stat-value">{{ totalMise.toFixed(4) }}</div>
        <div class="stat-unit">ETH</div>
      </div>
      <div class="stat stat-won">
        <div class="stat-label">Total gagné</div>
        <div class="stat-value">+{{ totalGagne.toFixed(4) }}</div>
        <div class="stat-unit">ETH</div>
      </div>
      <div class="stat stat-lost">
        <div class="stat-label">Total perdu</div>
        <div class="stat-value">-{{ totalPerdu.toFixed(4) }}</div>
        <div class="stat-unit">ETH</div>
      </div>
      <div class="stat" :class="bilan >= 0 ? 'stat-won' : 'stat-lost'">
        <div class="stat-label">Bilan net</div>
        <div class="stat-value">{{ bilan >= 0 ? '+' : '' }}{{ bilan.toFixed(4) }}</div>
        <div class="stat-unit">ETH</div>
      </div>
    </div>

    <div v-if="mesParis.length === 0" class="empty">
      <div class="empty-icon">🎯</div>
      <div>Tu n'as pas encore parié.</div>
    </div>

    <div v-for="p in mesParis" :key="p.idx" class="card">
      <div class="card-head">
        <div>
          <div class="match-title">{{ p.equipeDomicile }} <span class="vs">vs</span> {{ p.equipeExterieur }}</div>
          <div class="match-cat">{{ p.categorie }}</div>
        </div>
        <span :class="['pill', p.estClos ? 'pill-closed' : 'pill-open']">
          {{ p.estClos ? (p.vainqueur === 0 ? 'Match nul' : (p.vainqueur === 1 ? p.equipeDomicile : p.equipeExterieur) + ' gagne') : 'En cours' }}
        </span>
      </div>

      <div class="details">
        <div class="detail-item">
          <span class="detail-label">Équipe choisie</span>
          <span class="detail-value">{{ p.choix === 1 ? p.equipeDomicile : p.choix === 2 ? p.equipeExterieur : 'Match nul' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Mise</span>
          <span class="detail-value">{{ p.mise.toFixed(4) }} ETH</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Résultat</span>
          <span v-if="p.estClos && (p.choix === p.vainqueur || (p.vainqueur === 0 && p.choix === 0))" class="won">Gagné ✓</span>
          <span v-else-if="p.estClos" class="lost">Perdu ✗</span>
          <span v-else class="pending">En attente…</span>
        </div>
      </div>

      <div v-if="p.estClos && (p.choix === p.vainqueur || (p.vainqueur === 0 && p.choix === 0)) && p.miseActuelle > 0" class="gain-row">
        <div>
          <div class="gain-label">Gains disponibles</div>
          <div class="gain-amount">{{ calculerGain(p).toFixed(4) }} ETH</div>
        </div>
        <button class="btn-gain" @click="retirerGains(p.idx)" :disabled="txPending">
          Retirer mes gains
        </button>
      </div>
      <div v-else-if="p.estClos && (p.choix === p.vainqueur || (p.vainqueur === 0 && p.choix === 0)) && p.miseActuelle === 0" class="withdrawn">
        ✓ Gains retirés
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useContract } from '../composables/useContract.js';

const { mesParis, txPending, retirerGains } = useContract();

const calculerGain = (p) => {
  const pot = p.totalMiseA + p.totalMiseB + (p.totalMiseNul ?? 0);
  const gagnants = p.vainqueur === 0
    ? (p.totalMiseNul ?? 0)
    : p.vainqueur === 1 ? p.totalMiseA : p.totalMiseB;
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

h2 { font-size: 1.3rem; font-weight: 700; color: #111; letter-spacing: -0.02em; }

.badge {
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
}

.empty {
  color: #999;
  font-size: 0.9rem;
  padding: 48px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon { font-size: 2rem; }

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.stat {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.stat-won  { border-color: #86efac; background: #f0fdf4; }
.stat-lost { border-color: #fca5a5; background: #fef2f2; }

.stat-label { font-size: 0.7rem; color: #888; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.15rem; font-weight: 700; color: #111; line-height: 1; }
.stat-unit  { font-size: 0.72rem; color: #aaa; margin-top: 2px; }
.stat-won  .stat-value { color: #16a34a; }
.stat-lost .stat-value { color: #dc2626; }

.card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.15s;
}

.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  gap: 10px;
}

.match-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111;
  letter-spacing: -0.01em;
  margin-bottom: 2px;
}

.vs { font-weight: 400; color: #bbb; margin: 0 4px; }
.match-cat { font-size: 0.72rem; color: #999; }

.pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.pill-open   { background: #dcfce7; color: #15803d; }
.pill-closed { background: #f1f3f5; color: #888; }

.details {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.detail-item { display: flex; flex-direction: column; gap: 2px; }
.detail-label { font-size: 0.68rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-value { font-size: 0.88rem; font-weight: 600; color: #111; }

.won     { font-size: 0.85rem; font-weight: 600; color: #16a34a; }
.lost    { font-size: 0.85rem; font-weight: 600; color: #dc2626; }
.pending { font-size: 0.85rem; color: #888; }

.gain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 12px 14px;
  gap: 12px;
  margin-top: 4px;
}

.gain-label  { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.gain-amount { font-size: 1.1rem; font-weight: 700; color: #15803d; }

.btn-gain {
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, transform 0.1s;
}

.btn-gain:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); }
.btn-gain:disabled { opacity: 0.4; cursor: not-allowed; }

.withdrawn { color: #888; font-size: 0.82rem; margin-top: 8px; }
</style>
