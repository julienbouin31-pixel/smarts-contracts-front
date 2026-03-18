<template>
  <div>
    <div class="page-header">
      <h2>Admin</h2>
      <span class="badge-admin">Admin</span>
    </div>

    <!-- Commissions -->
    <div class="card card-commissions">
      <div class="section-title">Commissions totales</div>
      <div class="commission-value">{{ totalCommissions.toFixed(4) }} ETH</div>
      <div class="commission-detail">10% sur {{ matchsClos.length }} match{{ matchsClos.length > 1 ? 's' : '' }} clos</div>
    </div>

    <!-- Créer un match -->
    <div class="card">
      <div class="section-title">Créer un match</div>
      <div class="row">
        <select v-model="newMatchCategorie" class="sel">
          <option>Football</option>
          <option>Tennis</option>
          <option>Basketball</option>
          <option>Rugby</option>
          <option>Baseball</option>
        </select>
        <input v-model="newMatchDomicile" placeholder="Équipe domicile" class="inp-wide" />
        <input v-model="newMatchExterieur" placeholder="Équipe extérieur" class="inp-wide" />
        <button class="btn" @click="creerMatch" :disabled="txPending">Créer</button>
      </div>
    </div>

    <!-- Clore un match -->
    <div class="card">
      <div class="section-title">Clore un match</div>
      <div v-if="matchsOuverts.length === 0" class="empty">Aucun match ouvert.</div>
      <div v-else class="row">
        <select v-model="cloreMatchId" class="sel">
          <option v-for="m in matchsOuverts" :key="m.idx" :value="m.idx">
            #{{ m.idx }} — {{ m.equipeDomicile }} vs {{ m.equipeExterieur }}
          </option>
        </select>
        <select v-model="cloreVainqueur" class="sel">
          <option :value="1">{{ matchsOuverts.find(m => m.idx === cloreMatchId)?.equipeDomicile ?? 'Domicile' }} gagne</option>
          <option :value="2">{{ matchsOuverts.find(m => m.idx === cloreMatchId)?.equipeExterieur ?? 'Extérieur' }} gagne</option>
        </select>
        <button class="btn btn-danger" @click="cloreMatch" :disabled="txPending">Clore</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useContract } from '../composables/useContract.js';

const {
  matchs, newMatchDomicile, newMatchExterieur, newMatchCategorie, cloreMatchId, cloreVainqueur,
  matchsOuverts, txPending,
  creerMatch, cloreMatch,
} = useContract();

const matchsClos        = computed(() => matchs.value.filter(m => m.estClos));
const totalCommissions  = computed(() => matchsClos.value.reduce((s, m) => s + (m.totalMiseA + m.totalMiseB) * 0.1, 0));
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

h2 { font-size: 1.2rem; font-weight: 700; color: #111; }

.badge-admin {
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
}

.card {
  background: #fff;
  border: 1px solid #e2e4e8;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #999;
  margin-bottom: 12px;
}

.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.sel, .inp-wide {
  background: #f5f6f8;
  border: 1px solid #ddd;
  color: #111;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.88rem;
  outline: none;
}

.inp-wide { flex: 1; min-width: 140px; }

.btn {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover:not(:disabled) { background: #dbeafe; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-danger { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.btn-danger:hover:not(:disabled) { background: #fee2e2; }

.empty { color: #999; font-size: 0.88rem; }

.card-commissions {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.commission-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 4px;
}

.commission-detail {
  font-size: 0.8rem;
  color: #60a5fa;
}
</style>
