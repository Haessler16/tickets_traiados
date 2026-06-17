import { createClient } from '@supabase/supabase-js';
import { MOCK_EVENTS } from '../mock-data'; // Ajusta la ruta según la ubicación de tu mock-data.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erro: Variáveis de ambiente do Supabase não estão configuradas corretamente.");
  process.exit(1);
}

// Usamos la service role key para tener permisos administrativos de inserción masiva
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function seedDatabase() {
  console.log("Iniciando o carregamento de dados no Supabase...");

  // 1. Extraer y mapear organizadores únicos para evitar duplicados
  const uniqueOrganizers = Array.from(
    new Map(MOCK_EVENTS.map(event => [event?.organizers?.id, event.organizers])).values()
  );

  console.log(`Carregando ${uniqueOrganizers.length} organizadores...`);

  const { error: orgError } = await supabase
    .from('organizers')
    .upsert(
      uniqueOrganizers.map(org => ({
        id: org?.id,
        name: org?.name,
        logo_url: org?.logo_url,
        verified: org?.verified
      })),
      { onConflict: 'id' }
    );

  if (orgError) {
    console.error("Erro ao carregar organizadores:", orgError.message);
    return;
  }

  // 2. Mapear y preparar los eventos para la inserción
  console.log(`Carregando ${MOCK_EVENTS.length} eventos...`);

  const eventsToInsert = MOCK_EVENTS.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    image_url: event.image_url,
    category: event.category,
    start_date: event.start_date,
    end_date: event.end_date,
    location: event.location,
    city: event.city,
    price_from: event.price_from,
    organizer_id: event.organizer_id,
    created_at: event.created_at || new Date().toISOString()
  }));

  const { error: eventError } = await supabase
    .from('events')
    .upsert(eventsToInsert, { onConflict: 'id' });

  if (eventError) {
    console.error("Erro ao carregar eventos:", eventError.message);
    return;
  }

  console.log("🚀 Todos os dados foram carregados com sucesso no Supabase!");
}

seedDatabase();