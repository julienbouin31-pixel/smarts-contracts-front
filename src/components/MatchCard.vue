<template>
  <div class="card">
    <div class="card-head">
      <div class="card-meta">
        <span class="cat-badge">{{ catIcon }} {{ match.categorie }}</span>
        <span v-if="match.dateMatch" class="date-badge">📅 {{ match.dateMatch }}</span>
      </div>
      <span :class="['pill', match.estClos ? 'pill-closed' : matchCommence ? 'pill-started' : 'pill-open']">
        {{ statusLabel }}
      </span>
    </div>

    <div class="match-title">{{ match.equipeDomicile }} <span class="vs">vs</span> {{ match.equipeExterieur }}</div>

    <div class="teams">
      <div class="team team-a">
        <span class="team-name">{{ match.equipeDomicile }}</span>
        <span class="team-pts">{{ match.totalMiseA.toFixed(4) }} ETH</span>
      </div>
      <div class="team team-nul">
        <span class="team-name">Nul</span>
        <span class="team-pts">{{ match.totalMiseNul.toFixed(4) }} ETH</span>
      </div>
      <div class="team team-b">
        <span class="team-name">{{ match.equipeExterieur }}</span>
        <span class="team-pts">{{ match.totalMiseB.toFixed(4) }} ETH</span>
      </div>
    </div>

    <div class="ratio-bar">
      <div class="ratio-a"   :style="{ width: pcts.a   + '%' }"></div>
      <div class="ratio-nul" :style="{ width: pcts.nul + '%' }"></div>
      <div class="ratio-b"   :style="{ width: pcts.b   + '%' }"></div>
    </div>
    <div class="ratio-labels">
      <span class="label-a">{{ match.equipeDomicile }} {{ pcts.a }}%</span>
      <span class="label-nul">Nul {{ pcts.nul }}%</span>
      <span class="label-b">{{ match.equipeExterieur }} {{ pcts.b }}%</span>
    </div>

    <div v-if="mise > 0" class="already-bet">
      <div class="bet-info">
        <span class="bet-label">Votre mise</span>
        <span class="bet-detail"><strong>{{ mise.toFixed(4) }} ETH</strong> sur <strong>{{ userChoix === 1 ? match.equipeDomicile : userChoix === 2 ? match.equipeExterieur : 'Match nul' }}</strong></span>
      </div>
      <button
        v-if="!match.estClos && !matchCommence && miseActuelle > 0"
        class="btn-retirer-mise"
        @click="$emit('retirerMise')"
        :disabled="txPending"
      >
        Retirer <span class="penalty">−5%</span>
      </button>
    </div>

    <div v-else-if="!match.estClos && !matchCommence" class="bet-row">
      <select v-model="localChoix" class="sel">
        <option :value="1">{{ match.equipeDomicile }}</option>
        <option :value="0">Match nul</option>
        <option :value="2">{{ match.equipeExterieur }}</option>
      </select>
      <input v-model.number="localMontant" type="number" min="0.001" step="0.001" placeholder="ETH" class="inp" />
      <button class="btn-bet" @click="$emit('parier', localChoix, localMontant)" :disabled="txPending">
        {{ txPending ? '…' : 'Parier' }}
      </button>
    </div>
    <div v-else-if="!match.estClos && matchCommence" class="started-msg">
      🔒 Paris fermés — match commencé
    </div>

    <template v-if="match.estClos && mise > 0">
      <div v-if="(userChoix === match.vainqueur || (match.vainqueur === 0 && userChoix === 0)) && miseActuelle > 0" class="gain-row">
        <div>
          <div class="gain-label">Gains disponibles</div>
          <div class="gain-amount">{{ gain.toFixed(4) }} ETH</div>
        </div>
        <button class="btn-gain" @click="$emit('retirer')" :disabled="txPending">
          Retirer mes gains
        </button>
      </div>
      <div v-else-if="(userChoix === match.vainqueur || (match.vainqueur === 0 && userChoix === 0)) && miseActuelle === 0" class="withdrawn">
        ✓ Gains retirés
      </div>
      <div v-else class="lost-msg">
        ✗ Pari perdu
      </div>
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

const pcts = computed(() => {
  const t = props.match.totalMiseA + props.match.totalMiseB + props.match.totalMiseNul;
  if (t === 0) return { a: 33, nul: 33, b: 33 };
  return {
    a:   Math.round(props.match.totalMiseA   / t * 100),
    nul: Math.round(props.match.totalMiseNul / t * 100),
    b:   Math.round(props.match.totalMiseB   / t * 100),
  };
});

const gain = computed(() => {
  const pot = props.match.totalMiseA + props.match.totalMiseB + props.match.totalMiseNul;
  const gagnants = props.match.vainqueur === 0
    ? props.match.totalMiseNul
    : props.match.vainqueur === 1 ? props.match.totalMiseA : props.match.totalMiseB;
  return gagnants > 0 ? ((props.mise * pot) / gagnants) * 0.9 : 0;
});

const matchCommence = computed(() =>
  props.match.dateMatchTs > 0 && Date.now() / 1000 > props.match.dateMatchTs
);

const statusLabel = computed(() => {
  if (!props.match.estClos) return matchCommence.value ? 'En cours' : 'Ouvert';
  if (props.match.vainqueur === 0) return 'Match nul';
  return (props.match.vainqueur === 1 ? props.match.equipeDomicile : props.match.equipeExterieur) + ' gagne';
});
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.15s;
}

.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cat-badge {
  font-size: 0.72rem;
  color: #666;
  background: #f4f6f9;
  border: 1px solid #e8eaed;
  border-radius: 99px;
  padding: 2px 9px;
}

.date-badge {
  font-size: 0.72rem;
  color: #666;
  background: #f4f6f9;
  border: 1px solid #e8eaed;
  border-radius: 99px;
  padding: 2px 9px;
}

.pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.pill-open    { background: #dcfce7; color: #15803d; }
.pill-closed  { background: #f1f3f5; color: #888; }
.pill-started { background: #fef3c7; color: #b45309; }

.match-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.vs {
  font-weight: 400;
  color: #bbb;
  margin: 0 6px;
}

.teams {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.team {
  flex: 1;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-a   { background: #eff6ff; border: 1px solid #bfdbfe; }
.team-nul { background: #f8fafc; border: 1px solid #e2e8f0; }
.team-b   { background: #fff1f2; border: 1px solid #fecdd3; }

.team-name { font-size: 0.8rem; color: #555; }
.team-pts  { font-weight: 700; font-size: 0.88rem; color: #111; }

.ratio-bar {
  height: 5px;
  display: flex;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 14px;
  position: relative;
}

.ratio-a {
  height: 100%;
  background: #3b82f6;
  transition: width 0.4s ease;
  display: flex;
  align-items: center;
  padding-left: 6px;
  position: relative;
}

.ratio-nul {
  height: 100%;
  background: #94a3b8;
  transition: width 0.4s ease;
}

.ratio-b {
  height: 100%;
  background: #f87171;
  transition: width 0.4s ease;
}

.ratio-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  margin-bottom: 12px;
}

.label-a   { color: #3b82f6; font-weight: 600; }
.label-nul { color: #94a3b8; font-weight: 600; }
.label-b   { color: #f87171; font-weight: 600; }

.already-bet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px 14px;
}

.bet-info { display: flex; flex-direction: column; gap: 2px; }
.bet-label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
.bet-detail { font-size: 0.85rem; color: #15803d; }
.bet-detail strong { color: #111; }

.btn-retirer-mise {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 7px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.12s;
}

.btn-retirer-mise:hover:not(:disabled) { background: #ffedd5; }
.btn-retirer-mise:disabled { opacity: 0.4; cursor: not-allowed; }
.penalty { opacity: 0.7; }

.bet-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.sel, .inp {
  background: #f4f6f9;
  border: 1px solid #e2e4e8;
  color: #111;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.85rem;
  outline: none;
}

.sel:focus, .inp:focus { border-color: #93c5fd; }
.inp { width: 90px; }

.btn-bet {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s;
}

.btn-bet:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
.btn-bet:active { transform: translateY(0); }
.btn-bet:disabled { opacity: 0.4; cursor: not-allowed; }

.started-msg {
  font-size: 0.82rem;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 8px 12px;
}

.gain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 8px;
  gap: 12px;
}

.gain-label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
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
.btn-gain:active { transform: translateY(0); }
.btn-gain:disabled { opacity: 0.4; cursor: not-allowed; }

.lost-msg  { color: #dc2626; font-size: 0.85rem; margin-top: 8px; }
.withdrawn { color: #888; font-size: 0.85rem; margin-top: 8px; }
</style>
