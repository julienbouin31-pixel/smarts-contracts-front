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
        <input type="datetime-local" v-model="newMatchDate" class="inp-wide" />
        <button class="btn" @click="creerMatch" :disabled="txPending">Créer</button>
      </div>
    </div>

    <!-- Importer depuis l'API -->
    <div class="card">
      <div class="section-title">Importer un vrai match</div>
      <div class="row" style="margin-bottom: 12px;">
        <button
          v-for="cat in ['Football', 'Basketball']"
          :key="cat"
          :class="['btn-cat', { active: apiCategorie === cat }]"
          @click="charger(cat)"
          :disabled="apiLoading"
        >
          {{ cat === 'Football' ? '⚽' : '🏀' }} {{ cat }}
        </button>
        <span v-if="apiLoading" class="loading-txt">Chargement…</span>
        <span v-if="apiError" class="error-txt">{{ apiError }}</span>
      </div>

      <div v-if="matchesApi.length > 0" class="api-list">
        <div
          v-for="m in matchesApi"
          :key="m.domicile + m.exterieur"
          class="api-item"
          @click="importer(m)"
        >
          <div class="api-teams">{{ m.domicile }} <span>vs</span> {{ m.exterieur }}</div>
          <div class="api-date">{{ m.date }} {{ m.heure }}</div>
        </div>
      </div>
      <div v-else-if="!apiLoading && apiCategorie" class="empty">Aucun match disponible.</div>
      <div v-else-if="!apiCategorie" class="empty">Choisissez un sport pour voir les prochains matchs.</div>
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
import { ref, computed } from 'vue';
import { useContract } from '../composables/useContract.js';
import { useMatchesApi } from '../composables/useMatchesApi.js';

const {
  matchs, newMatchDomicile, newMatchExterieur, newMatchCategorie, newMatchDate, cloreMatchId, cloreVainqueur,
  matchsOuverts, txPending,
  creerMatch, cloreMatch,
} = useContract();

const { matchesApi, apiLoading, apiError, fetchMatchesApi } = useMatchesApi();

const matchsClos       = computed(() => matchs.value.filter(m => m.estClos));
const totalCommissions = computed(() => matchsClos.value.reduce((s, m) => s + (m.totalMiseA + m.totalMiseB) * 0.1, 0));

const apiCategorie = ref('');

const charger = (cat) => {
  apiCategorie.value = cat;
  fetchMatchesApi(cat);
};

const importer = (m) => {
  newMatchDomicile.value  = m.domicile;
  newMatchExterieur.value = m.exterieur;
  newMatchCategorie.value = m.categorie;
  newMatchDate.value      = m.dateISO || '';
  // scroll vers le formulaire
  document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
};
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
input[type="datetime-local"].inp-wide { min-width: 200px; }

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

.btn-cat {
  background: #f5f6f8;
  border: 1px solid #e2e4e8;
  border-radius: 99px;
  padding: 5px 14px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: #555;
}

.btn-cat:hover:not(:disabled) { background: #e9eaec; }
.btn-cat.active { background: #111; color: #fff; border-color: #111; }
.btn-cat:disabled { opacity: 0.5; cursor: not-allowed; }

.loading-txt { font-size: 0.85rem; color: #888; }
.error-txt   { font-size: 0.85rem; color: #dc2626; }

.api-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.api-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f5f6f8;
  border: 1px solid #e2e4e8;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.api-item:hover { background: #eff6ff; border-color: #bfdbfe; }

.api-teams {
  font-size: 0.88rem;
  font-weight: 600;
  color: #111;
}

.api-teams span { font-weight: 400; color: #aaa; margin: 0 6px; }

.api-date { font-size: 0.75rem; color: #888; white-space: nowrap; }

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
