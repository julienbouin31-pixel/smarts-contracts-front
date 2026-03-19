import { ref } from 'vue';

// APIs publiques ESPN — pas de clé requise
const BASE = {
  Football:   'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  Basketball: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
};

// Génère "YYYYMMDD" pour dans +n jours
const toESPNDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
};

const matchesApi = ref([]);
const apiLoading = ref(false);
const apiError   = ref(null);

const fetchMatchesApi = async (categorie) => {
  if (!BASE[categorie]) return;

  apiLoading.value = true;
  apiError.value   = null;
  matchesApi.value = [];

  try {
    const url = `${BASE[categorie]}?dates=${toESPNDate(0)}-${toESPNDate(30)}&limit=20`;
    const res  = await fetch(url);
    const data = await res.json();

    matchesApi.value = (data.events ?? []).slice(0, 10).map(e => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName ?? '?';
      const away = comp?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName ?? '?';
      const dt = e.date ? new Date(e.date) : null;
      const date = dt ? dt.toLocaleDateString('fr-FR') : '';
      const heure = dt ? dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
      const pad = n => String(n).padStart(2, '0');
      const dateISO = dt
        ? `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
        : '';
      return { domicile: home, exterieur: away, date, heure, dateISO, categorie };
    });

    if (matchesApi.value.length === 0) {
      apiError.value = "Aucun match programmé en ce moment.";
    }
  } catch (e) {
    apiError.value = "Impossible de charger les matchs.";
    console.error(e);
  }

  apiLoading.value = false;
};

export function useMatchesApi() {
  return { matchesApi, apiLoading, apiError, fetchMatchesApi };
}
