const express = require("express");
const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const SeatBooking = require("../models/SeatBooking");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const busesPath = path.join(__dirname, "../data/buses.json");
const faqPath = path.join(__dirname, "../data/faq.json");
const busesData = JSON.parse(fs.readFileSync(busesPath, "utf8"));
const faqData = JSON.parse(fs.readFileSync(faqPath, "utf8"));

const cityAliases = {
  dhaka: ["dhaka", "ঢাকা", "dacca"],
  chittagong: ["chittagong", "chattogram", "চট্টগ্রাম", "ctg"],
  sylhet: ["sylhet", "সিলেট"],
  rajshahi: ["rajshahi", "রাজশাহী"],
  khulna: ["khulna", "খুলনা"],
  barisal: ["barisal", "বরিশাল"],
  rangpur: ["rangpur", "রংপুর"],
  "cox's bazar": ["cox's bazar", "cox bazar", "coxs bazar", "কক্সবাজার"],
};

const banglaDigits = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/[০-৯]/g, (digit) => banglaDigits[digit] || digit)
    .replace(/[–—→]/g, " to ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalCity(city) {
  const normalized = normalizeText(city);

  for (const [canonical, aliases] of Object.entries(cityAliases)) {
    if (aliases.some((alias) => normalized === normalizeText(alias))) {
      return canonical;
    }
  }

  return normalized;
}

function cityMentioned(message, city) {
  const msg = normalizeText(message);
  const aliases = cityAliases[canonicalCity(city)] || [city];
  return aliases.some((alias) => msg.includes(normalizeText(alias)));
}

function firstAliasIndex(message, city) {
  const msg = normalizeText(message);
  const aliases = cityAliases[canonicalCity(city)] || [city];
  const indexes = aliases
    .map((alias) => msg.indexOf(normalizeText(alias)))
    .filter((index) => index >= 0);

  return indexes.length ? Math.min(...indexes) : -1;
}

function extractRouteFromMessage(message) {
  const directionalMatches = busesData.filter((bus) => {
    const fromIndex = firstAliasIndex(message, bus.startPoint);
    const toIndex = firstAliasIndex(message, bus.destination);
    return fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex;
  });

  if (directionalMatches.length > 0) {
    return directionalMatches;
  }

  return busesData.filter((bus) => {
    return cityMentioned(message, bus.startPoint) && cityMentioned(message, bus.destination);
  });
}

function extractDateFromMessage(message) {
  const msg = normalizeText(message);
  const now = new Date();

  if (msg.includes("today") || msg.includes("আজ")) {
    return now.toISOString().slice(0, 10);
  }

  if (msg.includes("tomorrow") || msg.includes("আগামীকাল")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }

  const isoMatch = msg.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const bdMatch = msg.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (bdMatch) {
    const [, day, month, year] = bdMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function normalizeTime(hour, minute = "00", period = "") {
  let h = Number(hour);
  const m = Number(minute || "00");
  const p = period.toLowerCase();

  if (p.includes("pm") && h < 12) h += 12;
  if (p.includes("am") && h === 12) h = 0;

  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function extractTimeFromMessage(message) {
  const msg = normalizeText(message);

  const colonTimeMatch = msg.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)?\b/);
  const explicitTimeMatch = msg.match(/\b(?:at|time|সময়|সময়)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/);
  const timeMatch = colonTimeMatch || explicitTimeMatch;

  if (!timeMatch) return null;

  const [, hour, minute, period] = timeMatch;
  const time = normalizeTime(hour, minute, period || "");

  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (h > 23 || m > 59) return null;

  return time;
}

function searchFAQ(message) {
  const queryLower = normalizeText(message);
  let bestMatch = null;
  let bestScore = 0;

  const allFAQs = [];
  ["bookingInstructions", "busInformation", "faqs", "searchTips"].forEach((section) => {
    if (faqData[section]) {
      Object.values(faqData[section]).forEach((faq) => allFAQs.push(faq));
    }
  });

  for (const faq of allFAQs) {
    let score = 0;
    const question = normalizeText(faq.question);
    const answer = normalizeText(faq.answer);

    if (question.includes(queryLower)) score += 100;
    if (answer.includes(queryLower)) score += 50;

    queryLower
      .split(" ")
      .filter((word) => word.length > 2)
      .forEach((word) => {
        if (question.includes(word)) score += 15;
        if (answer.includes(word)) score += 5;
      });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore > 20 ? bestMatch : null;
}

function isAvailabilityQuestion(message) {
  const msg = normalizeText(message);
  return [
    "available",
    "availability",
    "seat",
    "seats",
    "ticket",
    "tickets",
    "ফাঁকা",
    "সিট",
    "টিকিট",
    "আছে",
    "কত",
  ].some((word) => msg.includes(word));
}

async function getSeatAvailability(bus, date, departureTime) {
  const bookedSeatDocs = await SeatBooking.find({
    busId: bus.id,
    journeyDate: new Date(date),
    departureTime,
    isBooked: true,
  }).select("seatNumber");

  const bookedSeats = bookedSeatDocs.map((seat) => seat.seatNumber);
  const totalSeats = bus.totalSeats || 42;

  return {
    busId: bus.id,
    busName: bus.busName,
    busNumber: bus.busNumber,
    route: `${bus.startPoint} → ${bus.destination}`,
    departureTime,
    ticketPrice: bus.ticketPrice,
    totalSeats,
    bookedSeats,
    bookedCount: bookedSeats.length,
    availableSeats: Math.max(0, totalSeats - bookedSeats.length),
  };
}

async function buildAvailabilityData(buses, date, requestedTime) {
  const rows = [];

  for (const bus of buses) {
    const times = requestedTime ? [requestedTime] : bus.departureTimes;

    for (const departureTime of times) {
      if (!bus.departureTimes.includes(departureTime)) {
        rows.push({
          busName: bus.busName,
          busNumber: bus.busNumber,
          route: `${bus.startPoint} → ${bus.destination}`,
          departureTime,
          notScheduled: true,
          availableTimes: bus.departureTimes,
        });
        continue;
      }

      rows.push(await getSeatAvailability(bus, date, departureTime));
    }
  }

  return rows;
}

function formatAvailabilityReply(rows, date, requestedTime) {
  const validRows = rows.filter((row) => !row.notScheduled);
  const invalidRows = rows.filter((row) => row.notScheduled);

  if (validRows.length === 0 && invalidRows.length > 0) {
    const first = invalidRows[0];
    return `**${first.route}** রুটে **${date}** তারিখে **${requestedTime}** সময়ে কোনো বাস পাওয়া যায়নি।\n\n**Available departure times:** ${first.availableTimes.join(", ")}`;
  }

  let reply = `**Real-time seat availability from database**\n\n`;
  reply += `**Date:** ${date}\n`;
  if (requestedTime) reply += `**Time:** ${requestedTime}\n`;
  reply += "\n";

  validRows.forEach((row) => {
    reply += `**${row.busName} (${row.busNumber})**\n`;
    reply += `- Route: ${row.route}\n`;
    reply += `- Departure: ${row.departureTime}\n`;
    reply += `- Price: ৳${row.ticketPrice}\n`;
    reply += `- Available tickets: **${row.availableSeats}/${row.totalSeats}**\n`;
    reply += `- Booked seats: ${row.bookedSeats.length ? row.bookedSeats.join(", ") : "None"}\n\n`;
  });

  if (invalidRows.length > 0) {
    reply += `**Not scheduled at requested time:**\n`;
    invalidRows.forEach((row) => {
      reply += `- ${row.busName}: available times ${row.availableTimes.join(", ")}\n`;
    });
  }

  reply += `\n_To book, search this route from the homepage and select your seats._`;
  return reply;
}

function formatBusContext(rows, date) {
  return rows
    .map((row) => {
      if (row.notScheduled) {
        return `${row.busName} (${row.busNumber}) | ${row.route} | Not scheduled at ${row.departureTime} | Available times: ${row.availableTimes.join(", ")}`;
      }

      return `${row.busName} (${row.busNumber}) | ${row.route} | Date: ${date} | Time: ${row.departureTime} | Price: ৳${row.ticketPrice} | Available: ${row.availableSeats}/${row.totalSeats} | Booked seats: ${row.bookedSeats.join(", ") || "None"}`;
    })
    .join("\n");
}

router.post("/message", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const relevantBuses = extractRouteFromMessage(message);
    const requestedDate = extractDateFromMessage(message);
    const requestedTime = extractTimeFromMessage(message);
    const asksAvailability = isAvailabilityQuestion(message);

    if (asksAvailability && relevantBuses.length > 0 && requestedDate) {
      const rows = await buildAvailabilityData(relevantBuses, requestedDate, requestedTime);
      const assistantMessage = formatAvailabilityReply(rows, requestedDate, requestedTime);

      return res.json({
        response: assistantMessage,
        relevantBuses,
        availability: rows,
        conversationHistory: [
          ...conversationHistory,
          { role: "user", content: message },
          { role: "assistant", content: assistantMessage },
        ],
      });
    }

    if (asksAvailability && relevantBuses.length > 0 && !requestedDate) {
      return res.json({
        response:
          "**Please tell me the journey date** so I can check exact database availability.\n\nExample: _Dhaka to Chittagong on 2026-05-10 at 06:00 how many tickets are available?_",
        relevantBuses,
        conversationHistory: [
          ...conversationHistory,
          { role: "user", content: message },
          {
            role: "assistant",
            content:
              "**Please tell me the journey date** so I can check exact database availability.\n\nExample: _Dhaka to Chittagong on 2026-05-10 at 06:00 how many tickets are available?_",
          },
        ],
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY not configured",
        response: "API key not configured. Please set GROQ_API_KEY environment variable.",
      });
    }

    const faqMatch = searchFAQ(message);
    const contextDate = requestedDate || new Date().toISOString().slice(0, 10);
    const contextBuses = relevantBuses.length > 0 ? relevantBuses : busesData.slice(0, 10);
    const rows = await buildAvailabilityData(contextBuses, contextDate, requestedTime);

    let systemPrompt = `You are a helpful BusGo bus ticket booking assistant.

REAL DATABASE BUS AND SEAT DATA:
${formatBusContext(rows, contextDate)}

Rules:
1. Use only the database data above for prices, times, routes, and seat availability.
2. If the user asks exact availability, they must provide a date. Ask for the date if missing.
3. Do not invent buses, prices, times, or seat counts.
4. Format useful answers with Markdown: **bold**, _italic_, and bullet points.
5. Keep answers concise and friendly.
6. Always use Bangladeshi Taka (৳).`;

    if (faqMatch) {
      systemPrompt += `

RELEVANT FAQ:
Q: ${faqMatch.question}
A: ${faqMatch.answer}`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-8).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      max_tokens: 600,
      temperature: 0.2,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content || "I apologize, I could not generate a response.";

    res.json({
      response: assistantMessage,
      relevantBuses,
      conversationHistory: [
        ...conversationHistory,
        { role: "user", content: message },
        { role: "assistant", content: assistantMessage },
      ],
    });
  } catch (error) {
    console.error("Chat error:", error);

    if (error.status === 401) {
      return res.status(401).json({
        error: "Invalid GROQ API Key",
        response: "Authentication failed. Please check your GROQ_API_KEY.",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        response: "I'm currently busy. Please try again in a moment.",
      });
    }

    res.status(500).json({
      error: error.message || "An error occurred",
      response: "Sorry, I encountered an error. Please try again.",
    });
  }
});

router.get("/routes", (req, res) => {
  try {
    const routes = {};

    busesData.forEach((bus) => {
      const routeKey = `${bus.startPoint}-${bus.destination}`;
      if (!routes[routeKey]) {
        routes[routeKey] = [];
      }
      routes[routeKey].push({
        id: bus.id,
        busName: bus.busName,
        price: bus.ticketPrice,
        duration: bus.duration,
        type: bus.busType,
        departures: bus.departureTimes,
      });
    });

    res.json({ routes });
  } catch (error) {
    console.error("Routes error:", error);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

module.exports = router;
