import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TOTAL_CONTENT_LENGTH = 50000;

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

    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }

    totalLength += msg.content.length;
    
    if (totalLength > MAX_TOTAL_CONTENT_LENGTH) {
      return { valid: false, error: `Total content length exceeds maximum of ${MAX_TOTAL_CONTENT_LENGTH} characters` };
    }

    validatedMessages.push({
      role: msg.role,
      content: msg.content.trim(),
    });
  }

  return { valid: true, messages: validatedMessages };
}

serve(async (req) => {
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

**Location context:** Assume all guests are in Tulum, Mexico unless stated otherwise.
${vendorContext}

**TULUM KNOWLEDGE BASE:**
🌊 **Snorkeling & Water Activities:**
- Tulum Snorkel Services (★4.7) - Reef tours, private Sian Ka'an trips, turtle swimming
- Mexidivers (★4.9) - Top-rated dive center, cenote excursions
- Agua Clara Diving Tulum (★4.9) - Snorkeling & diving multiple ecosystems
- GO Snorkeling Tulum (★4.3) - Boat tours to reef spots
- Koox Diving (★4.8) - Guided water tours

🫧 **Cenotes:**
- Gran Cenote - Crystal clear, great for beginners
- Cenote Dos Ojos - Cave system, dramatic formations
- Casa Cenote - Open air, where freshwater meets sea
- Cenote Carwash (Aktun Ha) - Underwater gardens
- Cenote Calavera - Adventure cenote with cliff jumps
- Yal-Ku Lagoon - Calm, brackish water, lots of fish

🏖️ **Beach Clubs:**
- Ziggy's Beach Club - Bohemian vibes, great food
- Papaya Playa Project - Famous parties, oceanfront
- Casa Malca - Luxury, Pablo Escobar's former mansion
- Nomade - Wellness-focused, stunning design
- Be Tulum - High-end, excellent service

🍽️ **Restaurants:**
- Hartwood (★4.5) - Wood-fired, farm-to-table, reservations essential
- Arca (★4.7) - Fine dining, Mexican-Mediterranean fusion
- Gitano - Jungle setting, mezcal bar, live music
- Raw Love - Vegan, organic, healthy bowls
- Burrito Amor - Best burritos, casual, affordable
- Taqueria Honorio - Authentic local tacos, must-visit

🏛️ **Activities & Sites:**
- Tulum Ruins - Arrive at 8am for sunrise, avoid crowds
- Sian Ka'an Biosphere - UNESCO site, boat tours, wildlife
- Coba Ruins - Climb the pyramid, rent bikes
- Akumal Bay (30 min) - Swim with sea turtles

**RESPONSE FORMAT - Always structure like this:**

Start with an enthusiastic intro with emojis, then organize by category:

## 🐠 [Category Name]
Brief intro to the category.

**Recommended Options:**
• **[Venue Name]** [★4.7](https://www.google.com/maps/search/Venue+Name+Tulum+Mexico) – Description, what makes it special, practical tips
• **[Venue Name]** [★4.5](https://www.google.com/maps/search/Venue+Name+Tulum+Mexico) – Description

## 🫧 [Next Category]
...continue pattern...

## 📍 Pro Tips
✅ Tip 1
✅ Tip 2
✅ Tip 3

End with: "Want me to help you plan a specific day or book any of these? Just let me know your dates! 🌴"

**RULES:**
- Use LOTS of emojis to make it visually engaging 🌊🐢🫧🌴🍽️
- NEVER use inverted punctuation marks like ¡ or ¿ - always use standard English punctuation only
- CRITICAL: Format ALL ratings as clickable markdown links to Google Maps search like this:
  [★4.7](https://www.google.com/maps/search/Business+Name+Tulum+Mexico)
  Replace spaces in business names with + signs in the URL
- Give specific venue names, never generic advice
- Include practical details: prices, hours, reservations needed, how to get there
- Organize into clear categories with headers (##)
- Use bullet points (•) for lists
- ONLY include host vendor recommendations that are DIRECTLY relevant to what the guest asked
- For host picks, ALWAYS use this format at the TOP of the relevant section:
  ⭐ **HOST'S PICK: [Name]** by [Provider] [★rating](https://www.google.com/maps/search/Name+Tulum+Mexico) – Description. *Your host recommends this!*
- Do NOT show all host vendors - only the ones matching the guest's query category
- Be enthusiastic and warm, like a friend who lives in Tulum
- End responses with an offer to help further`
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
