// server/src/seed/seed.js
// Run with: npm run seed
// Populates MongoDB with realistic-looking YT clone data:
//   8 channels · 40 videos · 6 categories · real thumbnails · real comments

import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.model.js";
import Channel from "../models/Channel.model.js";
import Video from "../models/Video.model.js";
import Comment from "../models/Comment.model.js";
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Three reliable public video URLs (different hosts)
const TEST_VIDEOS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.webm",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
];

// ---------------------------------------------------------------------------
// Thumbnails — Unsplash category-matched images (no API key needed)
// ---------------------------------------------------------------------------
const thumbs = {
  "Web Development": [
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?w=640&h=360&fit=crop",
  ],
  "JavaScript": [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=640&h=360&fit=crop",
  ],
  "Data Structures": [
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1456428746267-a1756408f782?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&h=360&fit=crop",
  ],
  "Music": [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=640&h=360&fit=crop",
  ],
  "Gaming": [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1585620385456-4759f9b5c7d9?w=640&h=360&fit=crop",
  ],
  "Education": [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=640&h=360&fit=crop",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=640&h=360&fit=crop",
  ],
};

const thumbPick = (cat, idx) => thumbs[cat][idx % thumbs[cat].length];

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const USERS_DEF = [
  { username: "john_codes",  email: "john@example.com",  password: "Password@123", avatar: "https://i.pravatar.cc/150?img=1"  },
  { username: "priya_dev",   email: "priya@example.com", password: "Password@123", avatar: "https://i.pravatar.cc/150?img=5"  },
  { username: "alex_builds", email: "alex@example.com",  password: "Password@123", avatar: "https://i.pravatar.cc/150?img=8"  },
  { username: "nikhil_xo",   email: "nikhil@example.com",password: "Password@123", avatar: "https://i.pravatar.cc/150?img=12" },
  { username: "sara_music",  email: "sara@example.com",  password: "Password@123", avatar: "https://i.pravatar.cc/150?img=20" },
  { username: "dev_anon",    email: "dev@example.com",   password: "Password@123", avatar: "https://i.pravatar.cc/150?img=33" },
  { username: "gamer_rahul", email: "rahul@example.com", password: "Password@123", avatar: "https://i.pravatar.cc/150?img=47" },
  { username: "learnwithme", email: "learn@example.com", password: "assword@123", avatar: "https://i.pravatar.cc/150?img=60" },
];

// ✅ FIXED: changed 'channelBanner' to 'banner' to match the Channel model
const CHANNELS_DEF = [
  { channelName: "CodeWithJohn",  handle: "@CodeWithJohn",  ownerIdx: 0, subscribers: 128400,
    description: "Full-stack web development tutorials — React, Node.js, MongoDB and more.",
    banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=1" },
  { channelName: "Priya Codes",   handle: "@PriyaCodes",    ownerIdx: 1, subscribers: 87200,
    description: "JavaScript, TypeScript & frontend performance tips for modern developers.",
    banner: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=5" },
  { channelName: "AlgoMaster",    handle: "@AlgoMaster",    ownerIdx: 2, subscribers: 210000,
    description: "Data structures, algorithms, and competitive programming explained visually.",
    banner: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=8" },
  { channelName: "Nikhil Plays",  handle: "@NikhilPlays",   ownerIdx: 3, subscribers: 345000,
    description: "Gaming highlights, walkthroughs, and reviews. GTA, Valorant, and more!",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=12" },
  { channelName: "Sara Beats",    handle: "@SaraBeats",     ownerIdx: 4, subscribers: 95000,
    description: "Lo-fi, chillhop, and music production tutorials. Beats to study and relax to.",
    banner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=20" },
  { channelName: "DevAnon",       handle: "@DevAnon",       ownerIdx: 5, subscribers: 62000,
    description: "Anonymous dev takes on tech, open source, and the daily grind of software engineering.",
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=33" },
  { channelName: "Rahul GG",      handle: "@RahulGG",       ownerIdx: 6, subscribers: 189000,
    description: "Speedruns, esports highlights, and game reviews from India's gaming scene.",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=47" },
  { channelName: "LearnWithMe",   handle: "@LearnWithMe",   ownerIdx: 7, subscribers: 415000,
    description: "Bite-sized education: science, history, maths, and general knowledge.",
    banner: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1280&h=350&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=60" },
];

const VIDEO_SEED = [
  // Web Development
  { title: "Build a Full-Stack App with MERN in 1 Hour",           category: "Web Development", channelIdx: 0, uploaderIdx: 0, views: 412000, likes: 18400, dislikes: 340, thumbIdx: 0 },
  { title: "React 18 New Features You Need to Know",               category: "Web Development", channelIdx: 0, uploaderIdx: 0, views: 287000, likes: 11200, dislikes: 180, thumbIdx: 1 },
  { title: "Next.js 14 App Router Deep Dive",                      category: "Web Development", channelIdx: 0, uploaderIdx: 0, views: 198000, likes:  9300, dislikes: 210, thumbIdx: 2 },
  { title: "Tailwind CSS From Zero to Production",                  category: "Web Development", channelIdx: 1, uploaderIdx: 1, views: 153000, likes:  7100, dislikes:  95, thumbIdx: 3 },
  { title: "REST API Design Best Practices in 2024",               category: "Web Development", channelIdx: 0, uploaderIdx: 0, views:  94000, likes:  4800, dislikes:  60, thumbIdx: 4 },
  { title: "Docker for Web Developers — Complete Guide",           category: "Web Development", channelIdx: 5, uploaderIdx: 5, views: 321000, likes: 15600, dislikes: 270, thumbIdx: 5 },
  { title: "CSS Grid vs Flexbox — When to Use Which",             category: "Web Development", channelIdx: 1, uploaderIdx: 1, views: 245000, likes: 12100, dislikes: 150, thumbIdx: 0 },
  // JavaScript
  { title: "JavaScript Closures Explained Once and For All",       category: "JavaScript",      channelIdx: 1, uploaderIdx: 1, views: 534000, likes: 24700, dislikes: 310, thumbIdx: 0 },
  { title: "Async/Await vs Promises: What's the Difference?",     category: "JavaScript",      channelIdx: 0, uploaderIdx: 0, views: 378000, likes: 17200, dislikes: 240, thumbIdx: 1 },
  { title: "JavaScript Event Loop Visualised",                     category: "JavaScript",      channelIdx: 5, uploaderIdx: 5, views: 612000, likes: 29800, dislikes: 410, thumbIdx: 2 },
  { title: "TypeScript in 100 Seconds",                            category: "JavaScript",      channelIdx: 1, uploaderIdx: 1, views: 891000, likes: 41000, dislikes: 520, thumbIdx: 3 },
  { title: "ES2024 New Features Every Developer Should Know",      category: "JavaScript",      channelIdx: 5, uploaderIdx: 5, views: 167000, likes:  8400, dislikes: 110, thumbIdx: 4 },
  { title: "Mastering the JavaScript 'this' Keyword",             category: "JavaScript",      channelIdx: 1, uploaderIdx: 1, views: 298000, likes: 14100, dislikes: 195, thumbIdx: 5 },
  // Data Structures
  { title: "Binary Search Trees — Full Course",                    category: "Data Structures", channelIdx: 2, uploaderIdx: 2, views: 445000, likes: 22300, dislikes: 280, thumbIdx: 0 },
  { title: "Linked Lists vs Arrays: Which is Faster?",            category: "Data Structures", channelIdx: 2, uploaderIdx: 2, views: 289000, likes: 13700, dislikes: 160, thumbIdx: 1 },
  { title: "Dynamic Programming Patterns That Actually Stick",     category: "Data Structures", channelIdx: 2, uploaderIdx: 2, views: 712000, likes: 35400, dislikes: 490, thumbIdx: 2 },
  { title: "Graph Algorithms Visualised: BFS and DFS",            category: "Data Structures", channelIdx: 2, uploaderIdx: 2, views: 381000, likes: 18900, dislikes: 220, thumbIdx: 3 },
  { title: "Hash Maps Explained — From Scratch in JS",            category: "Data Structures", channelIdx: 5, uploaderIdx: 5, views: 234000, likes: 11400, dislikes: 130, thumbIdx: 4 },
  { title: "Heaps and Priority Queues Made Simple",               category: "Data Structures", channelIdx: 2, uploaderIdx: 2, views: 196000, likes:  9700, dislikes:  95, thumbIdx: 5 },
  // Music
  { title: "1 Hour Lo-fi Hip Hop — Study & Relax",               category: "Music",           channelIdx: 4, uploaderIdx: 4, views: 2140000, likes: 87000, dislikes: 1200, thumbIdx: 0 },
  { title: "How to Make a Lo-fi Beat from Scratch (FL Studio)",  category: "Music",           channelIdx: 4, uploaderIdx: 4, views:  387000, likes: 19100, dislikes:  260, thumbIdx: 1 },
  { title: "Music Theory for Producers — The Basics",            category: "Music",           channelIdx: 4, uploaderIdx: 4, views:  543000, likes: 27200, dislikes:  380, thumbIdx: 2 },
  { title: "Synthwave Coding Playlist — 2 Hours No Ads",         category: "Music",           channelIdx: 4, uploaderIdx: 4, views: 1320000, likes: 56000, dislikes:  830, thumbIdx: 3 },
  { title: "How to Mix and Master Your Beats at Home",           category: "Music",           channelIdx: 4, uploaderIdx: 4, views:  228000, likes: 11300, dislikes:  140, thumbIdx: 4 },
  // Gaming
  { title: "Valorant Radiant Guide — Aim & Game Sense",          category: "Gaming",          channelIdx: 3, uploaderIdx: 3, views: 1870000, likes: 74000, dislikes: 1900, thumbIdx: 0 },
  { title: "Top 10 Moments of the Week — BGMI Edition",          category: "Gaming",          channelIdx: 6, uploaderIdx: 6, views:  980000, likes: 43200, dislikes:  620, thumbIdx: 1 },
  { title: "GTA 5 Speedrun Any% in 5:53 (World Record Attempt)", category: "Gaming",          channelIdx: 6, uploaderIdx: 6, views: 2540000, likes: 112000, dislikes: 2100, thumbIdx: 2 },
  { title: "Elden Ring All Bosses Ranked — No Deaths Run",       category: "Gaming",          channelIdx: 3, uploaderIdx: 3, views:  673000, likes: 31500, dislikes:  840, thumbIdx: 3 },
  { title: "Minecraft Survival Series Ep. 1 — Starting Fresh",   category: "Gaming",          channelIdx: 3, uploaderIdx: 3, views:  412000, likes: 20300, dislikes:  190, thumbIdx: 4 },
  { title: "Best Free-to-Play Games in 2024 You're Missing",     category: "Gaming",          channelIdx: 6, uploaderIdx: 6, views:  894000, likes: 39700, dislikes: 1100, thumbIdx: 5 },
  // Education
  { title: "How Neural Networks Actually Work",                   category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 3120000, likes: 143000, dislikes: 2400, thumbIdx: 0 },
  { title: "The History of the Internet in 12 Minutes",          category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 1450000, likes:  63200, dislikes:  980, thumbIdx: 1 },
  { title: "What Is Quantum Computing? (No Maths)",              category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 2280000, likes:  98500, dislikes: 1600, thumbIdx: 2 },
  { title: "How GPS Works — The Full Explanation",               category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 1720000, likes:  79000, dislikes: 1100, thumbIdx: 3 },
  { title: "Why Most People Are Bad at Maths (And How to Fix)",  category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 4310000, likes: 198000, dislikes: 3800, thumbIdx: 4 },
  { title: "Black Holes Explained — From Beginning to End",      category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 5620000, likes: 247000, dislikes: 4100, thumbIdx: 5 },
  { title: "The Science of Sleep — Why You're Always Tired",     category: "Education",       channelIdx: 7, uploaderIdx: 7, views: 3870000, likes: 172000, dislikes: 2900, thumbIdx: 0 },
];

// Descriptions keyed by title
const DESCRIPTIONS = {
  "Build a Full-Stack App with MERN in 1 Hour": "Build a complete Todo app from scratch using MongoDB, Express, React and Node.js. No experience needed — just code along!",
  "React 18 New Features You Need to Know": "Concurrent rendering, automatic batching, useTransition and Suspense — everything new in React 18 with runnable examples.",
  "Next.js 14 App Router Deep Dive": "Server Components, nested layouts, loading UI, error boundaries — the App Router changes everything. Let's break it down.",
  "Tailwind CSS From Zero to Production": "Learn utility-first CSS by building a real landing page. Installation to Vercel deployment in under 45 minutes.",
  "REST API Design Best Practices in 2024": "Versioning, pagination, error shapes, auth patterns — everything to design an API developers actually enjoy using.",
  "Docker for Web Developers — Complete Guide": "Containerise your Node.js backend, React frontend, and MongoDB with Docker Compose. Includes multi-stage production builds.",
  "CSS Grid vs Flexbox — When to Use Which": "Stop guessing. Visual comparison of Grid and Flexbox with real-world layout examples that make the choice obvious.",
  "JavaScript Closures Explained Once and For All": "Closures trip up every JS dev at some point. Clear diagrams and four real-world use cases to make them stick forever.",
  "Async/Await vs Promises: What's the Difference?": "We trace through the event loop, compare syntax side-by-side, and cover error handling to help you decide which to use.",
  "JavaScript Event Loop Visualised": "Call stack, task queue, microtask queue — animated from scratch so you finally understand why setTimeout(fn, 0) isn't instant.",
  "TypeScript in 100 Seconds": "A lightning overview of TypeScript's type system. Generics, union types, interfaces, utility types — all in under 2 minutes.",
  "ES2024 New Features Every Developer Should Know": "Array.fromAsync, Promise.withResolvers, the new pipeline operator proposal, and everything else landing in ES2024.",
  "Mastering the JavaScript 'this' Keyword": "Arrow functions, .bind(), classes, and strict mode — every context where 'this' changes, with tests you can run in the console.",
  "Binary Search Trees — Full Course": "Insert, search, delete, all traversals, balancing — everything BSTs in one sitting with animated walkthroughs.",
  "Linked Lists vs Arrays: Which is Faster?": "Time-complexity analysis, cache locality, and benchmarks. We code both from scratch in JS and measure real performance.",
  "Dynamic Programming Patterns That Actually Stick": "Top-down vs bottom-up, memoisation tables, 10 classic DP problems solved and categorised by pattern for interviews.",
  "Graph Algorithms Visualised: BFS and DFS": "We build an interactive graph explorer and trace BFS and DFS step by step — shortest path, connectivity, cycle detection.",
  "Hash Maps Explained — From Scratch in JS": "Hashing functions, collision handling, load factor, amortised O(1) — all implemented live in 35 minutes.",
  "Heaps and Priority Queues Made Simple": "Min-heap, max-heap, heap sort, and the k-th largest element problem. Animations + code in one beginner-friendly package.",
  "1 Hour Lo-fi Hip Hop — Study & Relax": "Chill beats to code, study, or unwind to. No ads in the middle, no interruptions — just the music.",
  "How to Make a Lo-fi Beat from Scratch (FL Studio)": "Sample chopping, jazzy chords, dusty drums, vinyl crackle — produce a full lo-fi track in real time from an empty project.",
  "Music Theory for Producers — The Basics": "Scales, intervals, chord progressions, and song structure for bedroom producers who never studied music formally.",
  "Synthwave Coding Playlist — 2 Hours No Ads": "Retro synths, driving beats, and electric guitar. The perfect soundtrack for late-night coding sessions.",
  "How to Mix and Master Your Beats at Home": "EQ, compression, reverb, stereo imaging, loudness normalisation — practical mixing on free plugins in your DAW.",
  "Valorant Radiant Guide — Aim & Game Sense": "Movement, crosshair placement, economy management, and map control — everything separating Radiant players from Gold.",
  "Top 10 Moments of the Week — BGMI Edition": "Clutch plays, insane sniper shots, and squad wipes from the BGMI community. Submissions open in the description!",
  "GTA 5 Speedrun Any% in 5:53 (World Record Attempt)": "Every glitch, skip, and frame-perfect input required to finish GTA 5 in under 6 minutes. Route explanation + live commentary.",
  "Elden Ring All Bosses Ranked — No Deaths Run": "I played through every Elden Ring boss back-to-back without dying. Here's the tier list and honest hot takes.",
  "Minecraft Survival Series Ep. 1 — Starting Fresh": "New world, new rules — hardcore survival with zero mods. Join me for episode one of a series that might end very quickly.",
  "Best Free-to-Play Games in 2024 You're Missing": "Six underrated free games across PC, mobile, and console. Honest impressions after 20+ hours each.",
  "How Neural Networks Actually Work": "Perceptrons, activation functions, backpropagation, gradient descent — explained without any maths beyond multiplication.",
  "The History of the Internet in 12 Minutes": "ARPANET, TCP/IP, the World Wide Web, broadband, and the mobile revolution — 60 years of internet history in 12 minutes.",
  "What Is Quantum Computing? (No Maths)": "Qubits, superposition, entanglement, and quantum advantage — explained to someone who hasn't studied physics since school.",
  "How GPS Works — The Full Explanation": "Satellites, trilateration, atomic clocks, and relativistic corrections — the complete science behind how your phone knows where you are.",
  "Why Most People Are Bad at Maths (And How to Fix)": "The cognitive science behind maths anxiety, how school gets it wrong, and a practical method for rebuilding number sense.",
  "Black Holes Explained — From Beginning to End": "Formation, event horizons, Hawking radiation, spaghettification, and what happens if you fall in. No PhD required.",
  "The Science of Sleep — Why You're Always Tired": "Circadian rhythms, sleep stages, adenosine, blue light, and the one habit change that will actually help you wake up rested.",
};

const COMMENT_POOLS = {
  "Web Development": [
    "This is exactly what I needed before my interview next week 🙏",
    "Finally a tutorial that explains WHY, not just how. Subscribed!",
    "I've watched like 10 videos on this and yours is the first one that clicked.",
    "The code repo link in the description is a lifesaver, thanks!",
    "Can you do a follow-up on adding authentication to this?",
    "Spent 3 hours debugging this yesterday and then found your video 😭",
    "Why isn't this channel bigger?? Genuinely the best explanation out there.",
    "The timestamps in the description are 🔥 exactly what every tutorial needs",
    "Just deployed this to Vercel, works perfectly. Thank you!",
    "I love how you explain the concept before coding. Most tutorials just type and expect you to follow.",
  ],
  "JavaScript": [
    "The closure analogy at 4:20 finally made it click for me after 2 years.",
    "Please never stop making videos, this channel is my university at this point.",
    "Bookmarked this for the next time I have to explain closures to a junior.",
    "The animation really helps. Way better than reading MDN docs.",
    "I failed a Google interview question on this exact topic 😅 not anymore.",
    "This is the kind of content that should be in every bootcamp curriculum.",
    "The 'this' keyword video + this one = complete picture 🎯",
    "Actual question: does this behaviour change in strict mode?",
    "I showed this to my team and now everyone actually understands it. Legend.",
    "Please do one on WeakMap and WeakRef next! Underrated JS feature.",
  ],
  "Data Structures": [
    "The visual animations are incredible. Paused at every step to make sure I got it.",
    "I've been using BSTs for years and I learned 3 things from this video.",
    "Just got asked this in a FAANG interview. Wish I had watched earlier 😂",
    "The time complexity explanation at the end is something every course skips.",
    "Can you do one on Red-Black Trees next? My textbook makes them look impossible.",
    "This is better than my $200 Udemy course. Not even joking.",
    "The 'when to use which' recap at the end is pure gold.",
    "Literally paused, implemented it myself, came back. Best way to learn.",
    "You explained deletion in a BST clearer than any source I've found.",
    "LeetCode problem 235 unlocked after watching this 🙌",
  ],
  "Music": [
    "This playlist has been in my ears for 6 months straight 🎧",
    "The drop at 23:47 is unreal. Peak lo-fi moment.",
    "I fell asleep to this and had the most vivid coding dreams lol",
    "Can I use this in my YouTube video? (credited of course)",
    "This is how I get through long study sessions. Thank you for making this.",
    "The production quality is insane for a free upload. Seriously underrated.",
    "I've shared this with my entire study group. Everyone loves it.",
    "Please put this on Spotify!! I need it offline.",
    "3am, dark room, this playlist on loop = peak productivity",
    "How do you make the drums sound so vintage? Please do a tutorial!",
  ],
  "Gaming": [
    "The play at 12:33 is literally one of the best clips I've ever seen.",
    "Okay the speedrun commentary is absolutely hilarious, subbing immediately.",
    "I've been playing this game for 2 years and learned something new from this.",
    "The editing in this video is insane. How long does this take to put together?",
    "You deserve way more subscribers. Top 3 gaming channel on the platform.",
    "The ending got me 😂😂😂 did NOT see that coming.",
    "Yo the strats in this guide actually work. Hit Diamond last night using them.",
    "Clip at 8:15 sent me. The timing on that 🐐",
    "I showed this to my little brother and now he's obsessed.",
    "This is the content I subscribed for. More episodes please!!",
  ],
  "Education": [
    "I have a Master's degree and I still learned something from this. That's rare.",
    "Showed this to my 14-year-old cousin and she immediately got it.",
    "The graphics team deserves a raise. Every frame adds something.",
    "I shared this on our school's WhatsApp group. Teacher approved it! 😄",
    "This channel is the reason I'm applying to physics now.",
    "More people have watched this than read the Wikipedia article.",
    "The analogy at 6:22 is so good I described it to my parents and they understood.",
    "You covered something my professor took 3 lectures to explain. In 12 minutes.",
    "Subscribed, liked, and saved. This is permanently going in my study playlist.",
    "If only schools taught things this way. We'd have so many more scientists.",
  ],
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const run = async () => {
  await connectDB();

  console.log("🗑  Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Channel.deleteMany({}),
    Video.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  console.log("👤 Creating users...");
  const users = await User.create(USERS_DEF);

  console.log("📺 Creating channels...");
  // ✅ FIXED: using 'banner' instead of 'channelBanner'
  const channels = await Channel.create(
    CHANNELS_DEF.map((c) => ({
      channelName: c.channelName,
      handle: c.handle,
      owner: users[c.ownerIdx]._id,
      description: c.description,
      banner: c.banner,
      avatar: c.avatar,
      subscribers: c.subscribers,
    }))
  );
  for (let i = 0; i < CHANNELS_DEF.length; i++) {
    await User.findByIdAndUpdate(users[CHANNELS_DEF[i].ownerIdx]._id, {
      $push: { channels: channels[i]._id },
    });
  }

  console.log("🎬 Creating videos...");
  const now = Date.now();
  const EIGHTEEN_MONTHS_MS = 18 * 30 * 24 * 60 * 60 * 1000;
  const allUserIds = users.map((u) => u._id);

  const videoDocuments = VIDEO_SEED.map((v) => {
    const likeCount  = Math.min(v.likes  % users.length || 1, users.length);
    const dislikeCount = Math.min(v.dislikes % users.length, users.length);
    return {
      title: v.title,
      description: DESCRIPTIONS[v.title] || `${v.title} — sample video for testing.`,
      thumbnailUrl: thumbPick(v.category, v.thumbIdx),
      videoUrl: pick(TEST_VIDEOS),
      category: v.category,
      channel: channels[v.channelIdx]._id,
      uploader: users[v.uploaderIdx]._id,
      views: v.views,
      likes: shuffle(allUserIds).slice(0, likeCount),
      dislikes: shuffle(allUserIds).slice(0, dislikeCount),
      createdAt: new Date(now - rand(0, EIGHTEEN_MONTHS_MS)),
    };
  });

  const videos = await Video.create(videoDocuments);
  for (const video of videos) {
    await Channel.findByIdAndUpdate(video.channel, { $push: { videos: video._id } });
  }

  console.log("💬 Creating comments...");
  const commentDocs = [];
  for (const video of videos) {
    const pool = COMMENT_POOLS[video.category] ?? COMMENT_POOLS["Education"];
    const texts = shuffle(pool).slice(0, rand(3, 7));
    for (const text of texts) {
      commentDocs.push({
        video: video._id,
        user: users[rand(0, users.length - 1)]._id,
        text,
        createdAt: new Date(video.createdAt.getTime() + rand(0, 30 * 24 * 60 * 60 * 1000)),
      });
    }
  }
  await Comment.create(commentDocs);

  const catCounts = VIDEO_SEED.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  console.log("\n✅ Seed complete!");
  console.log(`   ${users.length} users | ${channels.length} channels | ${videos.length} videos | ${commentDocs.length} comments`);
  Object.entries(catCounts).forEach(([cat, n]) => console.log(`     • ${cat}: ${n}`));

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});