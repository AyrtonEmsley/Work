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
}

function loadTimes() {
  const saved = localStorage.getItem("timesheet");
  if (saved) {
    Object.assign(times, JSON.parse(saved));
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

  if (button.textContent === "Clock In") {
    times[day].in.push(timeStr);
    button.textContent = "Clock Out";
  } else {
    times[day].out.push(timeStr);
    button.textContent = "Clock In";
  }

  updateTable();
  saveTimes();
});

function updateTable() {
  for (const day of days) {
    document.getElementById(`${day}-in`).textContent = times[day].in.join(", ");
    document.getElementById(`${day}-out`).textContent =
      times[day].out.join(", ");
  }
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
