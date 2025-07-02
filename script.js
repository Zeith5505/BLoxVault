let auth = firebase.auth();
let db = firebase.database();

console.log("Firebase initialized:", firebase.apps.length > 0);

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  // 🔐 LOGIN
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("emailInput").value;
      const pass = document.getElementById("passInput").value;

      if (!email || !pass) {
        alert("Please enter both email and password.");
        return;
      }

      try {
        await auth.signInWithEmailAndPassword(email, pass);
        alert("Logged in successfully!");
      } catch (error) {
        alert("Login failed: " + error.message);
      }
    });
  }

  // 🆕 REGISTER
  if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
      const email = document.getElementById("emailInput").value;
      const pass = document.getElementById("passInput").value;

      if (!email || !pass) {
        alert("Please enter both email and password.");
        return;
      }

      try {
        await auth.createUserWithEmailAndPassword(email, pass);
        alert("Account created successfully!");
      } catch (error) {
        alert("Signup failed: " + error.message);
      }
    });
  }

  // ✅ USER STATE
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("login-form")?.remove();
      document.getElementById("user-info").innerText = `Welcome, ${user.email}`;
      updateCoins(user.uid);

      // 💰 5-second cooldown click logic
const clickBtn = document.getElementById("clickBtn");
if (clickBtn) {
  let clickCount = 0;
  let isCooldown = false;

  clickBtn.addEventListener("click", () => {
    if (isCooldown) {
      alert("Wait a few seconds before clicking again.");
      return;
    }

    clickCount++;
    isCooldown = true;
    clickBtn.disabled = true;
    clickBtn.innerText = "Cooldown... ⏳";

    // 🕓 Cooldown every click (5 seconds)
    setTimeout(() => {
      clickBtn.disabled = false;
      clickBtn.innerText = "Click to Earn +1 Coin";
      isCooldown = false;
    }, 5000);

    // 💥 Force ad every 10th click
    if (clickCount % 10 === 0) {
      const adBox = document.createElement("div");
      adBox.id = "forcedAd";
      adBox.style.marginTop = "20px";
      adBox.innerHTML = `
        <h4 style="color:#ccc;">Watch this to continue</h4>
        <script type="text/javascript" src="https://YOUR_MONETAG_SCRIPT.js"></script>
      `;
      document.body.appendChild(adBox);

      // ⏳ Wait longer if it's ad time
      setTimeout(() => {
        document.getElementById("forcedAd")?.remove();
      }, 20000); // 10 sec for ad
    }

    // ✅ Earn coin
    const ref = db.ref("users/" + auth.currentUser.uid + "/coins");
    ref.transaction(coins => (coins || 0) + 1);
  });
}

      if (location.pathname.includes("leaderboard")) {
        loadLeaderboard();
      }
    }
  });
});

function updateCoins(uid) {
  db.ref("users/" + uid + "/coins").on("value", snap => {
    const count = snap.val() || 0;
    const el = document.getElementById("coinCount");
    if (el) el.innerText = count;
  });
}

function redeemRobux() {
  const user = auth.currentUser;
  const username = document.getElementById("robloxUsername")?.value;

  if (!user || !username) {
    alert("Enter your Roblox username first");
    return;
  }

  db.ref("users/" + user.uid).once("value", snap => {
    const coins = snap.val()?.coins || 0;

    if (coins < 100) {
      document.getElementById("redeemStatus").innerText = "Not enough coins!";
    } else {
      db.ref("redeemRequests/" + user.uid).set({
        username,
        coins,
        time: Date.now()
      });
      db.ref("users/" + user.uid + "/coins").set(0);
      document.getElementById("redeemStatus").innerText = "Request sent! Please wait.";
    }
  });
}

function loadLeaderboard() {
  db.ref("users").orderByChild("coins").limitToLast(10).once("value", snap => {
    let list = [];
    snap.forEach(child => {
      list.push({ user: child.key, coins: child.val().coins });
    });
    list.reverse();

    const lb = document.getElementById("leaderboard");
    if (!lb) return;

    lb.innerHTML = "";
    list.forEach((item, i) => {
      lb.innerHTML += `<li>#${i + 1} - ${item.user.slice(0, 6)}... - ${item.coins} coins</li>`;
    });
  });
}
