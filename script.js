// Theme toggle
const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  toggleBtn.textContent = document.body.classList.contains("light") ? "🌞 Dark Mode" : "🌙 Light Mode";
});

// 🕹️ Easter Egg Mini-Game
const bot = document.getElementById("secret-bot");
let waiting = false;

bot.addEventListener("click", () => {
  if (waiting) return;
  alert("🤖 Initiating reaction test! When you see GO!, click OK as fast as you can...");
  waiting = true;

  const delay = Math.random() * 3000 + 1500; // 1.5–4.5 sec delay
  setTimeout(() => {
    const start = Date.now();
    const response = confirm("🟢 GO!");
    const time = Date.now() - start;

    waiting = false;

    if (!response) {
      alert("👀 You gave up! Robots are faster.");
      return;
    }

    if (time < 250) {
      alert(`⚡ Amazing! ${time}ms — Are you sure you’re not a robot, Umut?`);
    } else if (time < 600) {
      alert(`👍 Nice! ${time}ms — You're human... but close!`);
    } else {
      alert(`🐢 ${time}ms — Too slow. The robot wins again!`);
    }
  }, delay);
});

