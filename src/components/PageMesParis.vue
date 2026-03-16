<template>
  <div>
    <div class="page-header">
      <h2>Mes paris</h2>
    </div>

    <div v-if="mesParis.length === 0" class="empty">Tu n'as pas encore parié.</div>

    <div v-for="p in mesParis" :key="p.idx" class="card">
      <div class="card-head">
        <span class="card-title">{{ p.description }}</span>
        <span :class="['pill', p.estClos ? 'pill-closed' : 'pill-open']">
          {{ p.estClos ? (p.vainqueur === 1 ? 'A gagne' : 'B gagne') : 'En cours' }}
        </span>
      </div>

      <div class="details">
        <span>Équipe choisie : <strong>{{ p.choix === 1 ? 'A' : 'B' }}</strong></span>
        <span>Mise : <strong>{{ p.mise }} pts</strong></span>
        <span v-if="p.estClos && p.choix === p.vainqueur" class="won">Gagné</span>
        <span v-else-if="p.estClos" class="lost">Perdu</span>
        <span v-else class="pending">En attente</span>
      </div>

      <button
        v-if="p.estClos && p.choix === p.vainqueur && p.mise > 0"
        class="btn-gain"
        @click="retirerGains(p.idx)"
        :disabled="txPending"
      >
        Retirer mes gains
      </button>
    </div>
  </div>
</template>

<script setup>
import { useContract } from '../composables/useContract.js';

const { mesParis, txPending, retirerGains } = useContract();
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

.empty {
  color: #999;
  font-size: 0.9rem;
  padding: 12px 0;
}

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

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111;
}

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

.won    { color: #16a34a; font-weight: 600; }
.lost   { color: #dc2626; font-weight: 600; }
.pending { color: #888; }

.btn-gain {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 7px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-gain:hover:not(:disabled) { background: #dcfce7; }
.btn-gain:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
