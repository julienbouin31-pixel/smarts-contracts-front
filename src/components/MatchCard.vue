<template>
  <div class="card">
    <div class="card-head">
      <span class="card-title">{{ match.description }}</span>
      <span :class="['pill', match.estClos ? 'pill-closed' : 'pill-open']">
        {{ statusLabel }}
      </span>
    </div>

    <!-- Équipes -->
    <div class="teams">
      <div class="team">
        <span class="team-label">Équipe A</span>
        <span class="team-pts">{{ match.totalMiseA }} pts</span>
      </div>
      <div class="team-vs">vs</div>
      <div class="team">
        <span class="team-label">Équipe B</span>
        <span class="team-pts">{{ match.totalMiseB }} pts</span>
      </div>
    </div>

    <!-- Barre de ratio -->
    <div class="ratio-bar">
      <div class="ratio-fill" :style="{ width: pct + '%' }"></div>
    </div>
    <div class="ratio-labels">
      <span>A {{ pct }}%</span>
      <span>B {{ 100 - pct }}%</span>
    </div>

    <!-- Déjà parié -->
    <div v-if="mise > 0" class="already-bet">
      Misé <strong>{{ mise }} pts</strong> sur équipe <strong>{{ userChoix === 1 ? 'A' : 'B' }}</strong>
    </div>

    <!-- Formulaire pari -->
    <div v-else-if="!match.estClos" class="bet-row">
      <select v-model="localChoix" class="sel">
        <option :value="1">Équipe A</option>
        <option :value="2">Équipe B</option>
      </select>
      <input v-model.number="localMontant" type="number" min="1" placeholder="Pts" class="inp" />
      <button class="btn-bet" @click="$emit('parier', localChoix, localMontant)" :disabled="txPending">
        {{ txPending ? '…' : 'Parier' }}
      </button>
    </div>

    <!-- Retirer gains / Perdu -->
    <template v-if="match.estClos && mise > 0">
      <button v-if="userChoix === match.vainqueur" class="btn-gain" @click="$emit('retirer')" :disabled="txPending">
        Retirer mes gains
      </button>
      <div v-else class="lost">Pari perdu</div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['match', 'mise', 'userChoix', 'txPending', 'initChoix', 'initMontant']);
defineEmits(['parier', 'retirer']);

const localChoix   = ref(props.initChoix ?? 1);
const localMontant = ref(props.initMontant ?? 10);

const pct = computed(() => {
  const t = props.match.totalMiseA + props.match.totalMiseB;
  return t === 0 ? 50 : Math.round(props.match.totalMiseA / t * 100);
});

const statusLabel = computed(() => {
  if (!props.match.estClos) return 'Ouvert';
  return props.match.vainqueur === 1 ? 'A gagne' : 'B gagne';
});
</script>

<style scoped>
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
  margin-bottom: 14px;
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

.teams {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.team {
  flex: 1;
  background: #f5f6f8;
  border-radius: 7px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-label {
  font-size: 0.8rem;
  color: #666;
}

.team-pts {
  font-weight: 700;
  font-size: 0.9rem;
  color: #111;
}

.team-vs {
  font-size: 0.75rem;
  color: #bbb;
}

.ratio-bar {
  height: 4px;
  background: #e9eaec;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 4px;
}

.ratio-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 99px;
  transition: width 0.3s;
}

.ratio-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #999;
  margin-bottom: 12px;
}

.already-bet {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 7px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #15803d;
}

.bet-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.sel, .inp {
  background: #f5f6f8;
  border: 1px solid #ddd;
  color: #111;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 0.85rem;
  outline: none;
}

.inp { width: 80px; }

.btn-bet {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-bet:hover:not(:disabled) { background: #1d4ed8; }
.btn-bet:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-gain {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 7px 16px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 8px;
}

.btn-gain:hover:not(:disabled) { background: #dcfce7; }
.btn-gain:disabled { opacity: 0.4; cursor: not-allowed; }

.lost {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
