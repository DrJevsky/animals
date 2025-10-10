# Copilot Instructions for Animal Ecosystem Simulation

## Project Overview

This is an interactive web-based animal ecosystem simulation built with pure JavaScript, HTML5 Canvas, and CSS. The project simulates predator-prey dynamics, reproduction, genetic trait inheritance, and population dynamics in a visual, real-time ecosystem.

## Code Style and Standards

### JavaScript
- Use ES6+ class-based object-oriented design
- Maintain clean class hierarchy (Vector2D, Vegetation, Animal, World, Renderer, Simulation)
- Use descriptive, self-explanatory variable names
- Prefer pure functions where possible
- No external dependencies - keep it vanilla JavaScript
- Use `const` and `let` appropriately, avoid `var`

### HTML/CSS
- Maintain responsive design principles
- Keep the modern gradient design aesthetic (purple/blue gradients)
- Use semantic HTML5 elements
- Ensure mobile/tablet compatibility

## Key Components

### Core Classes
1. **Vector2D**: Mathematical operations for 2D movement and physics
2. **Vegetation**: Plant entities that herbivores consume
3. **Animal**: Base class for all animal species with traits, behavior, and lifecycle
4. **World**: Ecosystem manager handling all entities, interactions, and time
5. **Renderer**: Canvas rendering with visual effects
6. **Simulation**: Main controller connecting UI, World, and Renderer

### Species System
The project uses a `SPECIES` object defining 5 animal types:
- Rabbits (herbivore, fast breeding)
- Deer (herbivore, larger, better vision)
- Foxes (predator, hunts rabbits)
- Wolves (predator, hunts rabbits and deer)
- Bears (apex predator, hunts all animals)

Each species has configurable parameters: baseSpeed, baseSize, baseVision, baseReproductionRate, lifespan, reproductionAge, diet, canEat list, and trophicLevel.

### Genetic Traits
Animals inherit traits from parents with random mutations:
- Speed: Movement rate
- Size: Physical size
- Vision: Detection range for food/mates
- Reproduction Rate: Cooldown multiplier

## Implementation Guidelines

### When Adding New Features
- **New Animal Species**: Follow the SPECIES object pattern, define all required properties, consider trophic level and diet relationships
- **Behavior Modifications**: Update the Animal class methods (findTarget, findFood, findMate, etc.)
- **Visual Enhancements**: Work within the Renderer class, maintain emoji-based animal representation
- **UI Controls**: Add to the controls section in index.html and wire up in Simulation.setupControls()

### Performance Considerations
- Target 60 FPS rendering
- Optimize collision detection and distance calculations
- Use requestAnimationFrame for smooth animation
- Consider performance when population sizes grow large

### Mathematical Accuracy
- Use Vector2D class for all position/movement calculations
- Maintain realistic physics (velocity, acceleration)
- Normalize vectors for direction calculations
- Use proper distance formulas (Euclidean distance)

### Ecosystem Balance
- Consider predator-prey ratios when adjusting spawn rates
- Balance reproduction rates with lifespan and hunger mechanics
- Ensure vegetation regrowth sustains herbivore populations
- Test changes across multiple simulation runs to observe long-term stability

## Testing Approach

Since this is a browser-based simulation with no test framework:
- **Manual Testing**: Open index.html in browser and observe behavior
- **Verification Steps**:
  1. Check animals move correctly
  2. Verify predator-prey interactions (hunting, eating)
  3. Test reproduction mechanics (gender compatibility, cooldowns)
  4. Monitor population statistics for balance
  5. Verify UI controls (pause, speed, reset, trails)
  6. Test on different screen sizes for responsiveness

## Common Patterns

### Adding a New Trait
1. Add to `initializeTraits()` method in Animal class
2. Update `inheritTraits()` to include parent averaging and mutation
3. Use the trait in relevant behavior methods (update, findFood, etc.)
4. Consider adding UI display if relevant

### Modifying Animal Behavior
1. Locate the relevant method in Animal class (findTarget, tryEat, reproduce, etc.)
2. Maintain the behavior state (`currentBehavior` and `currentTarget`) for visual feedback
3. Ensure changes work for all species types
4. Test with different population densities

### UI Enhancements
1. HTML changes go in index.html
2. Styling in styles.css (maintain gradient theme)
3. Wire up interactions in Simulation class
4. Update Renderer if visual changes needed on canvas

## File Structure

- `index.html`: Main HTML structure, controls, and statistics panel
- `simulation.js`: All simulation logic (Vector2D, classes, game loop)
- `styles.css`: All styling with gradient theme and responsive design
- `README.md`: Documentation and feature descriptions
- `LICENSE`: MIT License

## Documentation Standards

- Update README.md when adding significant features
- Use emoji where appropriate to match project style (🦊🌿🐰🦌🐺🐻🌱)
- Keep contributing section up to date with new extensibility options
- Document complex algorithms with inline comments
- Use JSDoc-style comments for class and method definitions when helpful

## Best Practices for This Project

1. **Preserve the visual aesthetic**: Maintain the modern gradient design and emoji-based representation
2. **Keep it dependency-free**: No npm packages, no build tools, pure vanilla JavaScript
3. **Maintain extensibility**: New features should follow the established class patterns
4. **Consider ecosystem impact**: Changes to one species affect the entire food chain
5. **Optimize for learning**: Code should be readable and educational for contributors interested in simulation and ecology
6. **Test thoroughly**: Since there's no automated testing, manual verification across scenarios is essential
7. **Responsive design**: Ensure changes work on different screen sizes
8. **Performance first**: Maintain 60 FPS even with large populations

## When in Doubt

- Follow the existing patterns in the codebase
- Maintain the object-oriented design philosophy
- Prioritize code readability and maintainability
- Keep the simulation scientifically plausible (within its simplified model)
- Preserve the visual polish and user experience
