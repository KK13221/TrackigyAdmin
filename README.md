# Trackify Premium Fleet Management 🚀

Trackify Admin is a high-fidelity, pixel-perfect frontend logistics dashboard. It was completely restored and reverse-engineered from advanced V2 design prototypes, ensuring flawless data parity, beautiful map integrations, and elite system performance tracking. 

## 🌟 Key Features

* **Advanced Layout Engine:** Completely custom DOM injections per-view, including standard-padded dashboards and edge-to-edge full-bleed windows for maps.
* **Live Tracking (V2):** Powered by an integrated **Leaflet Map** running custom dark satellite themes (ESRI imagery overlays) and precise polyline routes. Includes full timeline steppers and glowing telemetry widgets.
* **Vehicle & Fleet Management:** Detailed reporting lists with multi-step dropdown filters, status capsules (`• In Transit`, `! Maintenance`), and dynamic HTML health progress bars.
* **Driver Directory Ecosystem:** Implemented via a responsive masonry grid. Features deep personnel telemetry, star ratings, and real-time status dots overlapping detailed driver avatars.
* **Split-Pane Dispatch Board:** An ultra-complex dispatch view featuring a vertical scroll of critical pending orders on the left, next to a fully interactive Light Grid map overlaid with AI-recommendation cards routing assets in real time. 
* **Seamless In-Browser Routing:** State-based routing loads HTML modules purely via Javascript, preventing slow page reloads and instantly swapping interface modes matching specific URL states.

## 🛠 Tech Stack

* **HTML5:** Highly semantic and dynamically parsed shell. 
* **CSS3:** Custom layout system built manually with complex positioning and Flex/Grid parameters matching the rigorous Figma/Stitch mockups.
* **Vanilla JavaScript:** Fast, modular, dependency-free application logic handling view swaps, component injection, and map orchestration.
* **Leaflet.js:** Advanced mapping API integrated uniquely per screen layer (Dark satellite vs Light roadmap).
* **Material Icons:** Crisp, standardized internal vector typography for all UX actions.

## ⚙️ Installation & Usage

Since this is a lightweight Vanilla JS & CSS stack, zero build tools or dependencies are necessary. 

1. **Clone the repository:**
   \`\`\`cmd
   git clone https://github.com/KK13221/TrackigyAdmin.git
   \`\`\`
2. **Navigate to the directory:**
   \`\`\`cmd
   cd TrackigyAdmin/"Admin portal"
   \`\`\`
3. **Run the local environment:**
   You can serve the HTML file securely using a simple server component like `npx serve` or any live-server extension in VSCode.
   \`\`\`cmd
   npx serve ./
   \`\`\`
4. Access the dashboard via \`http://localhost:3000/\`. Currently routing initializes natively to the primary `/dashboard` view state. 
