import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://stackbnb-60920.lovable.app',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovableproject.com')
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 16000; // Increased to handle longer AI responses
const MAX_TOTAL_CONTENT_LENGTH = 100000;

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages. Maximum is ${MAX_MESSAGES}` };
  }

  let totalLength = 0;
  const validatedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Message at index ${i} is invalid` };
    }

    if (typeof msg.role !== 'string' || !['user', 'assistant'].includes(msg.role)) {
      return { valid: false, error: `Invalid role at message ${i}. Must be 'user' or 'assistant'` };
    }

    if (typeof msg.content !== 'string') {
      return { valid: false, error: `Content at message ${i} must be a string` };
    }

    // Truncate long messages instead of rejecting them (keeps recent context)
    let content = msg.content;
    if (content.length > MAX_MESSAGE_LENGTH) {
      content = content.substring(0, MAX_MESSAGE_LENGTH) + "... [truncated]";
    }

    totalLength += content.length;
    
    // If total content is too long, truncate earlier messages (keep recent ones)
    if (totalLength > MAX_TOTAL_CONTENT_LENGTH && validatedMessages.length > 2) {
      // Remove oldest messages (but keep at least the first user message for context)
      validatedMessages.splice(1, 1);
      totalLength = validatedMessages.reduce((sum, m) => sum + m.content.length, 0) + content.length;
    }

    validatedMessages.push({
      role: msg.role,
      content: content.trim(),
    });
  }

  return { valid: true, messages: validatedMessages };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body || typeof body !== 'object' || !('messages' in body)) {
      return new Response(
        JSON.stringify({ error: "Request body must contain 'messages' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract host vendors if provided
    const hostVendors = (body as { hostVendors?: unknown[] }).hostVendors;
    let vendorContext = "";
    
    if (hostVendors && Array.isArray(hostVendors) && hostVendors.length > 0) {
      const vendorList = hostVendors
        .map((v: unknown) => {
          const vendor = v as Record<string, unknown>;
          const included = Array.isArray(vendor.included) ? (vendor.included as string[]).join(", ") : "";
          const durationText = vendor.duration && vendor.duration !== "N/A" ? `Duration: ${vendor.duration}` : "Duration: Flexible (no time limit)";
          const maxGuestsText = vendor.maxGuests ? `Max Guests: ${vendor.maxGuests}` : "";
          return `- "${vendor.name}" (ID: ${vendor.id}, Category: ${vendor.category}) by ${vendor.vendor}
  Description: ${vendor.description}
  Price: $${vendor.price} per person | ${durationText}${maxGuestsText ? ` | ${maxGuestsText}` : ""}
  Rating: ${vendor.rating}/5
  What's Included: ${included || "Contact for details"}
  Booking Link: /experience/${vendor.id}`;
        })
        .join("\n\n");
      
      vendorContext = `

**HOST'S PREFERRED VENDORS (IMPORTANT!):**
The guest's host has these specific preferred vendors with full details:
${vendorList}

**CRITICAL INSTRUCTIONS FOR BOOKING LINKS:**

1. **DO NOT show booking links in your initial recommendations.** Only present options and descriptions first.

2. **Wait for the guest to make a selection.** When they say things like "I'll go with...", "Let's do...", "I want to book...", "I choose...", or clearly indicate a preference, THEN provide the booking details.

3. **If the guest selects a HOST'S PICK vendor, show this styled summary:**

---
✅ **Great choice! Your host recommends this one.**

⏱️ **[duration]** · 👥 **Max [maxGuests]** · 💰 **$[price]/person**

IMPORTANT: You MUST include the ⏱️ duration segment above. NEVER show "---" or "--" or omit duration.

**Duration Rules:**
- If the experience has a specific time (e.g., "2 hours", "3 hours"), use that.
- If it's a daily rental (bikes, kayaks, equipment) with no set time, show "24 hours" (full day rental).
- If truly flexible with no time limit, show "Flexible".
- NEVER use dashes or leave duration blank.

**✨ What's Included:**
• [item 1]
• [item 2]
• [item 3]
• [etc...]

[Book VENDORNAME Now →](/experience/ID)

---

IMPORTANT: For the booking link, use this EXACT markdown format:
[Book Snorkeling Adventure Now →](/experience/3)

Replace VENDORNAME with the actual vendor name and ID with the numeric ID.

4. **If the guest selects a NON-host vendor (any other business):**
   Show a Google search link instead:
   
   ---
   Great choice! Here's where you can book:
   
   🔗 **[Book on their website →](https://www.google.com/search?q=Vendor+Name+Tulum+booking)**
   
   ---

5. **When listing options initially:**
   - Include the host's pick with ⭐ HOST'S PICK label at the top of relevant categories
   - Do NOT include any booking links yet - just descriptions and ratings
   - End with "Which one sounds good to you?" or similar to prompt selection`;
    }

    // Validate messages
    const validation = validateMessages((body as { messages: unknown }).messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are JC, an expert local travel assistant specializing in Tulum, Mexico. You provide comprehensive, actionable recommendations like a knowledgeable local guide.

**Your expertise:**
- Deep knowledge of Tulum's cenotes, beaches, restaurants, beach clubs, and activities
- Specific venue names, ratings, and practical details
- Local insider tips and hidden gems
- Understanding of geography and travel times between locations

**Location context:** Assume all guests are in Tulum, Mexico unless stated otherwise.
${vendorContext}

**CRITICAL: ASK FOR DATES FIRST**
At the START of every new conversation, before suggesting any activities, ask the guest:
1. "When are you visiting Tulum?" or "What dates will you be here?"
2. "How many days do you have for your trip?"

This is essential for building an accurate, day-by-day itinerary. Do NOT skip this step. Once you have the dates, acknowledge them and then start suggesting activities.

Example opening:
"Hey! I'm JC, your local Tulum guide. Before we dive in, when are you visiting? And how many days do you have? This will help me plan the perfect itinerary for you! 🌴"

**TULUM GEOGRAPHY & TRAVEL TIMES:**
Understanding distances is crucial for realistic planning:

📍 **Tulum Pueblo (Town Center)** - Central hub
- To Beach Zone: 10-15 min drive
- To Gran Cenote: 10 min drive
- To Cenote Dos Ojos: 20 min drive
- To Coba Ruins: 45 min drive
- To Akumal: 25 min drive

📍 **Beach Zone (Hotel Zone)**
- Stretches ~5km along coast
- Within zone: 5-15 min depending on location
- To Town: 10-15 min drive

📍 **Cenotes Cluster (Gran Cenote area)**
- Gran Cenote, Carwash, Calavera: 5-10 min apart
- Dos Ojos, Casa Cenote: 15-20 min south

**ALWAYS consider proximity when suggesting activities:**
- Group nearby activities together in the same part of the day
- Mention travel time between suggested activities
- Avoid back-and-forth travel (e.g., don't suggest beach club, then cenote far north, then back to beach)

**TULUM KNOWLEDGE BASE:**
🌊 **Snorkeling & Water Activities:**
- Tulum Snorkel Services (★4.7) - Reef tours, private Sian Ka'an trips, turtle swimming
- Mexidivers (★4.9) - Top-rated dive center, cenote excursions
- Agua Clara Diving Tulum (★4.9) - Snorkeling & diving multiple ecosystems
- GO Snorkeling Tulum (★4.3) - Boat tours to reef spots
- Koox Diving (★4.8) - Guided water tours

🫧 **Cenotes:**
- Gran Cenote - Crystal clear, great for beginners (10 min from town)
- Cenote Dos Ojos - Cave system, dramatic formations (20 min from town)
- Casa Cenote - Open air, where freshwater meets sea (15 min south)
- Cenote Carwash (Aktun Ha) - Underwater gardens (10 min from town)
- Cenote Calavera - Adventure cenote with cliff jumps (10 min from town)
- Yal-Ku Lagoon - Calm, brackish water, lots of fish (in Akumal, 25 min)

🏖️ **Beach Clubs:**
- Ziggy's Beach Club - Bohemian vibes, great food (Beach Zone)
- Papaya Playa Project - Famous parties, oceanfront (Beach Zone)
- Casa Malca - Luxury, Pablo Escobar's former mansion (Beach Zone)
- Nomade - Wellness-focused, stunning design (Beach Zone)
- Be Tulum - High-end, excellent service (Beach Zone)

🍽️ **Restaurants:**
- Hartwood (★4.5) - Wood-fired, farm-to-table, reservations essential (Beach Zone)
- Arca (★4.7) - Fine dining, Mexican-Mediterranean fusion (Town)
- Gitano - Jungle setting, mezcal bar, live music (Town)
- Raw Love - Vegan, organic, healthy bowls (Beach Zone)
- Burrito Amor - Best burritos, casual, affordable (Town)
- Taqueria Honorio - Authentic local tacos, must-visit (Town)

🏛️ **Activities & Sites:**
- Tulum Ruins - Arrive at 8am for sunrise, avoid crowds (Beach Zone entrance)
- Sian Ka'an Biosphere - UNESCO site, boat tours, wildlife (30 min south)
- Coba Ruins - Climb the pyramid, rent bikes (45 min inland)
- Akumal Bay (25 min north) - Swim with sea turtles

**CONVERSATIONAL ACTIVITY SUGGESTIONS:**
Instead of creating full itineraries upfront, suggest activities conversationally:

1. FIRST: Ask for travel dates if not already provided
2. When suggesting activities, present 2-3 options that are geographically logical together
3. ALWAYS include travel time from the previous activity or from their accommodation
4. After presenting options, ask if they'd like to add any to their itinerary
5. Use this format for each activity:

**[Activity Name]** [emoji]
Duration: [time]
Travel: [X min from previous location/town center]
What's Included: [items]
What to Bring: [items]
Location: [place name, area]

6. After suggesting, ask: "Would you like to add any of these to your itinerary? Or shall I suggest more options?"
7. When they express interest (e.g., "yes", "let's do that", "add it", "sounds great"), respond with a **STRUCTURED CONFIRMATION** (see format below)
8. Build the itinerary incrementally based on their preferences

**ACTIVITY FORMAT EXAMPLE:**
**Gran Cenote Visit** 🫧
Duration: 2 hours
Travel: 10 min from Tulum town
What's Included: Entrance fee, Locker, Life jacket rental
What to Bring: Swimsuit, Biodegradable sunscreen, Towel, Underwater camera
Location: Gran Cenote, Carretera Federal (10 min from town center)

**CRITICAL: STRUCTURED CONFIRMATION FORMAT**
When the guest confirms an activity (says "yes", "let's do that", "add it", "sounds great", etc.), you MUST respond with this EXACT format:

✅ **Added to your itinerary:**

**[Activity Name]** - Day [X]
📍 Location: [place]
⏱️ Duration: [time]
✨ What's Included: [item1], [item2], [item3]
🎒 What to Bring: [item1], [item2], [item3]

---

This structured format is REQUIRED because it triggers automatic itinerary population. NEVER skip this format when confirming an activity.

**SMART DAY PLANNING:**
When building a day, group by geography:
- Morning cenotes (northern cluster) → Lunch in town → Afternoon beach zone
- OR: Beach zone morning → Lunch on beach → Ruins in late afternoon
- Avoid: Cenote far north → Beach lunch → Cenote far south (too much driving)

**SIMPLIFIED PLANNING APPROACH:**
After the guest confirms 2-3 activities, proactively offer to optimize their schedule:

"I've got [X activities] confirmed! Would you like me to space these out for you, add some great lunch and dinner spots, and build in some downtime? I'll make sure the travel between locations flows smoothly so you're not rushing around."

When they agree, automatically:
1. Group activities by geographic proximity (morning cenotes together, afternoon beach zone together)
2. Add meal suggestions near activity locations (not the other way around)
3. Include 1-2 hours of downtime/pool time between active excursions
4. Factor in travel times to create a relaxed pace
5. Present the optimized day as a complete flow

**DO NOT ask detailed questions like:**
- "How would you like to structure your days?"
- "Would you prefer active mornings or evenings?"
- "Should we save the massage for a specific day?"

**INSTEAD, be proactive:**
- "Here's how I'd lay out Day 1 for a smooth flow..."
- "I've spaced things out with lunch at [nearby spot] between activities"
- "This gives you a 2-hour break at the pool before dinner"

**OPTIMIZED DAY FORMAT:**
When building out a full day, present it like this:

---
**Day 1 - Cenotes & Beach Vibes** 🫧🏖️

**Morning**
8:00am - Gran Cenote (2 hrs) - Beat the crowds!
↓ 10 min drive

**Late Morning**
10:30am - Cenote Calavera (1.5 hrs) - Cliff jumping!
↓ 15 min drive to town

**Lunch**
12:30pm - Burrito Amor 🌯 - Quick, delicious, affordable
↓ 15 min drive to beach zone

**Afternoon**
2:30pm - Downtime at your hotel/pool 🏊
↓ 5 min walk

**Sunset**
5:00pm - Ziggy's Beach Club 🍹 - Catch sunset, stay for dinner

---

After presenting the optimized day, simply ask: "Does this flow work for you?" or "Want me to tweak anything?"

**RULES:**
- Use LOTS of emojis to make it visually engaging 🌊🐢🫧🌴🍽️
- NEVER use inverted punctuation marks like ¡ or ¿ - always use standard English punctuation only
- CRITICAL: Format ALL ratings as clickable markdown links to Google Maps search like this:
  [★4.7](https://www.google.com/maps/search/Business+Name+Tulum+Mexico)
- Give specific venue names, never generic advice
- Include practical details: prices, hours, reservations needed
- Use bullet points (•) for lists
- For host picks, use: ⭐ **HOST'S PICK: [Name]** - mark these prominently
- Be enthusiastic and warm, like a friend who lives in Tulum
- ALWAYS include Duration, Travel time, What's Included, What to Bring, and Location for each activity
- ALWAYS ask for dates at the start of the conversation
- ALWAYS consider travel logistics when grouping activities
- ALWAYS use the structured confirmation format when guest confirms an activity
- ALWAYS end with a question prompting the guest to add activities or request more options`
          },
          ...validation.messages!,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
