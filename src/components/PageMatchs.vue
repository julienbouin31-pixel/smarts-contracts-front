<template>
  <div>
    <div class="page-header">
      <h2>Matchs</h2>
      <span class="badge">{{ openCount }} ouverts</span>
    </div>

    <!-- Filtres par catégorie -->
    <div class="cats">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="['cat-btn', { active: filtreCategorie === cat }]"
        @click="filtreCategorie = cat"
      >
        {{ catIcon(cat) }} {{ cat }}
      </button>
    </div>

    <div v-if="matchsFiltres.length === 0" class="empty">Aucun match dans cette catégorie.</div>

    <MatchCard
      v-for="(m, idx) in matchsFiltres"
      :key="m._idx"
      :match="m"
      :mise="misesInitiales[m._idx] ?? 0"
      :miseActuelle="mises[m._idx] ?? 0"
      :userChoix="choix[m._idx] ?? 0"
      :txPending="txPending"
      :initChoix="betChoix[m._idx]"
      :initMontant="betMontant[m._idx]"
      @parier="(c, mt) => parier(m._idx, c, mt)"
      @retirer="retirerGains(m._idx)"
      @retirerMise="retirerMise(m._idx)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useContract } from '../composables/useContract.js';
import MatchCard from './MatchCard.vue';

const { matchs, mises, misesInitiales, choix, betChoix, betMontant, txPending, retirerGains, retirerMise } = useContract();

const filtreCategorie = ref('Tous');

const ICONS = {
  Football: '⚽', Tennis: '🎾', Basketball: '🏀',
  Rugby: '🏉', Baseball: '⚾', Tous: '🏆',
};
const catIcon = (cat) => ICONS[cat] ?? '🎮';

const categories = computed(() => {
  const cats = [...new Set(matchs.value.map(m => m.categorie).filter(Boolean))];
  return ['Tous', ...cats];
});

const matchsFiltres = computed(() =>
  matchs.value
    .map((m, idx) => ({ ...m, _idx: idx }))
    .filter(m => filtreCategorie.value === 'Tous' || m.categorie === filtreCategorie.value)
);

const openCount = computed(() => matchs.value.filter(m => !m.estClos).length);

const parier = async (idx, localChoix, localMontant) => {
  betChoix.value[idx]   = localChoix;
  betMontant.value[idx] = localMontant;
  await useContract().parier(idx);
};
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

h2 { font-size: 1.2rem; font-weight: 700; color: #111; }

.badge {
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
}

.cats {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.cat-btn {
  background: #f5f6f8;
  border: 1px solid #e2e4e8;
  border-radius: 99px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
}

.cat-btn:hover { background: #e9eaec; }
.cat-btn.active { background: #111; color: #fff; border-color: #111; font-weight: 600; }

.empty { color: #999; font-size: 0.9rem; padding: 12px 0; }
</style>
