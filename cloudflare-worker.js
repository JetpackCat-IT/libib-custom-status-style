export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    // Get ID from URL. If the URL is libib-sync...workers.dev/UUID, the ID will be "UUID"
    const syncId = url.pathname.split('/')[1];

    // Define regex to check UUID validity
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // Avoid empty ID and and check for UUID format
    if (!syncId || !uuidRegex.test(syncId)) {
      return new Response("Sync ID not valid. Must be UUID", { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- GET METHOD (USER DOWNLOADS DATA) ---
    if (request.method === "GET") {
      // Get the data from the KV database
      const data = await env.SETTINGS_KV.get(syncId);
      
      if (!data) {
        return new Response(JSON.stringify({ error: "No settings found for this Sync ID" }), { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      return new Response(data, { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // --- POST METHOD (USER UPLOADS DATA) ---
    if (request.method === "POST") {
      try {
        const body = await request.text(); // Reading JSON sent
        
        // Save data into KV DataBase
        await env.SETTINGS_KV.put(syncId, body);
        
        return new Response(JSON.stringify({ success: true, message: "Settings saved!" }), { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (err) {
        return new Response("Server error", { status: 500, headers: corsHeaders });
      }
    }

    // -- DELETE METHOD (User delete uploaded settings) --
    if (request.method === "DELETE") {
      try {
        await env.SETTINGS_KV.delete(syncId);
        
        return new Response(JSON.stringify({ success: true, message: "Data has been deleted!" }), { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (err) {
        return new Response("Error during deletion", { status: 500, headers: corsHeaders });
      }
    }

    // If no GET or POST are used
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
};