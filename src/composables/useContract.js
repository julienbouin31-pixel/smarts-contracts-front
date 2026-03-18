import { ref, computed } from 'vue';
import Web3 from 'web3';

// Singleton – même état partagé entre tous les composants
const account           = ref(null);
const ethBalance        = ref('0');
const matchs            = ref([]);
const adminAddress      = ref(null);
const mises             = ref({});   // misesUtilisateurs — remis à 0 après retrait
const misesInitiales    = ref({});   // misesInitiales — historique permanent, en ETH
const choix             = ref({});
const betChoix          = ref({});
const betMontant        = ref({});   // montant saisi par l'user, en ETH
const txPending         = ref(false);
const loading           = ref(false);
const page              = ref('matchs');

const newMatchDomicile  = ref('');
const newMatchExterieur = ref('');
const newMatchCategorie = ref('Football');
const cloreMatchId      = ref(0);
const cloreVainqueur    = ref(1);

let monContrat = null;
let web3 = null;

const contractAddress = "0xb545Ed8826C89B8e4973a37F0aE926F755711c43";
const contractABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "admin", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "choixUtilisateurs", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }, { internalType: "uint8", name: "_vainqueur", type: "uint8" }], name: "cloreMatch", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "_equipeDomicile", type: "string" }, { internalType: "string", name: "_equipeExterieur", type: "string" }, { internalType: "string", name: "_categorie", type: "string" }], name: "creerMatch", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "getBalance", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getMatchs", outputs: [{ components: [{ internalType: "string", name: "equipeDomicile", type: "string" }, { internalType: "string", name: "equipeExterieur", type: "string" }, { internalType: "string", name: "categorie", type: "string" }, { internalType: "uint256", name: "totalMiseA", type: "uint256" }, { internalType: "uint256", name: "totalMiseB", type: "uint256" }, { internalType: "bool", name: "estClos", type: "bool" }, { internalType: "uint8", name: "vainqueur", type: "uint8" }], internalType: "struct PariMutuel.Match[]", name: "", type: "tuple[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "matchs", outputs: [{ internalType: "string", name: "equipeDomicile", type: "string" }, { internalType: "string", name: "equipeExterieur", type: "string" }, { internalType: "string", name: "categorie", type: "string" }, { internalType: "uint256", name: "totalMiseA", type: "uint256" }, { internalType: "uint256", name: "totalMiseB", type: "uint256" }, { internalType: "bool", name: "estClos", type: "bool" }, { internalType: "uint8", name: "vainqueur", type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "misesInitiales", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "misesUtilisateurs", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }, { internalType: "uint8", name: "_choix", type: "uint8" }], name: "parier", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }], name: "retirerGains", outputs: [], stateMutability: "nonpayable", type: "function" },
];

// Computed
const isAdmin       = computed(() => account.value && adminAddress.value && account.value.toLowerCase() === adminAddress.value.toLowerCase());
const shortAddr     = computed(() => account.value ? account.value.slice(0, 6) + '…' + account.value.slice(-4) : '');
const matchsOuverts = computed(() => matchs.value.map((m, idx) => ({ ...m, idx })).filter(m => !m.estClos));
// mesParis utilise misesInitiales (historique permanent) et mises (pour savoir si gains déjà retirés)
const mesParis      = computed(() => matchs.value.map((m, idx) => ({
  ...m, idx,
  mise: misesInitiales.value[idx] || 0,
  miseActuelle: mises.value[idx] || 0,  // 0 si gains déjà retirés
  choix: choix.value[idx] || 0,
})).filter(p => p.mise > 0));
const pctA          = (m) => { const t = m.totalMiseA + m.totalMiseB; return t === 0 ? 50 : Math.round(m.totalMiseA / t * 100); };

// Helpers
const toEth = (wei) => parseFloat(web3.utils.fromWei(String(wei), 'ether'));

// Wallet
const initWallet = async () => {
  if (!window.ethereum) return;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) return;
  web3 = new Web3(window.ethereum);
  account.value = accounts[0];
  monContrat = new web3.eth.Contract(contractABI, contractAddress);
  await fetchAll();
};

const connectWallet = async () => {
  if (!window.ethereum) return alert("Veuillez installer MetaMask !");
  try {
    web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account.value = accounts[0];
    monContrat = new web3.eth.Contract(contractABI, contractAddress);
    await fetchAll();
  } catch (e) { console.error(e); }
};

// Fetch
const fetchAll = async () => {
  if (!monContrat || !account.value) return;
  loading.value = true;
  try {
    const wei = await web3.eth.getBalance(account.value);
    ethBalance.value   = toEth(wei).toFixed(4);
    adminAddress.value = await monContrat.methods.admin().call();
    const res = await monContrat.methods.getMatchs().call();
    matchs.value = res.map(m => ({
      equipeDomicile: m.equipeDomicile,
      equipeExterieur: m.equipeExterieur,
      categorie: m.categorie,
      totalMiseA: toEth(m.totalMiseA),
      totalMiseB: toEth(m.totalMiseB),
      estClos: m.estClos,
      vainqueur: Number(m.vainqueur),
    }));
    const mm = {}, mi = {}, cc = {};
    for (let i = 0; i < matchs.value.length; i++) {
      mm[i] = toEth(await monContrat.methods.misesUtilisateurs(i, account.value).call());
      mi[i] = toEth(await monContrat.methods.misesInitiales(i, account.value).call());
      cc[i] = Number(await monContrat.methods.choixUtilisateurs(i, account.value).call());
      if (betChoix.value[i]   === undefined) betChoix.value[i]   = 1;
      if (betMontant.value[i] === undefined) betMontant.value[i] = 0.01;
    }
    mises.value = mm;
    misesInitiales.value = mi;
    choix.value = cc;
  } catch (e) { console.error(e); }
  loading.value = false;
};

// Actions utilisateur
const parier = async (matchId) => {
  const ethAmount = betMontant.value[matchId];
  if (!ethAmount || ethAmount <= 0) return alert("Montant invalide");
  const weiAmount = web3.utils.toWei(String(ethAmount), 'ether');
  txPending.value = true;
  try {
    await monContrat.methods.parier(matchId, Number(betChoix.value[matchId])).send({
      from: account.value,
      value: weiAmount,
    });
    await fetchAll();
  } catch (e) { alert("Erreur : " + (e.message || e)); }
  txPending.value = false;
};

const retirerGains = async (matchId) => {
  txPending.value = true;
  try {
    await monContrat.methods.retirerGains(matchId).send({ from: account.value });
    await fetchAll();
  } catch (e) { alert("Erreur : " + (e.message || e)); }
  txPending.value = false;
};

// Actions admin
const creerMatch = async () => {
  if (!newMatchDomicile.value.trim() || !newMatchExterieur.value.trim()) return alert("Remplissez les deux équipes");
  txPending.value = true;
  try {
    await monContrat.methods.creerMatch(newMatchDomicile.value.trim(), newMatchExterieur.value.trim(), newMatchCategorie.value).send({ from: account.value });
    newMatchDomicile.value = '';
    newMatchExterieur.value = '';
    await fetchAll();
  } catch (e) { alert("Erreur : " + (e.message || e)); }
  txPending.value = false;
};

const cloreMatch = async () => {
  txPending.value = true;
  try {
    await monContrat.methods.cloreMatch(cloreMatchId.value, cloreVainqueur.value).send({ from: account.value });
    await fetchAll();
  } catch (e) { alert("Erreur : " + (e.message || e)); }
  txPending.value = false;
};

export function useContract() {
  return {
    account, ethBalance, matchs, mises, misesInitiales, choix, betChoix, betMontant,
    txPending, loading, page,
    newMatchDomicile, newMatchExterieur, newMatchCategorie, cloreMatchId, cloreVainqueur,
    isAdmin, shortAddr, matchsOuverts, mesParis, pctA,
    initWallet, connectWallet, fetchAll, parier, retirerGains, creerMatch, cloreMatch,
  };
}
