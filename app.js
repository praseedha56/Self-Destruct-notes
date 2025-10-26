const loginDiv = document.getElementById('login');
const notesDiv = document.getElementById('notes');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');

const noteArea = document.getElementById('noteArea');
const destructTimeInput = document.getElementById('destructTime');
const setTimerBtn = document.getElementById('setTimerBtn');
const saveBtn = document.getElementById('saveBtn');
const saveLogoutBtn = document.getElementById('saveLogoutBtn');
const clearBtn = document.getElementById('clearBtn');
const timerStatus = document.getElementById('timerStatus');

let destructTimer = null;
let currentPassword = null;

loginBtn.addEventListener('click', () => {
  currentPassword = passwordInput.value.trim();
  if (!currentPassword) {
    alert('Please enter a password.');
    return;
  }
  loginDiv.style.display = 'none';
  notesDiv.style.display = 'block';
  loadNotes();
});

// Save note to Firestore
function saveNotes() {
  const noteText = noteArea.value;
  db.collection("notes").doc(currentPassword).set({
    content: noteText,
    timestamp: Date.now()
  }).then(() => {
    timerStatus.textContent = "Note saved to cloud.";
  }).catch(e => alert("Error saving note: " + e));
}

// Load note from Firestore
function loadNotes() {
  db.collection("notes").doc(currentPassword).get()
    .then(doc => {
      if (doc.exists) {
        noteArea.value = doc.data().content || '';
      } else {
        noteArea.value = '';
      }
      timerStatus.textContent = '';
    })
    .catch(e => alert("Error loading note: " + e));
}


function clearNotes() {
  noteArea.value = '';
  localStorage.removeItem(`note_${currentPassword}`);
  localStorage.removeItem(`destructTime_${currentPassword}`);
  if (destructTimer) {
    clearTimeout(destructTimer);
    destructTimer = null;
  }
  timerStatus.textContent = "Note cleared.";
}

function startTimer(seconds) {
  timerStatus.textContent = `Note will self-destruct in ${Math.floor(seconds)} seconds.`;
  if (destructTimer) clearTimeout(destructTimer);
  destructTimer = setTimeout(() => {
    clearNotes();
    alert('Note has self-destructed.');
    logout();
  }, seconds * 1000);
  localStorage.setItem(`destructTime_${currentPassword}`, Date.now() + seconds * 1000);
}

function logout() {
  notesDiv.style.display = 'none';
  loginDiv.style.display = 'block';
  passwordInput.value = '';
  timerStatus.textContent = '';
  if (destructTimer) {
    clearTimeout(destructTimer);
    destructTimer = null;
  }
  currentPassword = null;
}

setTimerBtn.addEventListener('click', () => {
  const seconds = parseInt(destructTimeInput.value, 10);
  if (!seconds || seconds < 1) {
    alert('Please enter a valid destruct time in seconds.');
    return;
  }
  startTimer(seconds);
});

saveBtn.addEventListener('click', saveNotes);

saveLogoutBtn.addEventListener('click', () => {
  saveNotes();
  logout();
});

clearBtn.addEventListener('click', clearNotes);


