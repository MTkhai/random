# 🎲 RANS — Random All-in-One System

> A minimalist, high-entropy web application that provides a suite of 12 random utilities powered by a multi-source entropy mixing engine.

---

## ⚡ Key Features

* **🌪️ Multi-Source Entropy Engine**: Moves beyond standard `Math.random()` by blending 5 noise sources into a SHA-256 seed pool:
  * CSPRNG (`crypto.getRandomValues`)
  * Hardware Audio Context Noise
  * Real-time User Mouse Behavior
  * Network Latency / Encrypted DNS
  * Real-time Weather Data API
* **⚡ Zero-Framework SPA Architecture**: Built with pure Vanilla JS modules, Lucide Icons, and custom CSS variables. Ultra-fast startup with zero bundle overhead.
* **🎛️ Minimalist Adaptive Layout**:
  * Collapsible 3-block vertical sidebar
  * On-the-fly Left/Right position switching
  * Integrated Dark / Light theme toggle
  * Slide-over Global History Drawer backed by `localStorage`

---

## 🧰 The 12 Tool Modules

1. **Number Generator**: Range-based generation with unique/float support.
2. **Custom Spinner**: Interactive wheel picker for custom item lists.
3. **Flip a Coin**: Quick binary heads/tails decider.
4. **Roll a Dice**: Multi-dice simulator (1 to 4 dice).
5. **Group Generator**: Randomly divides items into custom groups.
6. **Color Palette**: Palette generator with HEX/RGB live preview.
7. **Random Quotes**: Inspirational and tech quotes stream.
8. **Food Picker**: Interactive food decision box for daily choices.
9. **Card Drawer**: Standard deck card drawer simulator.
10. **Image Placeholder**: Dynamic placeholder generator.
11. **Password Generator**: Configurable high-entropy security credentials.
12. **Time Info**: Random timestamp & timezone info utilities.

---

## 📁 Project Structure

```text
├── index.html            # Main SPA Dashboard Container
├── index.css             # Core CSS Variable Design System
├── engine/
│   ├── entropy.js        # Multi-source Entropy Pool & SHA-256 Mixer
│   ├── history.js        # Global History Drawer Manager
│   └── modules/          # 12 Independent Tool Engines
│       ├── number.js
│       ├── spinner.js
│       ├── coin.js
│       └── ...
└── bootstrap/
    ├── app.js            # Global App Initializer & State Manager
    └── router.js         # Dynamic Hash Router
