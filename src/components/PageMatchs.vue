<template>
  <div>
    <div class="page-header">
      <h2>Matchs</h2>
      <span class="badge">{{ openCount }} ouverts</span>
    </div>

    <div class="filtres">
      <!-- Statut -->
      <div class="filter-group">
        <button
          v-for="s in statuts"
          :key="s.value"
          :class="['cat-btn', { active: filtreStatut === s.value }]"
          @click="filtreStatut = s.value"
        >{{ s.label }}</button>
      </div>

      <!-- Catégorie -->
      <div class="filter-group">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['cat-btn', { active: filtreCategorie === cat }]"
          @click="filtreCategorie = cat"
        >{{ catIcon(cat) }} {{ cat }}</button>
      </div>
    </div>

    <div v-if="matchsFiltres.length === 0" class="empty">Aucun match pour ces filtres.</div>

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
const filtreStatut    = ref('tous');

const statuts = [
  { value: 'tous',   label: 'Tous' },
  { value: 'ouvert', label: 'Ouverts' },
  { value: 'clos',   label: 'Clôturés' },
];

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
    .filter(m => filtreStatut.value === 'tous' || (filtreStatut.value === 'ouvert' ? !m.estClos : m.estClos))
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
  margin-bottom: 20px;
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

.filtres {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cat-btn {
  background: #fff;
  border: 1px solid #e2e4e8;
  border-radius: 99px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: background 0.12s, border-color 0.12s;
}

.cat-btn:hover { background: #f4f6f9; }
.cat-btn.active { background: #111; color: #fff; border-color: #111; font-weight: 600; box-shadow: none; }

.empty { color: #999; font-size: 0.9rem; padding: 12px 0; }
</style>
