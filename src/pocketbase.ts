import PocketBase from 'pocketbase';
import 'cross-fetch/polyfill';
import 'eventsource-polyfill'; // Importa el polyfill de EventSource

const pb = new PocketBase('https://pocketbase-production-451f.up.railway.app');

export default pb;
