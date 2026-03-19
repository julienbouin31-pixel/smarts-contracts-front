<template>
  <div class="card">
    <div class="card-head">
      <div class="card-title-group">
        <span class="cat-badge">{{ catIcon }} {{ match.categorie }}<template v-if="match.dateMatch"> · {{ match.dateMatch }}</template></span>
        <span class="card-title">{{ match.equipeDomicile }} vs {{ match.equipeExterieur }}</span>
      </div>
      <span :class="['pill', match.estClos ? 'pill-closed' : 'pill-open']">
        {{ statusLabel }}
      </span>
    </div>

    <div class="teams">
      <div class="team">
        <span class="team-label">{{ match.equipeDomicile }}</span>
        <span class="team-pts">{{ match.totalMiseA.toFixed(4) }} ETH</span>
      </div>
      <div class="team-vs">vs</div>
      <div class="team">
        <span class="team-label">{{ match.equipeExterieur }}</span>
        <span class="team-pts">{{ match.totalMiseB.toFixed(4) }} ETH</span>
      </div>
    </div>

    <div class="ratio-bar">
      <div class="ratio-a" :style="{ width: pct + '%' }"></div>
      <div class="ratio-b" :style="{ width: (100 - pct) + '%' }"></div>
    </div>
    <div class="ratio-labels">
      <span class="label-a">{{ match.equipeDomicile }} {{ pct }}%</span>
      <span class="label-b">{{ match.equipeExterieur }} {{ 100 - pct }}%</span>
    </div>

    <div v-if="mise > 0" class="already-bet">
      <span>Misé <strong>{{ mise.toFixed(4) }} ETH</strong> sur <strong>{{ userChoix === 1 ? match.equipeDomicile : match.equipeExterieur }}</strong></span>
      <button
        v-if="!match.estClos && !matchCommence && miseActuelle > 0"
        class="btn-retirer-mise"
        @click="$emit('retirerMise')"
        :disabled="txPending"
      >
        Retirer (-5%)
      </button>
    </div>

    <div v-else-if="!match.estClos && !matchCommence" class="bet-row">
      <select v-model="localChoix" class="sel">
        <option :value="1">{{ match.equipeDomicile }}</option>
        <option :value="2">{{ match.equipeExterieur }}</option>
      </select>
      <input v-model.number="localMontant" type="number" min="0.001" step="0.001" placeholder="ETH" class="inp" />
      <button class="btn-bet" @click="$emit('parier', localChoix, localMontant)" :disabled="txPending">
        {{ txPending ? '…' : 'Parier' }}
      </button>
    </div>
    <div v-else-if="!match.estClos && matchCommence" class="started">
      Paris fermés — match commencé
    </div>

    <template v-if="match.estClos && mise > 0">
      <div v-if="userChoix === match.vainqueur && miseActuelle > 0" class="gain-row">
        <span class="gain-label">Gains : <strong>{{ gain.toFixed(4) }} ETH</strong></span>
        <button class="btn-gain" @click="$emit('retirer')" :disabled="txPending">
          Retirer mes gains
        </button>
      </div>
      <div v-else-if="userChoix === match.vainqueur && miseActuelle === 0" class="withdrawn">Gains retirés</div>
      <div v-else class="lost">Pari perdu</div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['match', 'mise', 'miseActuelle', 'userChoix', 'txPending', 'initChoix', 'initMontant']);
defineEmits(['parier', 'retirer', 'retirerMise']);

const localChoix   = ref(props.initChoix ?? 1);
const localMontant = ref(props.initMontant ?? 0.01);

const ICONS = { Football: '⚽', Tennis: '🎾', Basketball: '🏀', Rugby: '🏉', Baseball: '⚾' };
const catIcon = computed(() => ICONS[props.match.categorie] ?? '🎮');

const pct = computed(() => {
  const t = props.match.totalMiseA + props.match.totalMiseB;
  return t === 0 ? 50 : Math.round(props.match.totalMiseA / t * 100);
});

const gain = computed(() => {
  const pot = props.match.totalMiseA + props.match.totalMiseB;
  const gagnants = props.match.vainqueur === 1 ? props.match.totalMiseA : props.match.totalMiseB;
  return gagnants > 0 ? ((props.mise * pot) / gagnants) * 0.9 : 0;
});

const matchCommence = computed(() =>
  props.match.dateMatchTs > 0 && Date.now() / 1000 > props.match.dateMatchTs
);

const statusLabel = computed(() => {
  if (!props.match.estClos) return 'Ouvert';
  return (props.match.vainqueur === 1 ? props.match.equipeDomicile : props.match.equipeExterieur) + ' gagne';
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

.card-title-group { display: flex; flex-direction: column; gap: 3px; }
.card-title { font-weight: 600; font-size: 0.95rem; color: #111; }
.cat-badge  { font-size: 0.72rem; color: #888; }

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

.team-label { font-size: 0.8rem; color: #666; }
.team-pts   { font-weight: 700; font-size: 0.9rem; color: #111; }
.team-vs    { font-size: 0.75rem; color: #bbb; }

.ratio-bar {
  height: 6px;
  display: flex;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 4px;
}

.ratio-a {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s;
}

.ratio-b {
  height: 100%;
  background: #f87171;
  transition: width 0.3s;
}

.ratio-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  margin-bottom: 12px;
}

.label-a { color: #2563eb; font-weight: 600; }
.label-b { color: #f87171; font-weight: 600; }

.already-bet {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 7px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #15803d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.btn-retirer-mise {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-retirer-mise:hover:not(:disabled) { background: #ffedd5; }
.btn-retirer-mise:disabled { opacity: 0.4; cursor: not-allowed; }

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

.inp { width: 90px; }

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

.gain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 7px;
  padding: 8px 12px;
  margin-top: 8px;
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

.btn-gain:hover:not(:disabled) { background: #dcfce7; }
.btn-gain:disabled { opacity: 0.4; cursor: not-allowed; }

.started   { color: #f59e0b; font-size: 0.85rem; margin-top: 8px; }
.lost      { color: #dc2626; font-size: 0.85rem; margin-top: 8px; }
.withdrawn { color: #888; font-size: 0.85rem; margin-top: 8px; }
</style>
