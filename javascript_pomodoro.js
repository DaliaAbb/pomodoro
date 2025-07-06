// Drag functionality
const card = document.getElementById('timer-card');
let isDragging = false, offsetX, offsetY;

// Only start drag when clicking directly on the card (not its children)
card.addEventListener('mousedown', (e) => {
  // Prevent drag if target is an interactive UI element
  const ignoredTags = ['input', 'button', 'select', 'textarea', 'label'];
  if (ignoredTags.includes(e.target.tagName.toLowerCase())) return;

  isDragging = true;
  offsetX = e.clientX - card.offsetLeft;
  offsetY = e.clientY - card.offsetTop;

  // Optional: improve UX with cursor change
  card.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  card.style.cursor = 'grab';
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    card.style.left = (e.clientX - offsetX) + 'px';
    card.style.top = (e.clientY - offsetY) + 'px';
  }
});


//////////////////////////////////////////////////////////////////////////

//variables
let pomodoroDuration = 25;
let shortBreakDuration = 5;
let longBreakDuration = 15;
let currentTime = pomodoroDuration;
let countdowntimer = null;
let timeLeftinSeconds = 0;

//////////////////////////////////////////////////////////////////////////


window.addEventListener('load', () => {
    // Load saved settings or use default values
    const savedPomodoro = parseInt((localStorage.getItem('pomodoroDuration')) || 25)*60;
    const savedShortBreak = parseInt(localStorage.getItem('shortBreakDuration')) || 5;
    const savedLongBreak = parseInt(localStorage.getItem('longBreakDuration')) || 15;
  
    document.getElementById('pomodoro-time').value = savedPomodoro;
    document.getElementById('short-break').value = savedShortBreak;
    document.getElementById('long-break').value = savedLongBreak;
  
    // Set the initial time and show it
    current = savedPomodoro*60;
    updateTimerDisplay(current);
  });
  

// Update timer display
function updateTimerDisplay(seconds) {
    const timerDisplay = document.querySelector('#main-time');
    if (timerDisplay) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }
  

// Show/hide settings panel on icon click
    document.getElementById('settings-toggle').addEventListener('click', () => {
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel.classList.toggle('hidden');
  });

  
  document.getElementById('save-settings').addEventListener('click', (event) => {
  
    // Get updated values from inputs
    pomodoroDuration = parseInt(document.getElementById('pomodoro-time').value) || 25;
    shortBreakDuration = parseInt(document.getElementById('short-break').value) || 5;
    longBreakDuration = parseInt(document.getElementById('long-break').value) || 15;
  
    const autoTransition = document.getElementById('auto-transition').checked;
    const selectedSound = document.getElementById('timer-sound').value;
    const volume = document.getElementById('volume-control').value;
  
    // Save new values to localStorage
    localStorage.setItem('pomodoroDuration', pomodoroDuration);
    localStorage.setItem('shortBreakDuration', shortBreakDuration);
    localStorage.setItem('longBreakDuration', longBreakDuration);
    localStorage.setItem('autoTransition', autoTransition);
    localStorage.setItem("timerSound", document.getElementById("timer-sound").value);
    localStorage.setItem('volume', volume);
  
    // Hide the settings panel
    document.getElementById('settings-panel').classList.add('hidden');
  
    // Reset the timer to the new duration
    timeLeftinSeconds = pomodoroDuration * 60; // convert to seconds;
    updateTimerDisplay(timeLeftinSeconds);     // show the new time
  });


//////////////////////////////////////////////////////////////////////////

//converting minutes to MM:SS and updating the display
function displayTimeCount(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const display = document.getElementById('main-time');
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

let currentMode = 'pomodoro';
let cyclesCompleted = 0;
// stating the countdown:

function playsound() {
    const soundId = document.getElementById("timer-sound").value;
    const audio = document.getElementById(soundId);
    if (audio) {
      audio.volume = (parseInt(localStorage.getItem("volume")) || 50) / 100;
      audio.currentTime = 0;
      audio.play();
    }
}

function countDown() {
  if (countdowntimer) return;

  if (timeLeftinSeconds === null) {
    timeLeftinSeconds = pomodoroDuration * 60;
    displayTimeCount(timeLeftinSeconds);
  }

  countdowntimer = setInterval(() => {
    if (timeLeftinSeconds > 0) {
      timeLeftinSeconds--;
      displayTimeCount(timeLeftinSeconds);
    } else {
      clearInterval(countdowntimer);
      countdowntimer = null;
      timeLeftinSeconds = null;
      document.getElementById('main-time').textContent = "00:00";
      playsound();

      if (currentMode === 'pomodoro') {
        cyclesCompleted++;
        // Save cyclesCompleted after increment
        localStorage.setItem('cyclesCompleted', cyclesCompleted);
      }
      updateDots();

      if (document.getElementById('auto-transition').checked) {
        if (currentMode === 'pomodoro') {
          if (cyclesCompleted % 5 === 0) {
            switchMode('longBreak');
          } else {
            switchMode('shortBreak');
          }
        } else {
          switchMode('pomodoro');
        }

        setTimeout(() => {
          countDown(); // Start next session
        }, 1000);
      }
    }
  }, 1000);
}

//////////////////////////////////////////////////////////////////////////

// to start the countdown:
document.getElementById('start-button').addEventListener('click', countDown)

// to pause the countdown
document.getElementById('pause-button').addEventListener('click', () => {
    clearInterval(countdowntimer);
    countdowntimer = null;
});

document.getElementById('reset').addEventListener('click', () => {
    clearInterval(countdowntimer);
    countdowntimer = null;
    timeLeftinSeconds = pomodoroDuration * 60;
    displayTimeCount(timeLeftinSeconds);
});

//////////////////////////////////////////////////////////////////////////

const label = document.querySelector('.mode-label'); // fixed selector
const menu = document.querySelector('.menu');
const items = document.querySelectorAll('.menu .item');

//Toggleing menu on label click
label.addEventListener('click', () => {
  menu.classList.toggle('show');
});

items.forEach(item => {
  item.addEventListener('click', () => {
    label.textContent = item.textContent + ' ▾';
    menu.classList.remove('show');
  });
});

// Auto-hide menu when clicking outside
document.addEventListener('click', (e) => {
  if (!label.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('show');
  }
});

//////////////////////////////////////////////////////////////////////////

//toggle pomodoro, shortbreak or long break manually or automatically when mode auto transition button is clicked, and show corresponding counter for them
const MODES = {
    pomodoro: { label: "Pomodoro", duration: () => pomodoroDuration * 60 },
    shortBreak: { label: "Short Break", duration: () => shortBreakDuration * 60 },
    longBreak: { label: "Long Break", duration: () => longBreakDuration * 60 }
  };

// function to switch modes and update the timer display
function switchMode(mode) {
  currentMode = mode;
  clearInterval(countdowntimer);
  countdowntimer = null;
  timeLeftinSeconds = MODES[mode].duration();
  displayTimeCount(timeLeftinSeconds);

  // Update button highlights
  modeButtons.forEach(btn => {
    if (btn.textContent === MODES[mode].label) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

  //toggle pomodoro, shortbreak or long break manually  when mode auto transition button is clicked, and show corresponding counter for them
  const modeButtons = document.querySelectorAll('.mode-buttons button');

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    modeButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    if (button.textContent === MODES.pomodoro.label) {
        switchMode('pomodoro');
    } else if (button.textContent === MODES.shortBreak.label){
        switchMode('shortBreak');
    }else if (button.textContent === MODES.longBreak.label){
        switchMode('longBreak');
    }
    });
});
  //////////////////////////////////////////////////////////////////////////

  //dot tracker

let pomodoroCount = 0;
const dots = document.querySelectorAll(".dot");
const maxCycles = 5;


function updateDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index < pomodoroCount);
  });
}

function resetDotTracker() {
  dots.forEach(dot => dot.classList.remove('active'));
}

function incrementCycle() {
  pomodoroCount++;
  if (pomodoroCount > maxCycles) {
    pomodoroCount = 0;  // reset when exceeding max cycles
  }
  updateDots();
  localStorage.setItem('pomodoroCount', pomodoroCount);
}

  function resetTimer() {
    clearInterval(countdowntimer);
    countdowntimer = null;
    timeLeftinSeconds = null;
    document.getElementById('main-time').textContent = "00:00";
    cyclesCompleted = 0;
    localStorage.setItem('cyclesCompleted', cyclesCompleted); // reset saved state
    resetDotTracker();
    switchMode('pomodoro');
  }
  
  

  //////////////////////////////////////////////////////////////////////////
  //THE TODO PANEL:

  const openBtn = document.getElementById('openBtn');
  const closeBtn = document.getElementById('closeBtn');
  const todopanel = document.getElementById('todopanel');
  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const add_to_list = document.getElementById('add_to_list');
  const openSoundboardBtn = document.getElementById('open-soundboard');
  const closeSoundboardBtn = document.getElementById('close-soundboard'); // Soundboard close button
  const soundboardPanel = document.getElementById('soundboard-panel');


  //saving the todo list in a local storage
  function saveTodos() {
    const items = [];
    document.querySelectorAll('.todo-item').forEach(li => {
        const text = li.querySelector('.todo-text').textContent;
        const checked = li.querySelector('input[type="checkbox"]').checked;
        items.push({ text, checked });
    });
    localStorage.setItem('todoList', JSON.stringify(items));
}

function loadTodos() {
    add_to_list.innerHTML = '';
    const items = JSON.parse(localStorage.getItem('todoList') || '[]');

    items.forEach(item => {
        createTodoItem(item.text, item.checked);
    });
}

function createTodoItem(text, isChecked) {
    const li = document.createElement('li');
    li.classList.add('todo-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('round-checkbox');
    checkbox.checked = isChecked;

    const span = document.createElement('span');
    span.textContent = text;
    span.classList.add('todo-text');
    if (isChecked) span.classList.add('done');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.style.display = isChecked ? 'inline-block' : 'none';

    // Toggle done state and show/hide bin
    checkbox.addEventListener('change', () => {
        span.classList.toggle('done', checkbox.checked);
        deleteBtn.style.display = checkbox.checked ? 'inline-block' : 'none';
        saveTodos();
    });

    // Remove task
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTodos();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    add_to_list.appendChild(li);
}

addBtn.addEventListener('click', () => {
    const itemText = todoInput.value.trim();
    if (itemText) {
        createTodoItem(itemText, false);
        todoInput.value = '';
        saveTodos();
    }
});


  // Open the panel
  openBtn.addEventListener('click', () => {
      todopanel.classList.add('open');
  });
  
  // Close the panel
  closeBtn.addEventListener('click', () => {
      todopanel.classList.remove('open');
  });



  // Add a new item
addBtn.addEventListener('click', () => {
    const itemText = todoInput.value.trim();
    if (itemText) {
        const li = document.createElement('li');
        li.classList.add('todo-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('round-checkbox');

        const span = document.createElement('span');
        span.textContent = itemText;
        span.classList.add('todo-text');

        checkbox.addEventListener('change', () => {
            span.classList.toggle('done', checkbox.checked);
            if (checkbox.checked) {
                li.dataset.timestamp = Date.now();
            } else {
                delete li.dataset.timestamp;
            }
            saveTodos();
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        add_to_list.appendChild(li);

        todoInput.value = '';
        saveTodos();
    }
});
  
  // Enter key adds item too
  todoInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
          addBtn.click();
      }
  });
  
  // Remove item when clicked
  add_to_list.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() === 'li') {
        event.target.classList.toggle('done');
      }
  });
  
  window.addEventListener('load', () => {
    // Existing todo load
    loadTodos();
  
    // Load cyclesCompleted from localStorage or set to 0
    cyclesCompleted = parseInt(localStorage.getItem('cyclesCompleted')) || 0;
    updateDots();
  });
  
//////////////////////////////////////////////////////////////////////////
//youtube url adder:
let youtubePlayer;
let isMuted = false;

openSoundboardBtn.addEventListener('click', () => {
  soundboardPanel.classList.add('open');
})

closeSoundboardBtn.addEventListener('click', () => {
  soundboardPanel.classList.remove('open');
})

// Load YouTube API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(tag);

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: '',
    playerVars: {
      autoplay: 1,
      loop: 1,
      playlist: '',
    },
    events: {
      onReady: () => {
        youtubePlayer.setVolume(50);
      }
    }
  });
};

// Link handling
document.getElementById("youtube-url").addEventListener("change", () => {
  const videoId = getYouTubeVideoId(document.getElementById("youtube-url").value);
  if (videoId && youtubePlayer) {
    youtubePlayer.loadVideoById(videoId);
    youtubePlayer.setLoop(true);
    document.getElementById("youtube-player").style.display = "block";
  }
});

document.getElementById("youtube-volume").addEventListener("input", (e) => {
  if (youtubePlayer) {
    youtubePlayer.setVolume(e.target.value);
    isMuted = false;
    document.getElementById("mute-toggle").textContent = "🔊";
  }
});

document.getElementById("mute-toggle").addEventListener("click", () => {
  if (!youtubePlayer) return;
  isMuted = !isMuted;
  if (isMuted) {
    youtubePlayer.mute();
    document.getElementById("mute-toggle").textContent = "🔇";
  } else {
    youtubePlayer.unMute();
    document.getElementById("mute-toggle").textContent = "🔊";
  }
});

function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/))([\w\-]{11})/);
  return match ? match[1] : null;
}
//////////////////////////////////////////////////////////////////////////


function hideBothButtons() {
  openBtn.classList.add('hidden');
  openSoundboardBtn.classList.add('hidden');
}

function showBothButtons() {
  openBtn.classList.remove('hidden');
  openSoundboardBtn.classList.remove('hidden');
}

openBtn.addEventListener('click', () => {
  todopanel.classList.add('open');           // Add class instead of setting style directly
  soundboardPanel.classList.remove('open');  // Close soundboard panel
  hideBothButtons();
  });

  closeBtn.addEventListener('click', () => {
    todopanel.classList.remove('open');        // Remove class instead of hiding via display
    showBothButtons();
  });

openSoundboardBtn.addEventListener('click', () => {
  soundboardPanel.classList.add('open');    // Open soundboard panel
  hideBothButtons();
});

closeSoundboardBtn.addEventListener('click', () => {
  soundboardPanel.classList.remove('open'); // Close soundboard panel
  showBothButtons();
});

//////////////////////////////////////////////////////////////////////////
//focus mode:

const focusToggle = document.getElementById('focus-mode-button');

focusToggle.addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');

  if (document.body.classList.contains('focus-mode')) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    focusToggle.textContent = '🔙 Exit Focus';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    focusToggle.textContent = '🧘 Focus Mode';
  }

  updateFocusStatsUI(); // Refresh stats on toggle
});