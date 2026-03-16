<template>
  <div>
    <ConnectScreen v-if="!account" @connect="connectWallet" />

    <div v-else class="layout">
      <AppSidebar
        v-model:page="page"
        :isAdmin="isAdmin"
        :shortAddr="shortAddr"
        :points="points"
        :ethBalance="ethBalance"
        :loading="loading"
        @refresh="fetchAll"
      />

      <main class="main">
        <PageMatchs   v-if="page === 'matchs'" />
        <PageMesParis v-else-if="page === 'mesParis'" />
        <PageAdmin    v-else-if="page === 'admin' && isAdmin" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useContract } from './composables/useContract.js';
import ConnectScreen from './components/ConnectScreen.vue';
import AppSidebar    from './components/AppSidebar.vue';
import PageMatchs    from './components/PageMatchs.vue';
import PageMesParis  from './components/PageMesParis.vue';
import PageAdmin     from './components/PageAdmin.vue';

const { account, points, ethBalance, loading, page, isAdmin, shortAddr, initWallet, connectWallet, fetchAll } = useContract();

onMounted(() => {
  initWallet();
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      account.value = accounts[0];
      fetchAll();
    });
  }
});
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f5f6f8;
  color: #111;
}

.layout {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  padding: 32px 36px;
  max-width: 720px;
  overflow-y: auto;
}
</style>
