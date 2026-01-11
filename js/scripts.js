async function main() {
// ================= CLASSES =================

class Engine {
    constructor(cylinders) {
        this.cylinders = cylinders;
        this.running = false;
    }
    start() { this.running = true; }
    stop() { this.running = false; }
}

class Transmission {
    constructor(type, gearCount = 6) {
        this.type = type;
        this.gearCount = gearCount;
        this.currentGear = type === "automatic" ? "park" : "neutral";
    }

    shift(gear) {
        if (this.type === "automatic") {
            const valid = ["park", "reverse", "neutral", "drive"];
            if (!valid.includes(gear)) {
                throw new Error("Invalid gear selection.");
            }
        } else {
            if (gear !== "neutral" && (gear < 1 || gear > this.gearCount)) {
                throw new Error("Invalid gear selection.");
            }
        }

        this.currentGear = gear;
    }

    canStart() {
        return this.type === "automatic"
            ? ["park", "neutral"].includes(this.currentGear)
            : this.currentGear === "neutral";
    }

    canStop() {
        return this.type === "automatic"
            ? this.currentGear === "park"
            : this.currentGear === "neutral";
    }

    isDrivingGear() {
        return this.type === "automatic"
            ? this.currentGear === "drive"
            : this.currentGear !== "neutral" && this.currentGear !== "reverse";
    }
}

class Car {
    constructor(make, model, year, transmissionType) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.odometer = 0;
        this.engine = new Engine(6); 
        this.transmission = new Transmission(transmissionType);
    }

    start() {
        if (this.engine.running) {
            throw new Error("Engine is already running.");
        }

        if (!this.transmission.canStart()) {
            throw new Error("Must be in Park or Neutral to start engine.");
        }

        this.engine.start();
        logMessage("✅ Engine started");
        updateDisplay();
    }

    stop() {
        if (!this.transmission.canStop()) {
            throw new Error("Must be in Park (automatic) or Neutral (manual) to stop engine.");
        }

        this.engine.stop();
        logMessage("🛑 Engine stopped");
        updateDisplay();
    }

    shift(gear) {
        // REQUIRED: any gear selection while engine OFF must throw error
        if (!this.engine.running) {
            throw new Error("Cannot select gears while engine is stopped.");
        }

        this.transmission.shift(gear);
        logMessage(`🔄 Gear changed to ${gear}`);
        updateDisplay();
        generateTransmissionControls();
    }

    drive(distance) {
        // REQUIRED: Drive button must throw error if engine stopped
        if (!this.engine.running) {
            throw new Error("Cannot drive while engine is off.");
        }

        if (!this.transmission.isDrivingGear()) {
            throw new Error("Must be in Drive or a forward gear to drive.");
        }

        if (distance <= 0 || isNaN(distance)) {
            throw new Error("Distance must be greater than 0.");
        }

        this.odometer += distance;
        logMessage(`🚗 Drove ${distance} km (Total: ${this.odometer} km)`);
        updateDisplay();
    }
}

// ================= UI FUNCTIONS =================

function updateDisplay() {
    document.getElementById("car-make").textContent = myCar.make;
    document.getElementById("car-model").textContent = myCar.model;
    document.getElementById("car-year").textContent = myCar.year;
    document.getElementById("car-odometer").textContent = `${myCar.odometer} km`;

    document.getElementById("engine-cylinders").textContent = myCar.engine.cylinders;

    // Transmission TYPE shown only in transmission card 
    document.getElementById("transmission-type").textContent =
    myCar.transmission.type.charAt(0).toUpperCase() +
    myCar.transmission.type.slice(1);


    document.getElementById("current-gear").textContent =
        myCar.transmission.currentGear.toString().toUpperCase();

    const status = document.getElementById("engine-status");
    status.textContent = myCar.engine.running ? "ON" : "OFF";
    status.className = myCar.engine.running ? "engine-on" : "engine-off";
}

function generateTransmissionControls() {
    const container = document.getElementById("transmission-controls");
    container.innerHTML = "";

    if (myCar.transmission.type === "automatic") {
        ["park", "reverse", "neutral", "drive"].forEach(g => {
            const b = document.createElement("label");
            b.textContent = g[0].toUpperCase();
            b.className = "gear-btn" + 
                (myCar.transmission.currentGear === g ? " active" : "");
            b.onclick = () => safe(() => myCar.shift(g));
            container.appendChild(b);
        });
    }
}


function driveFromInput() {
    const d = parseFloat(document.getElementById("drive-distance").value);
    safe(() => myCar.drive(d));
}

function logMessage(msg) {
    const out = document.getElementById("console-output");
    out.innerHTML += msg + "<br>";
    out.scrollTop = out.scrollHeight;
}

function safe(fn) {
    try {
        fn();
    } catch (e) {
        logMessage("❌ " + e.message);
    }
}

// ================= INIT =================

updateDisplay();
generateTransmissionControls();
}