class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Game properties
        this.car = {
            x: 200,
            y: 200,
            width: 40,
            height: 20,
            rotation: 0,
            speed: 0,
            acceleration: 0,
            angularVelocity: 0,
            wheels: [
                { x: -15, y: 10, suspension: 0, springForce: 0.3, dampening: 0.3 },
                { x: 15, y: 10, suspension: 0, springForce: 0.3, dampening: 0.3 }
            ],
            fuel: 100,
            maxFuel: 100,
            fuelConsumption: 0.1
        };
        
        this.terrain = [];
        this.generateTerrain();
        
        // Add game state properties
        this.score = 0;
        this.gameOver = false;
        this.coins = [];
        this.fuelCans = [];
        
        // Generate initial collectibles
        this.generateCollectibles();
        
        // Controls
        this.keys = {
            right: false,
            left: false
        };
        
        this.camera = {
            x: 0,
            y: 0
        };
        
        // Add sound effects
        this.setupSounds();
        
        // Particle system
        this.particles = [];
        
        // High scores
        this.highScores = JSON.parse(localStorage.getItem('hillClimbHighScores')) || [];
        
        // Add power-ups
        this.powerUps = [];
        this.activePowerUps = {
            doubleScore: { active: false, timer: 0 },
            speedBoost: { active: false, timer: 0 },
            fuelEfficiency: { active: false, timer: 0 }
        };
        
        // Mobile controls
        this.touchControls = {
            left: false,
            right: false
        };
        
        // Add vehicle types
        this.vehicles = {
            jeep: {
                name: 'Jeep',
                width: 40,
                height: 20,
                wheelBase: 30,
                acceleration: 0.3,
                maxSpeed: 8,
                grip: 0.99,
                fuelEfficiency: 0.1,
                color: 'red',
                description: 'All-round performer'
            },
            sportsCar: {
                name: 'Sports Car',
                width: 45,
                height: 15,
                wheelBase: 35,
                acceleration: 0.4,
                maxSpeed: 10,
                grip: 0.98,
                fuelEfficiency: 0.15,
                color: 'blue',
                description: 'Fast but uses more fuel'
            },
            monster: {
                name: 'Monster Truck',
                width: 50,
                height: 30,
                wheelBase: 40,
                acceleration: 0.25,
                maxSpeed: 6,
                grip: 1,
                fuelEfficiency: 0.2,
                color: 'green',
                description: 'Great suspension, poor fuel economy'
            }
        };
        
        // Current vehicle selection
        this.currentVehicle = 'jeep';
        this.showVehicleSelect = true;
        
        // Initialize game state
        this.showUpgradeMenu = false;
        this.showMissionMenu = false;
        this.gameOver = false;
        
        // Load saved data after initializing defaults
        this.loadSavedData();
        
        // Initialize vehicle after loading saved data
        this.initializeVehicle();
        
        // Add upgrade system
        this.upgrades = {
            jeep: {
                speed: { level: 0, maxLevel: 3, cost: 100, increment: 1 },
                fuel: { level: 0, maxLevel: 3, cost: 150, increment: 20 },
                grip: { level: 0, maxLevel: 3, cost: 200, increment: 0.02 }
            },
            sportsCar: {
                speed: { level: 0, maxLevel: 3, cost: 150, increment: 1.2 },
                fuel: { level: 0, maxLevel: 3, cost: 200, increment: 15 },
                grip: { level: 0, maxLevel: 3, cost: 250, increment: 0.015 }
            },
            monster: {
                speed: { level: 0, maxLevel: 3, cost: 120, increment: 0.8 },
                fuel: { level: 0, maxLevel: 3, cost: 180, increment: 25 },
                grip: { level: 0, maxLevel: 3, cost: 150, increment: 0.025 }
            }
        };
        
        // Add achievements system
        this.achievements = {
            speedDemon: { name: 'Speed Demon', description: 'Reach max speed', achieved: false },
            coinCollector: { name: 'Coin Collector', description: 'Collect 50 coins', achieved: false },
            fuelMaster: { name: 'Fuel Master', description: 'Drive 1 minute without fuel pickup', achieved: false },
            upgradeKing: { name: 'Upgrade King', description: 'Max out all upgrades for one vehicle', achieved: false },
            airTime: { name: 'Air Time', description: 'Stay airborne for 3 seconds', achieved: false }
        };
        
        // Add player stats
        this.stats = {
            totalCoins: 0,
            totalDistance: 0,
            airTime: 0,
            timeSinceLastFuel: 0
        };
        
        // Add daily challenges system
        this.challenges = {
            current: [],
            lastUpdate: 0,
            maxChallenges: 3
        };
        
        // Add missions
        this.missions = {
            distanceRun: { name: 'Distance Run', goal: 5000, progress: 0, reward: 200,
                description: 'Travel 5000 units' },
            coinMaster: { name: 'Coin Master', goal: 20, progress: 0, reward: 150,
                description: 'Collect 20 coins in one run' },
            fuelSaver: { name: 'Fuel Saver', goal: 30, progress: 0, reward: 250,
                description: 'Drive 30 seconds without using fuel' },
            airMaster: { name: 'Air Master', goal: 5, progress: 0, reward: 300,
                description: 'Perform 5 jumps over 2 seconds' }
        };
        
        // Initialize daily challenges
        this.updateDailyChallenges();
        
        // Add special events system
        this.events = {
            active: null,
            types: {
                doubleRewards: {
                    name: 'Double Rewards Weekend',
                    description: 'All rewards are doubled!',
                    multiplier: 2,
                    duration: 300 // 5 minutes in seconds
                },
                lowGravity: {
                    name: 'Low Gravity Mode',
                    description: 'Gravity is reduced by half!',
                    multiplier: 0.5,
                    duration: 180
                },
                turboBoost: {
                    name: 'Turbo Mode',
                    description: 'Vehicle speed increased by 50%!',
                    multiplier: 1.5,
                    duration: 240
                }
            }
        };
        
        // Track event time
        this.eventTimer = 0;
        
        this.setupControls();
        this.setupMobileControls();
        this.gameLoop();
    }
    
    setupSounds() {
        try {
            this.sounds = {
                coin: new Audio('https://assets.mixkit.co/active_storage/sfx/2019.wav'),
                fuel: new Audio('https://assets.mixkit.co/active_storage/sfx/2020.wav'),
                engine: new Audio('https://assets.mixkit.co/active_storage/sfx/2030.wav'),
                crash: new Audio('https://assets.mixkit.co/active_storage/sfx/2022.wav'),
                powerUp: new Audio('https://assets.mixkit.co/active_storage/sfx/2044.wav'),
                background: new Audio('https://assets.mixkit.co/active_storage/sfx/2050.wav')
            };

            // Setup background music
            this.sounds.background.loop = true;
            this.sounds.background.volume = 0.3;
        } catch (error) {
            console.warn('Sound initialization failed:', error);
            this.sounds = {};
        }
    }
    
    loadSavedData() {
        const savedData = JSON.parse(localStorage.getItem('hillClimbSave')) || {};
        this.upgrades = savedData.upgrades || this.upgrades;
        this.achievements = savedData.achievements || this.achievements;
        this.stats.totalCoins = savedData.totalCoins || 0;
        this.missions = savedData.missions || this.missions;
        this.challenges = savedData.challenges || this.challenges;
        this.updateDailyChallenges();
    }
    
    saveGame() {
        const saveData = {
            upgrades: this.upgrades,
            achievements: this.achievements,
            totalCoins: this.stats.totalCoins,
            missions: this.missions,
            challenges: this.challenges
        };
        localStorage.setItem('hillClimbSave', JSON.stringify(saveData));
    }
    
    initializeVehicle() {
        const vehicle = this.vehicles[this.currentVehicle];
        const vehicleUpgrades = this.upgrades[this.currentVehicle];
        
        // Create a new car object instead of modifying existing one
        this.car = {
            x: 200,
            y: 200,
            width: vehicle.width,
            height: vehicle.height,
            rotation: 0,
            speed: 0,
            acceleration: 0,
            angularVelocity: 0,
            maxSpeed: vehicle.maxSpeed + (vehicleUpgrades.speed.level * vehicleUpgrades.speed.increment),
            accelerationRate: vehicle.acceleration,
            grip: vehicle.grip + (vehicleUpgrades.grip.level * vehicleUpgrades.grip.increment),
            wheels: [
                { x: -vehicle.wheelBase/2, y: 10, suspension: 0, springForce: 0.3, dampening: 0.3 },
                { x: vehicle.wheelBase/2, y: 10, suspension: 0, springForce: 0.3, dampening: 0.3 }
            ],
            fuel: 100 + (vehicleUpgrades.fuel.level * vehicleUpgrades.fuel.increment),
            maxFuel: 100 + (vehicleUpgrades.fuel.level * vehicleUpgrades.fuel.increment),
            fuelConsumption: vehicle.fuelEfficiency,
            color: vehicle.color
        };
    }
    
    generateTerrain() {
        let x = 0;
        let y = this.canvas.height / 2;
        
        // Generate longer terrain
        while (x < this.canvas.width * 3) {
            // More varied hills using sine waves
            let height = Math.sin(x * 0.01) * 50 + Math.sin(x * 0.02) * 30;
            y = this.canvas.height / 2 + height;
            this.terrain.push({ x, y });
            x += 20; // Smaller segments for smoother terrain
        }
    }
    
    generateCollectibles() {
        // Generate coins
        for (let i = 0; i < 50; i++) {
            let x = Math.random() * this.canvas.width * 3;
            let y = this.getTerrainY(x) - 50 - Math.random() * 100;
            this.coins.push({ x, y, collected: false });
        }
        
        // Generate fuel cans
        for (let i = 0; i < 10; i++) {
            let x = Math.random() * this.canvas.width * 3;
            let y = this.getTerrainY(x) - 30;
            this.fuelCans.push({ x, y, collected: false });
        }
        
        // Generate power-ups
        const powerUpTypes = ['doubleScore', 'speedBoost', 'fuelEfficiency'];
        for (let i = 0; i < 5; i++) {
            let x = Math.random() * this.canvas.width * 3;
            let y = this.getTerrainY(x) - 50;
            let type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            this.powerUps.push({ x, y, type, collected: false });
        }
    }
    
    setupControls() {
        const canvas = this.canvas;
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.showVehicleSelect) {
                this.handleVehicleSelectClick(x, y);
            } else if (this.showUpgradeMenu) {
                this.handleUpgradeMenuClick(x, y);
            } else if (this.showMissionMenu) {
                this.handleMissionMenuClick(x, y);
            } else {
                // Check missions button
                if (x >= this.canvas.width - 120 && x <= this.canvas.width - 20 &&
                    y >= 20 && y <= 50) {
                    this.showMissionMenu = true;
                }
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.keys.right = true;
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'Space' && this.gameOver) {
                this.resetGame();
            }
            if (e.key === 'Escape') {
                this.showMissionMenu = false;
                this.showUpgradeMenu = false;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === 'ArrowLeft') this.keys.left = false;
        });
    }
    
    setupMobileControls() {
        // Add mobile control buttons
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'mobile-controls';
        controlsDiv.innerHTML = `
            <button id="left-btn">←</button>
            <button id="right-btn">→</button>
        `;
        document.body.appendChild(controlsDiv);
        
        // Style the controls
        const style = document.createElement('style');
        style.textContent = `
            #mobile-controls {
                position: fixed;
                bottom: 20px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
            }
            #mobile-controls button {
                width: 80px;
                height: 80px;
                font-size: 40px;
                border-radius: 50%;
                border: none;
                background: rgba(255,255,255,0.5);
                touch-action: none;
            }
            @media (min-width: 768px) {
                #mobile-controls {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Touch events for mobile buttons
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        
        ['touchstart', 'mousedown'].forEach(eventType => {
            leftBtn.addEventListener(eventType, () => this.touchControls.left = true);
            rightBtn.addEventListener(eventType, () => this.touchControls.right = true);
        });
        
        ['touchend', 'mouseup'].forEach(eventType => {
            leftBtn.addEventListener(eventType, () => this.touchControls.left = false);
            rightBtn.addEventListener(eventType, () => this.touchControls.right = false);
        });
        
        // Add notification styles
        const notificationStyle = document.createElement('style');
        notificationStyle.textContent = `
            .game-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px;
                border-radius: 5px;
                z-index: 1000;
                animation: slideIn 0.5s ease-out;
            }
            .game-notification.fade-out {
                animation: fadeOut 1s ease-out;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(notificationStyle);
    }
    
    update() {
        if (this.showVehicleSelect || this.gameOver) return;
        
        // Handle both keyboard and touch input
        if (this.keys.right || this.touchControls.right) {
            this.car.acceleration = this.car.accelerationRate;
        } else if (this.keys.left || this.touchControls.left) {
            this.car.acceleration = -this.car.accelerationRate;
        } else {
            this.car.acceleration = 0;
        }
        
        // Update power-up timers
        Object.keys(this.activePowerUps).forEach(type => {
            if (this.activePowerUps[type].active) {
                this.activePowerUps[type].timer--;
                if (this.activePowerUps[type].timer <= 0) {
                    this.deactivatePowerUp(type);
                }
            }
        });
        
        // Apply power-up effects
        if (this.activePowerUps.speedBoost.active) {
            this.car.acceleration *= 1.5;
        }
        if (this.activePowerUps.fuelEfficiency.active) {
            this.car.fuelConsumption = 0.05;
        } else {
            this.car.fuelConsumption = 0.1;
        }
        
        // Update car physics
        this.car.speed += this.car.acceleration;
        this.car.speed *= 0.99; // Friction
        this.car.rotation += this.car.angularVelocity;
        this.car.angularVelocity *= 0.95; // Angular friction
        
        // Limit speed based on vehicle max speed
        this.car.speed = Math.max(-this.car.maxSpeed, Math.min(this.car.maxSpeed, this.car.speed));
        
        // Apply vehicle-specific grip
        this.car.speed *= this.car.grip;
        
        // Update position based on rotation
        this.car.x += Math.cos(this.car.rotation) * this.car.speed;
        this.car.y += Math.sin(this.car.rotation) * this.car.speed;
        
        // Update wheels and suspension
        this.car.wheels.forEach(wheel => {
            // Calculate wheel position in world space
            let wheelX = this.car.x + wheel.x * Math.cos(this.car.rotation) - wheel.y * Math.sin(this.car.rotation);
            let wheelY = this.car.y + wheel.x * Math.sin(this.car.rotation) + wheel.y * Math.cos(this.car.rotation);
            
            // Get ground height at wheel position
            let groundY = this.getTerrainY(wheelX);
            let distance = groundY - wheelY;
            
            // Apply suspension forces
            wheel.suspension = Math.max(0, Math.min(15, distance));
            let suspensionForce = wheel.suspension * wheel.springForce;
            
            // Apply force to car
            this.car.y -= suspensionForce;
        });
        
        // Apply gravity
        this.car.y += 1;
        
        // Update camera
        this.camera.x += (this.car.x - this.camera.x - this.canvas.width/2) * 0.1;
        this.camera.y += (this.car.y - this.camera.y - this.canvas.height/2) * 0.1;
        
        // Update fuel
        if (Math.abs(this.car.speed) > 0.1) {
            this.car.fuel -= this.car.fuelConsumption * Math.abs(this.car.speed);
        }
        
        // Check game over conditions
        if (this.car.fuel <= 0) {
            this.gameOver = true;
        }
        
        // Create exhaust particles when accelerating
        if (Math.abs(this.car.speed) > 0.5) {
            const exhaustX = this.car.x - Math.cos(this.car.rotation) * 20;
            const exhaustY = this.car.y - Math.sin(this.car.rotation) * 20;
            this.createParticle(exhaustX, exhaustY, '#888', 'exhaust');
            
            // Play engine sound
            if (!this.sounds.engine.playing) {
                this.sounds.engine.play();
            }
        } else {
            this.sounds.engine.pause();
        }
        
        // Update particles
        this.updateParticles();
        
        // Update coin collection with particles and sound
        this.coins.forEach(coin => {
            if (!coin.collected && this.checkCollision(coin, 20)) {
                coin.collected = true;
                this.score += 10;
                this.sounds.coin.cloneNode().play();
                for (let i = 0; i < 8; i++) {
                    this.createParticle(coin.x, coin.y, 'gold');
                }
            }
        });
        
        // Update fuel collection with particles and sound
        this.fuelCans.forEach(fuel => {
            if (!fuel.collected && this.checkCollision(fuel, 30)) {
                fuel.collected = true;
                this.car.fuel = Math.min(this.car.maxFuel, this.car.fuel + 30);
                this.sounds.fuel.cloneNode().play();
                for (let i = 0; i < 8; i++) {
                    this.createParticle(fuel.x, fuel.y, 'green');
                }
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected && this.checkCollision(powerUp, 25)) {
                powerUp.collected = true;
                this.activatePowerUp(powerUp.type);
                this.sounds.powerUp.cloneNode().play();
                for (let i = 0; i < 12; i++) {
                    this.createParticle(powerUp.x, powerUp.y, this.getPowerUpColor(powerUp.type));
                }
            }
        });
        
        // Update stats
        this.stats.totalDistance += Math.abs(this.car.speed);
        this.stats.timeSinceLastFuel++;
        
        // Check if car is airborne
        const isAirborne = !this.car.wheels.some(wheel => wheel.suspension > 0);
        if (isAirborne) {
            this.stats.airTime++;
            if (this.stats.airTime >= 180 && !this.achievements.airTime.achieved) {
                this.achievements.airTime.achieved = true;
                this.saveGame();
            }
        } else {
            this.stats.airTime = 0;
        }
        
        // Update missions and challenges
        if (!this.gameOver && !this.showVehicleSelect) {
            // Update distance mission and challenge
            this.missions.distanceRun.progress += Math.abs(this.car.speed);
            this.challenges.current.forEach(challenge => {
                if (challenge.type === 'distance') {
                    challenge.progress += Math.abs(this.car.speed);
                }
            });
            
            // Update air time mission and challenge
            if (isAirborne) {
                this.missions.airMaster.progress += this.car.speed > 3 ? 1 : 0;
                this.challenges.current.forEach(challenge => {
                    if (challenge.type === 'airTime') {
                        challenge.progress += 1/60; // Convert frames to seconds
                    }
                });
            }
            
            // Update speed challenge
            this.challenges.current.forEach(challenge => {
                if (challenge.type === 'speed' && Math.abs(this.car.speed) > challenge.goal) {
                    challenge.progress = challenge.goal;
                }
            });
            
            this.checkMissionsAndChallenges();
        }
        
        // Fix event timer update - move it outside the gameOver check
        if (this.events.active) {
            this.eventTimer--;
            if (this.eventTimer <= 0) {
                this.endEvent();
            }
        } else if (!this.gameOver && Math.random() < 0.0001) { // Only trigger new events when not game over
            this.startRandomEvent();
        }
    }
    
    getTerrainY(x) {
        // Find the terrain segments the car is between
        for (let i = 0; i < this.terrain.length - 1; i++) {
            if (x >= this.terrain[i].x && x < this.terrain[i + 1].x) {
                const t = (x - this.terrain[i].x) / (this.terrain[i + 1].x - this.terrain[i].x);
                return this.terrain[i].y * (1 - t) + this.terrain[i + 1].y * t;
            }
        }
        return this.canvas.height / 2;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context once at the start
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw world elements
        this.drawWorld();
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI elements (which don't need camera transform)
        this.drawUI();
        
        // Draw menus last
        if (this.showVehicleSelect) {
            this.drawVehicleSelect();
        } else if (this.showUpgradeMenu) {
            this.drawUpgradeMenu();
        } else if (this.showMissionMenu) {
            this.drawMissionMenu();
        }
        
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawWorld() {
        // Draw terrain
        this.ctx.beginPath();
        this.ctx.moveTo(this.camera.x, this.canvas.height + this.camera.y);
        this.terrain.forEach(point => {
            this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.lineTo(this.camera.x + this.canvas.width, this.canvas.height + this.camera.y);
        this.ctx.fillStyle = '#764';
        this.ctx.fill();
        
        // Draw collectibles
        this.drawCollectibles();
        
        // Draw car
        this.drawCar();
        
        // Draw particles
        this.drawParticles();
    }
    
    drawCollectibles() {
        // Draw coins
        this.ctx.fillStyle = 'gold';
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw fuel cans
        this.ctx.fillStyle = 'green';
        this.fuelCans.forEach(fuel => {
            if (!fuel.collected) {
                this.ctx.fillRect(fuel.x - 10, fuel.y - 15, 20, 30);
            }
        });
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
                this.ctx.beginPath();
                this.ctx.moveTo(powerUp.x, powerUp.y - 15);
                this.ctx.lineTo(powerUp.x + 15, powerUp.y + 15);
                this.ctx.lineTo(powerUp.x - 15, powerUp.y + 15);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }
    
    drawCar() {
        this.ctx.save();
        this.ctx.translate(this.car.x, this.car.y);
        this.ctx.rotate(this.car.rotation);
        
        // Car body
        this.ctx.fillStyle = this.car.color;
        this.ctx.fillRect(-this.car.width/2, -this.car.height/2, this.car.width, this.car.height);
        
        // Draw wheels
        this.ctx.fillStyle = 'black';
        this.car.wheels.forEach(wheel => {
            this.ctx.fillRect(
                wheel.x - 5,
                wheel.y - 5 + wheel.suspension,
                10,
                10
            );
        });
        
        this.ctx.restore();
    }
    
    drawUI() {
        // Draw score
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Draw fuel gauge
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(20, 50, 200, 20);
        
        const fuelWidth = (this.car.fuel / this.car.maxFuel) * 200;
        this.ctx.fillStyle = this.car.fuel < 30 ? 'red' : 'green';
        this.ctx.fillRect(20, 50, fuelWidth, 20);
        
        // Draw active power-ups
        let powerUpY = 80;
        Object.entries(this.activePowerUps).forEach(([type, status]) => {
            if (status.active) {
                this.ctx.fillStyle = this.getPowerUpColor(type);
                this.ctx.fillText(
                    `${type}: ${Math.ceil(status.timer / 60)}s`, 
                    20, 
                    powerUpY
                );
                powerUpY += 25;
            }
        });
        
        // Draw missions and challenges button
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(this.canvas.width - 120, 20, 100, 30);
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Missions', this.canvas.width - 70, 40);
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 50);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width/2, this.canvas.height/2 + 100);
        
        // Add high scores
        const highScores = this.getTopScores();
        this.ctx.font = '20px Arial';
        this.ctx.fillText('High Scores:', this.canvas.width/2, this.canvas.height/2 + 150);
        
        highScores.forEach((score, index) => {
            this.ctx.fillText(
                `${index + 1}. ${score}`, 
                this.canvas.width/2, 
                this.canvas.height/2 + 180 + index * 25
            );
        });
    }
    
    drawVehicleSelect() {
        if (!this.showVehicleSelect) return;
        
        // Darken background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Select Your Vehicle', this.canvas.width/2, 50);
        
        // Draw vehicle options
        let y = 120;
        Object.entries(this.vehicles).forEach(([id, vehicle]) => {
            const isSelected = this.currentVehicle === id;
            const x = this.canvas.width/2;
            
            // Selection highlight
            if (isSelected) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(x - 150, y - 30, 300, 100);
            }
            
            // Vehicle preview
            this.ctx.fillStyle = vehicle.color;
            this.ctx.fillRect(x - 100, y, vehicle.width, vehicle.height);
            
            // Vehicle info
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(vehicle.name, x + 50, y + 15);
            this.ctx.font = '14px Arial';
            this.ctx.fillText(vehicle.description, x + 50, y + 35);
            
            // Stats bars
            this.drawStatBar('Speed', vehicle.maxSpeed/10, x - 120, y + 60);
            this.drawStatBar('Grip', vehicle.grip, x, y + 60);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(x + 120, y + 60, 50, 10);
            
            y += 120;
        });
        
        // Start button
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.canvas.width/2 - 60, y, 120, 40);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('START', this.canvas.width/2, y + 25);
    }
    
    drawStatBar(label, value, x, y) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, x, y - 5);
        
        // Bar background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x - 25, y, 50, 10);
        
        // Bar value
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x - 25, y, 50 * value, 10);
    }
    
    checkCollision(item, radius) {
        const dx = this.car.x - item.x;
        const dy = this.car.y - item.y;
        return Math.sqrt(dx * dx + dy * dy) < radius;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    resetGame() {
        this.car.x = 200;
        this.car.y = 200;
        this.car.rotation = 0;
        this.car.speed = 0;
        this.car.acceleration = 0;
        this.car.angularVelocity = 0;
        this.car.fuel = this.car.maxFuel;
        
        this.score = 0;
        this.gameOver = false;
        
        this.camera.x = 0;
        this.camera.y = 0;
        
        this.coins = [];
        this.fuelCans = [];
        this.powerUps = [];
        this.generateCollectibles();
        
        // Reset particles
        this.particles = [];
        
        // Reset power-ups
        Object.values(this.activePowerUps).forEach(powerUp => {
            powerUp.active = false;
            powerUp.timer = 0;
        });
        
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        
        // Restart background music
        this.sounds.background.currentTime = 0;
        this.sounds.background.play();
        
        // Reinitialize vehicle
        this.initializeVehicle();
    }
    
    // Add new particle effect system
    createParticle(x, y, color, type = 'collect') {
        const particle = {
            x, y,
            color,
            life: 1,
            type,
            vx: (Math.random() - 0.5) * 5,
            vy: type === 'collect' ? -5 : Math.random() * 2 - 4,
            size: type === 'collect' ? 5 : 2
        };
        this.particles.push(particle);
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= 0.02;
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.type === 'exhaust') {
                p.vy += 0.1; // Gravity for exhaust particles
            }
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    getTopScores() {
        // Add current score and sort
        if (this.gameOver && this.score > 0) {
            this.highScores.push(this.score);
            this.highScores.sort((a, b) => b - a);
            this.highScores = this.highScores.slice(0, 5); // Keep top 5
            localStorage.setItem('hillClimbHighScores', JSON.stringify(this.highScores));
        }
        return this.highScores;
    }
    
    activatePowerUp(type) {
        this.activePowerUps[type].active = true;
        this.activePowerUps[type].timer = 300; // 5 seconds (60 fps * 5)
    }
    
    deactivatePowerUp(type) {
        this.activePowerUps[type].active = false;
    }
    
    getPowerUpColor(type) {
        const colors = {
            doubleScore: '#FFD700',
            speedBoost: '#FF4500',
            fuelEfficiency: '#32CD32'
        };
        return colors[type];
    }
    
    drawUpgradeMenu() {
        if (!this.showUpgradeMenu) return;
        
        // Draw semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw title
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Upgrades', this.canvas.width/2, 50);
        
        // Draw available coins
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Available Coins: ${this.stats.totalCoins}`, this.canvas.width/2, 90);
        
        // Draw upgrade options
        const vehicleUpgrades = this.upgrades[this.currentVehicle];
        let y = 150;
        
        Object.entries(vehicleUpgrades).forEach(([type, upgrade]) => {
            // Draw upgrade name
            this.ctx.textAlign = 'left';
            this.ctx.fillText(type.toUpperCase(), 100, y);
            
            // Draw level bars
            for (let i = 0; i < upgrade.maxLevel; i++) {
                this.ctx.fillStyle = i < upgrade.level ? 'green' : 'gray';
                this.ctx.fillRect(300 + i * 30, y - 20, 20, 20);
            }
            
            // Draw upgrade button if not maxed
            if (upgrade.level < upgrade.maxLevel) {
                this.ctx.fillStyle = this.stats.totalCoins >= upgrade.cost ? 'green' : 'red';
                this.ctx.fillRect(500, y - 20, 100, 30);
                this.ctx.fillStyle = 'white';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${upgrade.cost}`, 550, y);
            }
            
            y += 60;
        });
        
        // Draw back button
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(this.canvas.width/2 - 60, y + 20, 120, 40);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('BACK', this.canvas.width/2, y + 45);
    }
    
    purchaseUpgrade(type) {
        const upgrade = this.upgrades[this.currentVehicle][type];
        if (upgrade.level < upgrade.maxLevel && this.stats.totalCoins >= upgrade.cost) {
            this.stats.totalCoins -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);
            this.initializeVehicle();
            this.saveGame();
            this.checkAchievements();
        }
    }
    
    checkAchievements() {
        // Speed Demon
        if (!this.achievements.speedDemon.achieved && Math.abs(this.car.speed) >= this.car.maxSpeed) {
            this.achievements.speedDemon.achieved = true;
        }
        
        // Coin Collector
        if (!this.achievements.coinCollector.achieved && this.stats.totalCoins >= 500) {
            this.achievements.coinCollector.achieved = true;
        }
        
        // Upgrade King
        const vehicleUpgrades = this.upgrades[this.currentVehicle];
        const allMaxed = Object.values(vehicleUpgrades).every(upgrade => upgrade.level === upgrade.maxLevel);
        if (!this.achievements.upgradeKing.achieved && allMaxed) {
            this.achievements.upgradeKing.achieved = true;
        }
        
        this.saveGame();
    }
    
    updateDailyChallenges() {
        const now = new Date().setHours(0, 0, 0, 0);
        if (this.challenges.lastUpdate < now) {
            this.challenges.current = this.generateDailyChallenges();
            this.challenges.lastUpdate = now;
            this.saveGame();
        }
    }
    
    generateDailyChallenges() {
        const challengeTypes = [
            { type: 'distance', description: 'Travel {goal} units', 
              getGoal: () => Math.floor(Math.random() * 3000 + 2000) },
            { type: 'coins', description: 'Collect {goal} coins', 
              getGoal: () => Math.floor(Math.random() * 15 + 10) },
            { type: 'airTime', description: 'Stay airborne for {goal} seconds', 
              getGoal: () => Math.floor(Math.random() * 5 + 3) },
            { type: 'speed', description: 'Reach a speed of {goal}', 
              getGoal: () => Math.floor(Math.random() * 5 + 8) },
            { type: 'fuel', description: 'Use less than {goal} fuel', 
              getGoal: () => Math.floor(Math.random() * 30 + 50) }
        ];
        
        const challenges = [];
        const usedTypes = new Set();
        
        while (challenges.length < this.challenges.maxChallenges) {
            const index = Math.floor(Math.random() * challengeTypes.length);
            const challenge = challengeTypes[index];
            
            if (!usedTypes.has(challenge.type)) {
                usedTypes.add(challenge.type);
                const goal = challenge.getGoal();
                challenges.push({
                    type: challenge.type,
                    description: challenge.description.replace('{goal}', goal),
                    goal,
                    progress: 0,
                    completed: false,
                    reward: Math.floor(goal * 2)
                });
            }
        }
        
        return challenges;
    }
    
    checkMissionsAndChallenges() {
        // Check missions
        Object.values(this.missions).forEach(mission => {
            if (mission.progress >= mission.goal && !mission.completed) {
                mission.completed = true;
                this.stats.totalCoins += mission.reward;
                this.showNotification(`Mission Complete: ${mission.name}`, `Reward: ${mission.reward} coins`);
            }
        });
        
        // Check challenges
        this.challenges.current.forEach(challenge => {
            if (challenge.progress >= challenge.goal && !challenge.completed) {
                challenge.completed = true;
                this.stats.totalCoins += challenge.reward;
                this.showNotification(`Challenge Complete!`, `Reward: ${challenge.reward} coins`);
            }
        });
        
        this.saveGame();
    }
    
    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 1000);
        }, 3000);
    }
    
    drawMissionMenu() {
        if (!this.showMissionMenu) return;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Missions & Challenges', this.canvas.width/2, 50);
        
        // Draw active event if any
        if (this.events.active) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(50, 70, this.canvas.width - 100, 60);
            this.ctx.fillStyle = 'black';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(this.events.active.name, this.canvas.width/2, 95);
            this.ctx.font = '16px Arial';
            this.ctx.fillText(this.events.active.description, this.canvas.width/2, 120);
        }
        
        // Draw missions
        let y = 150;
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Daily Missions', 50, y);
        
        y += 30;
        this.challenges.current.forEach(challenge => {
            this.drawProgressBar(50, y, challenge);
            y += 60;
        });
        
        // Draw permanent missions
        y += 20;
        this.ctx.fillText('Career Missions', 50, y);
        y += 30;
        
        Object.values(this.missions).forEach(mission => {
            this.drawProgressBar(50, y, mission);
            y += 60;
        });
        
        // Back button
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(this.canvas.width/2 - 60, this.canvas.height - 60, 120, 40);
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BACK', this.canvas.width/2, this.canvas.height - 35);
    }
    
    drawProgressBar(x, y, mission) {
        const width = this.canvas.width - 100;
        
        // Mission name and progress
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(mission.description, x, y);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${Math.floor(mission.progress)}/${mission.goal}`, x + width, y);
        
        // Progress bar background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x, y + 10, width, 20);
        
        // Progress bar fill
        const progress = Math.min(mission.progress / mission.goal, 1);
        this.ctx.fillStyle = mission.completed ? 'green' : 'blue';
        this.ctx.fillRect(x, y + 10, width * progress, 20);
        
        // Reward display
        if (!mission.completed) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${mission.reward} coins`, x + width, y + 25);
        } else {
            this.ctx.fillStyle = 'green';
            this.ctx.fillText('COMPLETED', x + width, y + 25);
        }
    }
    
    startRandomEvent() {
        const eventTypes = Object.entries(this.events.types);
        const [eventId, event] = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        this.events.active = event;
        this.eventTimer = event.duration * 60; // Convert to frames
        this.showNotification('Special Event!', `${event.name}: ${event.description}`);
    }
    
    endEvent() {
        this.events.active = null;
        this.eventTimer = 0;
    }
    
    handleVehicleSelectClick(x, y) {
        // Check vehicle clicks
        let checkY = 120;
        Object.keys(this.vehicles).forEach(id => {
            if (y >= checkY - 30 && y <= checkY + 70 &&
                x >= this.canvas.width/2 - 150 && x <= this.canvas.width/2 + 150) {
                this.currentVehicle = id;
            }
            checkY += 120;
        });
        
        // Check start button
        if (y >= checkY && y <= checkY + 40 &&
            x >= this.canvas.width/2 - 60 && x <= this.canvas.width/2 + 60) {
            this.showVehicleSelect = false;
            this.initializeVehicle();
            this.resetGame();
        }
    }
    
    handleUpgradeMenuClick(x, y) {
        // Check upgrade buttons
        const vehicleUpgrades = this.upgrades[this.currentVehicle];
        let buttonY = 130;
        
        Object.entries(vehicleUpgrades).forEach(([type, upgrade]) => {
            if (upgrade.level < upgrade.maxLevel &&
                x >= 500 && x <= 600 &&
                y >= buttonY - 20 && y <= buttonY + 10) {
                this.purchaseUpgrade(type);
            }
            buttonY += 60;
        });
        
        // Check back button
        if (y >= buttonY + 20 && y <= buttonY + 60 &&
            x >= this.canvas.width/2 - 60 && x <= this.canvas.width/2 + 60) {
            this.showUpgradeMenu = false;
        }
    }
    
    handleMissionMenuClick(x, y) {
        // Check back button
        if (y >= this.canvas.height - 60 && y <= this.canvas.height - 20 &&
            x >= this.canvas.width/2 - 60 && x <= this.canvas.width/2 + 60) {
            this.showMissionMenu = false;
        }
    }
    
    playSound(soundName) {
        try {
            if (this.sounds[soundName]) {
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch(e => console.warn('Sound play failed:', e));
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }
    
    stopSound(soundName) {
        try {
            if (this.sounds[soundName]) {
                this.sounds[soundName].pause();
                this.sounds[soundName].currentTime = 0;
            }
        } catch (error) {
            console.warn('Sound stop failed:', error);
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 