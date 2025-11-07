// Theme toggle
const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  toggleBtn.textContent = document.body.classList.contains("light") ? "🌞 Dark Mode" : "🌙 Light Mode";
});

// 🕹️ Hidden mini-game (a small typing challenge)
const secretZone = document.getElementById("secret-zone");
secretZone.addEventListener("click", () => {
  const word = "AI";
  let userInput = prompt("🤖 Welcome to the secret challenge! Type the hidden word:");
  if (userInput && userInput.toUpperCase() === word) {
    alert("🎉 You found the hidden easter egg, Umut! Robots salute you.");
  } else {
    alert("❌ Try again. Maybe you’re just human...");
  }
});
