import { ref, computed } from 'vue';
import Web3 from 'web3';

// Singleton – même état partagé entre tous les composants
const account       = ref(null);
const points        = ref(0);
const ethBalance    = ref('0');
const matchs        = ref([]);
const adminAddress  = ref(null);
const mises         = ref({});
const choix         = ref({});
const betChoix      = ref({});
const betMontant    = ref({});
const txPending     = ref(false);
const loading       = ref(false);
const page          = ref('matchs');

const newMatchDesc   = ref('');
const adminAddr      = ref('');
const adminMontant   = ref(100);
const cloreMatchId   = ref(0);
const cloreVainqueur = ref(1);

let monContrat = null;
let web3 = null;

const contractAddress = "0xf571C1844d8D78aB5935DaEcED269b1718A09305";
const contractABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "admin", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "_utilisateur", type: "address" }, { internalType: "uint256", name: "_montant", type: "uint256" }], name: "ajouterPoints", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "choixUtilisateurs", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }, { internalType: "uint8", name: "_vainqueur", type: "uint8" }], name: "cloreMatch", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string", name: "_description", type: "string" }], name: "creerMatch", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "getMatchs", outputs: [{ components: [{ internalType: "string", name: "description", type: "string" }, { internalType: "uint256", name: "totalMiseA", type: "uint256" }, { internalType: "uint256", name: "totalMiseB", type: "uint256" }, { internalType: "bool", name: "estClos", type: "bool" }, { internalType: "uint8", name: "vainqueur", type: "uint8" }], internalType: "struct PariMutuel.Match[]", name: "", type: "tuple[]" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "matchs", outputs: [{ internalType: "string", name: "description", type: "string" }, { internalType: "uint256", name: "totalMiseA", type: "uint256" }, { internalType: "uint256", name: "totalMiseB", type: "uint256" }, { internalType: "bool", name: "estClos", type: "bool" }, { internalType: "uint8", name: "vainqueur", type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "address", name: "", type: "address" }], name: "misesUtilisateurs", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }, { internalType: "uint8", name: "_choix", type: "uint8" }, { internalType: "uint256", name: "_montant", type: "uint256" }], name: "parier", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "uint256", name: "_matchId", type: "uint256" }], name: "retirerGains", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "soldes", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
];

// Computed
const isAdmin       = computed(() => account.value && adminAddress.value && account.value.toLowerCase() === adminAddress.value.toLowerCase());
const shortAddr     = computed(() => account.value ? account.value.slice(0, 6) + '…' + account.value.slice(-4) : '');
const matchsOuverts = computed(() => matchs.value.map((m, idx) => ({ ...m, idx })).filter(m => !m.estClos));
const mesParis      = computed(() => matchs.value.map((m, idx) => ({ ...m, idx, mise: mises.value[idx] || 0, choix: choix.value[idx] || 0 })).filter(p => p.mise > 0));
const pctA          = (m) => { const t = m.totalMiseA + m.totalMiseB; return t === 0 ? 50 : Math.round(m.totalMiseA / t * 100); };

// Wallet
const initWallet = async () => {
  if (!window.ethereum) return;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' }); // pas de popup
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
    points.value       = Number(await monContrat.methods.soldes(account.value).call());
    const wei = await web3.eth.getBalance(account.value);
    ethBalance.value   = parseFloat(web3.utils.fromWei(wei, 'ether')).toFixed(4);
    adminAddress.value = await monContrat.methods.admin().call();
    const res = await monContrat.methods.getMatchs().call();
    matchs.value = res.map(m => ({
      description: m.description,
      totalMiseA: Number(m.totalMiseA),
      totalMiseB: Number(m.totalMiseB),
      estClos: m.estClos,
      vainqueur: Number(m.vainqueur),
    }));
    const mm = {}, cc = {};
    for (let i = 0; i < matchs.value.length; i++) {
      mm[i] = Number(await monContrat.methods.misesUtilisateurs(i, account.value).call());
      cc[i] = Number(await monContrat.methods.choixUtilisateurs(i, account.value).call());
      if (betChoix.value[i]   === undefined) betChoix.value[i]   = 1;
      if (betMontant.value[i] === undefined) betMontant.value[i] = 10;
    }
    mises.value = mm;
    choix.value = cc;
  } catch (e) { console.error(e); }
  loading.value = false;
};

// Actions utilisateur
const parier = async (matchId) => {
  const montant = betMontant.value[matchId];
  if (!montant || montant <= 0) return alert("Montant invalide");
  if (montant > points.value)   return alert("Solde insuffisant");
  txPending.value = true;
  try {
    await monContrat.methods.parier(matchId, Number(betChoix.value[matchId]), montant).send({ from: account.value });
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
  if (!newMatchDesc.value.trim()) return alert("Description vide");
  txPending.value = true;
  try {
    await monContrat.methods.creerMatch(newMatchDesc.value.trim()).send({ from: account.value });
    newMatchDesc.value = '';
    await fetchAll();
  } catch (e) { alert("Erreur : " + (e.message || e)); }
  txPending.value = false;
};

const ajouterPoints = async () => {
  if (!adminAddr.value || !adminMontant.value) return alert("Champs manquants");
  txPending.value = true;
  try {
    await monContrat.methods.ajouterPoints(adminAddr.value, adminMontant.value).send({ from: account.value });
    adminAddr.value = '';
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
    account, points, ethBalance, matchs, mises, choix, betChoix, betMontant,
    txPending, loading, page,
    newMatchDesc, adminAddr, adminMontant, cloreMatchId, cloreVainqueur,
    isAdmin, shortAddr, matchsOuverts, mesParis, pctA,
    initWallet, connectWallet, fetchAll, parier, retirerGains, creerMatch, ajouterPoints, cloreMatch,
  };
}
