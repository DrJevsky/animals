# 🦊 Animal Ecosystem Simulation 🌿

An interactive web-based simulation of an animal ecosystem with predator-prey dynamics, reproduction, and genetic trait inheritance.

## 🎮 Live Demo

Simply open [`this page`](https://drjevsky.github.io/animals/) in a web browser to run the simulation!

## ✨ Features

### 5 Different Animal Species
- **🐰 Rabbits** - Fast-breeding herbivores that feed on vegetation
- **🦌 Deer** - Larger herbivores with better vision and slower reproduction
- **🦊 Foxes** - Small predators that hunt rabbits
- **🐺 Wolves** - Pack predators that hunt deer
- **🐻 Bears** - Apex predators that can hunt any animal

### Realistic Ecosystem Mechanics
- **Health & Lifespan**: Animals age over time and have health that decreases when starving or aging
- **Hunger System**: Animals must feed to survive; herbivores eat vegetation, carnivores hunt other animals
- **Gender & Reproduction**: Male and female animals must meet to reproduce
- **Genetic Traits**: Animals have inheritable traits (speed, size, vision, reproduction rate) that pass to offspring with mutations
- **Population Dynamics**: Predator-prey relationships create a balanced ecosystem
- **Vegetation Growth**: Plants grow back over time to sustain herbivores

### Interactive Controls
- **Pause/Resume** - Stop and start the simulation
- **Speed Up/Slow Down** - Adjust simulation speed (0.5x to 5x)
- **Reset** - Restart the simulation with initial populations
- **Show/Hide Trails** - Toggle visual trails showing animal movement

### Visual Features
- Beautiful gradient design with modern UI
- Real-time population statistics by species and gender
- Health bars on each animal
- Gender indicators (blue for males, pink for females)
- Movement trails showing animal paths
- Responsive canvas that adapts to screen size

## 🚀 How to Run

### Option 1: Direct Browser
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Watch the ecosystem come to life!

### Option 2: Local Server
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

## 🎯 How It Works

The simulation runs in real-time on an HTML5 canvas. Each frame:

1. **Animals update their state**: aging, hunger, health
2. **Decision making**: Animals search for food or mates based on their needs
3. **Movement**: Animals roam randomly or move toward targets
4. **Feeding**: Herbivores consume vegetation, predators hunt prey
5. **Reproduction**: Compatible mates produce offspring with inherited traits
6. **Natural selection**: Weak or old animals die, removing them from the population
7. **Vegetation regrowth**: Plants slowly grow back to sustain the ecosystem

## 🧬 Genetic System

Each animal has unique traits that are inherited:
- **Speed**: How fast the animal moves
- **Size**: Physical size of the animal
- **Vision**: How far the animal can detect food/mates
- **Reproduction Rate**: How quickly the animal can reproduce again

When two animals mate, their offspring inherits traits from both parents with small random mutations, allowing evolution over generations.

## 📊 Population Dynamics

Watch as the ecosystem self-balances:
- Herbivore populations grow when vegetation is abundant
- Predator populations grow when prey is plentiful
- Overpopulation of predators can lead to prey extinction
- System can reach equilibrium or experience boom-bust cycles

## 🛠️ Technical Details

- **Pure JavaScript** - No external dependencies
- **HTML5 Canvas** - Smooth 60 FPS rendering
- **Object-Oriented Design** - Clean class hierarchy for extensibility
- **Vector Mathematics** - Realistic movement and physics
- **Responsive Design** - Works on desktop and tablets

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Feel free to fork this project and experiment with:
- Adding new animal species
- Adjusting behavior parameters
- Creating new environmental factors (water, shelter, weather)
- Implementing more complex AI behaviors
- Adding sound effects or music

Enjoy watching nature unfold in this digital ecosystem! 🌍
