// Ecosystem Simulation Engine
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / mag, this.y / mag);
    }

    distance(v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }
}

// Vegetation class
class Vegetation {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.energy = 20 + Math.random() * 30;
        this.maxEnergy = 50;
        this.size = 3 + (this.energy / this.maxEnergy) * 3;
        this.growthRate = 0.05;
    }

    grow() {
        if (this.energy < this.maxEnergy) {
            this.energy += this.growthRate;
            this.size = 3 + (this.energy / this.maxEnergy) * 3;
        }
    }

    consume(amount) {
        const consumed = Math.min(this.energy, amount);
        this.energy -= consumed;
        this.size = 3 + (this.energy / this.maxEnergy) * 3;
        return consumed;
    }

    isDepleted() {
        return this.energy <= 0;
    }
}

// Base Animal class
class Animal {
    constructor(x, y, species, gender = null) {
        this.species = species;
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.gender = gender || (Math.random() > 0.5 ? 'male' : 'female');
        
        // Traits (inheritable)
        this.traits = this.initializeTraits();
        
        // State
        this.health = 100;
        this.maxHealth = 100;
        this.age = 0;
        this.maxAge = this.species.lifespan;
        this.hunger = 0;
        this.maxHunger = 100;
        this.reproductionCooldown = 0;
        this.reproductionReady = this.species.reproductionAge;
        
        // Visual
        this.size = this.traits.size;
        this.angle = Math.random() * Math.PI * 2;
        this.trail = [];
        
        // Behavior state for visual indication
        this.currentBehavior = 'wandering'; // 'wandering', 'hunting', 'eating', 'seeking_mate'
        this.currentTarget = null;
    }

    initializeTraits() {
        return {
            speed: this.species.baseSpeed * (0.8 + Math.random() * 0.4),
            size: this.species.baseSize * (0.9 + Math.random() * 0.2),
            vision: this.species.baseVision * (0.85 + Math.random() * 0.3),
            reproductionRate: this.species.baseReproductionRate * (0.9 + Math.random() * 0.2)
        };
    }

    inheritTraits(parent1, parent2) {
        // Inherit traits from parents with some mutation
        this.traits = {
            speed: this.mutate((parent1.traits.speed + parent2.traits.speed) / 2, 0.1),
            size: this.mutate((parent1.traits.size + parent2.traits.size) / 2, 0.1),
            vision: this.mutate((parent1.traits.vision + parent2.traits.vision) / 2, 0.1),
            reproductionRate: this.mutate((parent1.traits.reproductionRate + parent2.traits.reproductionRate) / 2, 0.1)
        };
        this.size = this.traits.size;
    }

    mutate(value, mutationRate) {
        return value * (1 + (Math.random() - 0.5) * mutationRate);
    }

    update(world, deltaTime) {
        // Age and basic metabolism
        this.age += deltaTime;
        
        // Hunger rate affected by age - young animals get hungry faster
        const ageRatio = this.age / this.maxAge;
        const hungerMultiplier = ageRatio < 0.3 ? 1.5 : (ageRatio < 0.7 ? 1.0 : 0.7);
        this.hunger += deltaTime * 0.5 * hungerMultiplier;
        
        this.reproductionCooldown = Math.max(0, this.reproductionCooldown - deltaTime);

        // Health decay - constant rate based on size (smaller animals decay faster)
        // Base decay rate inversely proportional to size
        const sizeBasedDecay = 0.3 / (this.traits.size / 10);
        
        // Age affects health decay: young animals (0-30% of lifespan) decay slower,
        // middle-aged (30-70%) normal, old animals (70%+) decay faster
        let ageMultiplier = 1.0;
        if (ageRatio < 0.3) {
            ageMultiplier = 0.5; // Young animals decay slower
        } else if (ageRatio > 0.7) {
            ageMultiplier = 2.0; // Old animals decay faster
        }
        
        this.health -= deltaTime * sizeBasedDecay * ageMultiplier;
        
        // Additional health loss when starving
        if (this.hunger > 80) {
            this.health -= deltaTime * 2;
        }

        // Decision making - only if not currently eating
        if (this.currentBehavior !== 'eating') {
            const target = this.findTarget(world);
            this.currentTarget = target;
            if (target) {
                // Determine behavior based on target type
                if (target instanceof Animal) {
                    this.currentBehavior = 'hunting';
                } else if (target instanceof Vegetation) {
                    this.currentBehavior = 'hunting'; // Herbivores "hunt" vegetation
                } else {
                    this.currentBehavior = 'seeking_mate';
                }
                this.moveTowards(target);
            } else {
                this.currentBehavior = 'wandering';
                this.wander();
            }
        }

        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Boundary wrapping
        let wrapped = false;
        if (this.position.x < 0) {
            this.position.x = world.width;
            wrapped = true;
        }
        if (this.position.x > world.width) {
            this.position.x = 0;
            wrapped = true;
        }
        if (this.position.y < 0) {
            this.position.y = world.height;
            wrapped = true;
        }
        if (this.position.y > world.height) {
            this.position.y = 0;
            wrapped = true;
        }

        // Trail for visual effect
        // Clear trail when wrapping to avoid lines across the screen
        if (wrapped) {
            this.trail = [];
        }
        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > 10) this.trail.shift();

        this.angle = Math.atan2(this.velocity.y, this.velocity.x);
    }

    findTarget(world) {
        // Find food or mate based on needs
        if (this.hunger > 50) {
            return this.findFood(world);
        } else if (this.canReproduce() && Math.random() < 0.3) {
            return this.findMate(world);
        }
        return null;
    }

    findFood(world) {
        const preyTypes = this.species.diet;
        let closestFood = null;
        let closestDistance = this.traits.vision;

        if (preyTypes.includes('vegetation')) {
            world.vegetation.forEach(veg => {
                const distance = this.position.distance(veg.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestFood = veg;
                }
            });
        }

        if (preyTypes.includes('animals')) {
            world.animals.forEach(animal => {
                if (animal !== this && this.canEat(animal)) {
                    const distance = this.position.distance(animal.position);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestFood = animal;
                    }
                }
            });
        }

        return closestFood;
    }

    canEat(animal) {
        const canEat = this.species.canEat || [];
        return canEat.includes(animal.species.name);
    }

    findMate(world) {
        let closestMate = null;
        let closestDistance = this.traits.vision;

        world.animals.forEach(animal => {
            if (animal !== this && 
                animal.species.name === this.species.name && 
                animal.gender !== this.gender &&
                animal.canReproduce()) {
                const distance = this.position.distance(animal.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestMate = animal;
                }
            }
        });

        return closestMate;
    }

    moveTowards(target) {
        const direction = target.position.subtract(this.position).normalize();
        this.velocity = direction.multiply(this.traits.speed);
    }

    wander() {
        // Random wandering behavior
        if (Math.random() < 0.02) {
            const angle = Math.random() * Math.PI * 2;
            this.velocity = new Vector2D(
                Math.cos(angle) * this.traits.speed * 0.5,
                Math.sin(angle) * this.traits.speed * 0.5
            );
        }
    }

    tryEat(target) {
        const distance = this.position.distance(target.position);
        if (distance < this.size + 5) {
            this.currentBehavior = 'eating';
            this.currentTarget = target;
            if (target instanceof Vegetation) {
                const energy = target.consume(30);
                this.hunger = Math.max(0, this.hunger - energy);
                this.health = Math.min(this.maxHealth, this.health + energy * 0.5);
                return target.isDepleted();
            } else if (target instanceof Animal) {
                // Predation
                target.health = 0;
                this.hunger = Math.max(0, this.hunger - 40);
                this.health = Math.min(this.maxHealth, this.health + 20);
                return true;
            }
        }
        return false;
    }

    canReproduce() {
        // Basic requirements
        if (this.age <= this.reproductionReady || 
            this.reproductionCooldown > 0 || 
            this.health < 50 || 
            this.hunger > 60) {
            return false;
        }
        
        // Old animals (70%+ of lifespan) reproduce less often
        const ageRatio = this.age / this.maxAge;
        if (ageRatio > 0.7) {
            // Old animals have only 30% chance to be ready to reproduce
            return Math.random() < 0.3;
        }
        
        return true;
    }

    reproduce(partner) {
        if (this.canReproduce() && partner.canReproduce()) {
            this.reproductionCooldown = 100 / this.traits.reproductionRate;
            partner.reproductionCooldown = 100 / partner.traits.reproductionRate;
            
            const midPoint = new Vector2D(
                (this.position.x + partner.position.x) / 2,
                (this.position.y + partner.position.y) / 2
            );
            
            return new Animal(midPoint.x, midPoint.y, this.species);
        }
        return null;
    }

    isDead() {
        return this.health <= 0;
    }
}

// Species definitions
const SPECIES = {
    RABBIT: {
        name: 'rabbit',
        emoji: '🐰',
        color: '#D2691E',
        baseSpeed: 60,
        baseSize: 8,
        baseVision: 100,
        baseReproductionRate: 1.5,
        lifespan: 80,
        reproductionAge: 15,
        diet: ['vegetation'],
        trophicLevel: 1
    },
    DEER: {
        name: 'deer',
        emoji: '🦌',
        color: '#8B4513',
        baseSpeed: 50,
        baseSize: 14,
        baseVision: 150,
        baseReproductionRate: 0.8,
        lifespan: 120,
        reproductionAge: 25,
        diet: ['vegetation'],
        trophicLevel: 1
    },
    FOX: {
        name: 'fox',
        emoji: '🦊',
        color: '#FF6347',
        baseSpeed: 70,
        baseSize: 10,
        baseVision: 120,
        baseReproductionRate: 1.0,
        lifespan: 100,
        reproductionAge: 20,
        diet: ['animals'],
        canEat: ['rabbit'],
        trophicLevel: 2
    },
    WOLF: {
        name: 'wolf',
        emoji: '🐺',
        color: '#708090',
        baseSpeed: 65,
        baseSize: 13,
        baseVision: 140,
        baseReproductionRate: 0.7,
        lifespan: 110,
        reproductionAge: 25,
        diet: ['animals'],
        canEat: ['rabbit', 'deer'],
        trophicLevel: 2
    },
    BEAR: {
        name: 'bear',
        emoji: '🐻',
        color: '#654321',
        baseSpeed: 55,
        baseSize: 18,
        baseVision: 130,
        baseReproductionRate: 0.5,
        lifespan: 140,
        reproductionAge: 30,
        diet: ['animals'],
        canEat: ['rabbit', 'deer', 'fox', 'wolf'],
        trophicLevel: 3
    }
};

// World/Ecosystem class
class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.animals = [];
        this.vegetation = [];
        this.time = 0;
        this.speed = 1.0;
        this.paused = false;
        
        // Track which species are enabled
        this.enabledSpecies = {
            rabbit: true,
            deer: true,
            fox: true,
            wolf: true,
            bear: true
        };
        
        this.initialize();
    }

    initialize() {
        // Initialize vegetation
        for (let i = 0; i < 150; i++) {
            this.vegetation.push(new Vegetation(
                Math.random() * this.width,
                Math.random() * this.height
            ));
        }

        // Initialize animals - only if enabled
        if (this.enabledSpecies.rabbit) this.addAnimals(SPECIES.RABBIT, 20);
        if (this.enabledSpecies.deer) this.addAnimals(SPECIES.DEER, 12);
        if (this.enabledSpecies.fox) this.addAnimals(SPECIES.FOX, 8);
        if (this.enabledSpecies.wolf) this.addAnimals(SPECIES.WOLF, 6);
        if (this.enabledSpecies.bear) this.addAnimals(SPECIES.BEAR, 4);
    }

    addAnimals(species, count) {
        for (let i = 0; i < count; i++) {
            const animal = new Animal(
                Math.random() * this.width,
                Math.random() * this.height,
                species
            );
            this.animals.push(animal);
        }
    }

    update(deltaTime) {
        if (this.paused) return;

        const adjustedDelta = deltaTime * this.speed;
        this.time += adjustedDelta;

        // Update animals
        for (let i = this.animals.length - 1; i >= 0; i--) {
            const animal = this.animals[i];
            animal.update(this, adjustedDelta);

            // Check for feeding - use the target that was found during update
            // Only try to eat if the animal is actually hungry and the target is food
            if (animal.currentTarget && animal.hunger > 50) {
                // Only try to eat if target is vegetation or a valid prey animal
                const isValidFoodTarget = 
                    animal.currentTarget instanceof Vegetation ||
                    (animal.currentTarget instanceof Animal && animal.canEat(animal.currentTarget));
                
                if (isValidFoodTarget && animal.tryEat(animal.currentTarget)) {
                    if (animal.currentTarget instanceof Vegetation) {
                        this.vegetation = this.vegetation.filter(v => v !== animal.currentTarget);
                    } else if (animal.currentTarget instanceof Animal) {
                        this.animals = this.animals.filter(a => a !== animal.currentTarget);
                    }
                    // Reset behavior after eating so it can reassess in the next frame
                    animal.currentBehavior = 'wandering';
                    animal.currentTarget = null;
                }
            }

            // Check for reproduction
            if (animal.canReproduce() && Math.random() < 0.001) {
                const mate = animal.findMate(this);
                if (mate && animal.position.distance(mate.position) < 20) {
                    const offspring = animal.reproduce(mate);
                    if (offspring) {
                        offspring.inheritTraits(animal, mate);
                        this.animals.push(offspring);
                    }
                }
            }

            // Remove dead animals
            if (animal.isDead()) {
                this.animals.splice(i, 1);
            }
        }

        // Grow vegetation
        this.vegetation.forEach(veg => veg.grow());

        // Spawn new vegetation occasionally
        if (this.vegetation.length < 200 && Math.random() < 0.05) {
            this.vegetation.push(new Vegetation(
                Math.random() * this.width,
                Math.random() * this.height
            ));
        }
    }

    getStatistics() {
        const stats = {};
        
        // Count animals by species
        Object.values(SPECIES).forEach(species => {
            const animals = this.animals.filter(a => a.species.name === species.name);
            const males = animals.filter(a => a.gender === 'male').length;
            const females = animals.filter(a => a.gender === 'female').length;
            
            stats[species.name] = {
                total: animals.length,
                males: males,
                females: females,
                emoji: species.emoji,
                color: species.color
            };
        });

        return stats;
    }

    reset() {
        this.animals = [];
        this.vegetation = [];
        this.time = 0;
        this.initialize();
    }
}

// Renderer class
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.showTrails = true;
    }

    clear() {
        this.ctx.fillStyle = '#e8f5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawWorld(world) {
        this.clear();

        // Draw vegetation
        world.vegetation.forEach(veg => this.drawVegetation(veg));

        // Draw animal trails
        if (this.showTrails) {
            world.animals.forEach(animal => this.drawTrail(animal));
        }

        // Draw animals
        world.animals.forEach(animal => this.drawAnimal(animal));
    }

    drawVegetation(veg) {
        const alpha = veg.energy / veg.maxEnergy;
        this.ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(veg.position.x, veg.position.y, veg.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTrail(animal) {
        if (animal.trail.length < 2) return;

        this.ctx.strokeStyle = animal.species.color + '40';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(animal.trail[0].x, animal.trail[0].y);
        
        for (let i = 1; i < animal.trail.length; i++) {
            this.ctx.lineTo(animal.trail[i].x, animal.trail[i].y);
        }
        
        this.ctx.stroke();
    }

    drawAnimal(animal) {
        const ctx = this.ctx;
        const pos = animal.position;

        // Draw vision cone (semi-transparent)
        if (animal.currentTarget) {
            ctx.fillStyle = animal.species.color + '15';
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            const visionAngle = Math.PI / 3; // 60 degree cone
            ctx.arc(pos.x, pos.y, animal.traits.vision * 0.3, 
                    animal.angle - visionAngle / 2, 
                    animal.angle + visionAngle / 2);
            ctx.closePath();
            ctx.fill();
        }

        // Draw body
        ctx.fillStyle = animal.species.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, animal.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw direction indicator (small triangle pointing in movement direction)
        ctx.fillStyle = '#000000';
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(animal.angle);
        ctx.beginPath();
        ctx.moveTo(animal.size + 4, 0);
        ctx.lineTo(animal.size - 2, -3);
        ctx.lineTo(animal.size - 2, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw health bar
        const barWidth = animal.size * 2;
        const barHeight = 3;
        const barY = pos.y - animal.size - 8;

        ctx.fillStyle = '#333';
        ctx.fillRect(pos.x - barWidth / 2, barY, barWidth, barHeight);

        ctx.fillStyle = animal.health > 50 ? '#4CAF50' : '#f44336';
        ctx.fillRect(
            pos.x - barWidth / 2,
            barY,
            barWidth * (animal.health / animal.maxHealth),
            barHeight
        );

        // Draw hunger bar (below health bar)
        const hungerBarY = barY + barHeight + 1;
        ctx.fillStyle = '#333';
        ctx.fillRect(pos.x - barWidth / 2, hungerBarY, barWidth, barHeight);

        // Hunger bar color: green when low hunger, yellow when moderate, red when starving
        const hungerRatio = animal.hunger / animal.maxHunger;
        if (hungerRatio < 0.5) {
            ctx.fillStyle = '#4CAF50';
        } else if (hungerRatio < 0.8) {
            ctx.fillStyle = '#FFC107';
        } else {
            ctx.fillStyle = '#f44336';
        }
        ctx.fillRect(
            pos.x - barWidth / 2,
            hungerBarY,
            barWidth * hungerRatio,
            barHeight
        );

        // Draw gender indicator
        ctx.fillStyle = animal.gender === 'male' ? '#2196F3' : '#E91E63';
        ctx.beginPath();
        ctx.arc(pos.x + animal.size - 3, pos.y - animal.size + 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw emoji
        ctx.font = `${animal.size * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(animal.species.emoji, pos.x, pos.y);

        // Draw behavior indicator (small icon above the animal)
        const behaviorIcons = {
            'wandering': '💤',
            'hunting': '🎯',
            'eating': '🍽️',
            'seeking_mate': '💕'
        };
        const icon = behaviorIcons[animal.currentBehavior] || '';
        if (icon) {
            ctx.font = `${animal.size * 0.8}px Arial`;
            ctx.fillText(icon, pos.x + animal.size + 5, pos.y - animal.size - 5);
        }
    }
}

// Main simulation controller
class Simulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.world = new World(this.canvas.width, this.canvas.height);
        this.renderer = new Renderer(this.canvas);
        this.lastTime = 0;
        this.running = true;
        
        this.setupControls();
        this.animate();
    }

    setupControls() {
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.world.paused = !this.world.paused;
            document.getElementById('pauseBtn').textContent = this.world.paused ? 'Resume' : 'Pause';
        });

        document.getElementById('speedUpBtn').addEventListener('click', () => {
            this.world.speed = Math.min(5, this.world.speed + 0.5);
        });

        document.getElementById('slowDownBtn').addEventListener('click', () => {
            this.world.speed = Math.max(0.5, this.world.speed - 0.5);
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.world.reset();
        });

        document.getElementById('showTrails').addEventListener('change', (e) => {
            this.renderer.showTrails = e.target.checked;
        });

        // Setup species toggle checkboxes
        ['rabbit', 'deer', 'fox', 'wolf', 'bear'].forEach(species => {
            const checkbox = document.getElementById(`enable-${species}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.world.enabledSpecies[species] = e.target.checked;
                });
            }
        });
    }

    animate(currentTime = 0) {
        if (!this.running) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (deltaTime > 0 && deltaTime < 0.1) {
            this.world.update(deltaTime);
        }

        this.renderer.drawWorld(this.world);
        this.updateUI();

        requestAnimationFrame(this.animate.bind(this));
    }

    updateUI() {
        const stats = this.world.getStatistics();
        const statsDiv = document.getElementById('stats');
        
        let html = '';
        Object.entries(stats).forEach(([species, data]) => {
            html += `
                <div class="stat-item" style="border-left-color: ${data.color}">
                    <span class="label">${data.emoji} ${species.charAt(0).toUpperCase() + species.slice(1)}</span>
                    <span class="value">${data.total} (♂${data.males} ♀${data.females})</span>
                </div>
            `;
        });
        
        statsDiv.innerHTML = html;

        document.getElementById('simTime').textContent = Math.floor(this.world.time);
        document.getElementById('simSpeed').textContent = this.world.speed.toFixed(1);
        document.getElementById('totalAnimals').textContent = this.world.animals.length;
        document.getElementById('totalVegetation').textContent = this.world.vegetation.length;
    }
}

// Initialize simulation when page loads
window.addEventListener('load', () => {
    new Simulation('simulationCanvas');
});
