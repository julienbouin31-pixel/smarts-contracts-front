<template>
  <div>
    <div class="page-header">
      <h2>Matchs</h2>
      <span class="badge">{{ openCount }} ouverts</span>
    </div>

    <div v-if="matchs.length === 0" class="empty">Aucun match pour l'instant.</div>

    <MatchCard
      v-for="(m, idx) in matchs"
      :key="idx"
      :match="m"
      :mise="mises[idx] ?? 0"
      :userChoix="choix[idx] ?? 0"
      :txPending="txPending"
      :initChoix="betChoix[idx]"
      :initMontant="betMontant[idx]"
      @parier="(c, mt) => parier(idx, c, mt)"
      @retirer="retirerGains(idx)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useContract } from '../composables/useContract.js';
import MatchCard from './MatchCard.vue';

const { matchs, mises, choix, betChoix, betMontant, txPending, retirerGains } = useContract();

const openCount = computed(() => matchs.value.filter(m => !m.estClos).length);

const parier = async (idx, localChoix, localMontant) => {
  // On met à jour les valeurs dans le composable avant d'appeler parier
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
  margin-bottom: 24px;
}

h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111;
}

.badge {
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
}

.empty {
  color: #999;
  font-size: 0.9rem;
  padding: 12px 0;
}
</style>
