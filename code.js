const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const times = {
  mon: { in: [], out: [] },
  tue: { in: [], out: [] },
  wed: { in: [], out: [] },
  thu: { in: [], out: [] },
  fri: { in: [], out: [] },
  sat: { in: [], out: [] },
  sun: { in: [], out: [] },
};

let buttonState = "Clock In";

function roundTo15Min(date) {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  rounded.setMinutes(roundedMinutes);
  if (roundedMinutes === 60) {
    rounded.setMinutes(0);
    rounded.setHours(rounded.getHours() + 1);
  }
  return rounded;
}

function saveTimes() {
  localStorage.setItem("timesheet", JSON.stringify(times));
  localStorage.setItem("buttonState", buttonState);
}

function loadTimes() {
  const saved = localStorage.getItem("timesheet");
  if (saved) {
    Object.assign(times, JSON.parse(saved));
  }
  const savedState = localStorage.getItem("buttonState");
  if (savedState) {
    buttonState = savedState;
  }
}

const button = document.getElementById("clockButton");

button.addEventListener("click", () => {
  const now = new Date();
  const roundedNow = roundTo15Min(now);
  const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const day = days[dayIndex];
  const timeStr = roundedNow.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (buttonState === "Clock In") {
    times[day].in.push(timeStr);
    buttonState = "Clock Out";
  } else {
    times[day].out.push(timeStr);
    buttonState = "Clock In";
  }

  button.textContent = buttonState;
  updateTable();
  saveTimes();
});

function updateTable() {
  for (const day of days) {
    document.getElementById(`${day}-in`).textContent = times[day].in.join(", ");
    document.getElementById(`${day}-out`).textContent =
      times[day].out.join(", ");
  }
  updateTotal();
}

function updateTotal() {
  let total = 0;
  for (const day of days) {
    const ins = times[day].in;
    const outs = times[day].out;
    for (let i = 0; i < Math.min(ins.length, outs.length); i++) {
      if (outs[i] === "Holiday") {
        total += 10;
      } else {
        const inTime = parseTime(ins[i]);
        const outTime = parseTime(outs[i]);
        if (inTime && outTime && outTime > inTime) {
          total += (outTime - inTime) / (1000 * 60 * 60);
        }
      }
    }
  }
  document.getElementById('weekly-total-cell').textContent = `Weekly Total: ${total.toFixed(2)} hours`;
}

function parseTime(str) {
  if (!str || str === "Holiday") return null;
  const parts = str.split(":");
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return new Date(0, 0, 0, h, m);
}

// Add event listeners for editable cells
days.forEach((day) => {
  const inCell = document.getElementById(`${day}-in`);
  const outCell = document.getElementById(`${day}-out`);

  inCell.addEventListener("input", () => {
    times[day].in = inCell.textContent
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    saveTimes();
  });

  outCell.addEventListener("input", () => {
    times[day].out = outCell.textContent
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    saveTimes();
  });
});

// Load times on page load
loadTimes();
updateTable();
button.textContent = buttonState;

// Add event listeners for holiday buttons
document.querySelectorAll(".holiday-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const day = e.target.dataset.day;
    times[day].in = ["On"];
    times[day].out = ["Holiday"];
    updateTable();
    saveTimes();
  });
});
// Reset button
document.getElementById('reset-btn').addEventListener('click', () => {
  for (const day of days) {
    times[day].in = [];
    times[day].out = [];
  }
  updateTable();
  saveTimes();
});