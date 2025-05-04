document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const alarmContainer = document.getElementById('alarm-container');
  const toggleButton = document.getElementById('toggle-button');
  const clockDisplay = document.getElementById('clock');
  const collapsedClock = document.getElementById('collapsed-clock');
  const alarmTimeInput = document.getElementById('alarm-time');
  const setAlarmBtn = document.getElementById('set-alarm');
  const stopAlarmBtn = document.getElementById('stop-alarm');
  const alarmsList = document.getElementById('alarms-list');

  // Alarm variables
  let alarms = [];
  let isAlarmRinging = false;
  let alarmInterval;

  // Toggle expansion
  toggleButton.addEventListener('click', function() {
    alarmContainer.classList.toggle('expanded');
    toggleButton.textContent = alarmContainer.classList.contains('expanded') ? '×' : '≡';
    alarmContainer.style.height = alarmContainer.classList.contains('expanded') ? 'auto' : '25px';
    alarmContainer.style.top = alarmContainer.classList.contains('expanded') ? '15%' : '5%';
  });

  // Update clock
  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const timeString = `${hours}:${minutes}:${seconds}`;
    clockDisplay.textContent = timeString;
    collapsedClock.textContent = `${hours}:${minutes}`;

    // Check if any alarms match current time
    if (!isAlarmRinging) {
      const currentTimeString = `${hours}:${minutes}`;

      for (let i = 0; i < alarms.length; i++) {
        if (alarms[i] === currentTimeString && seconds === '00') {
          triggerAlarm();
          break;
        }
      }
    }
  }

  // Set up the alarm
  function setAlarm() {
    const alarmTime = alarmTimeInput.value;

    if (!alarmTime) {
      alert('Please select a time for your alarm');
      return;
    }

    if (alarms.includes(alarmTime)) {
      alert('This alarm is already set');
      return;
    }

    alarms.push(alarmTime);
    updateAlarmsList();
    alarmTimeInput.value = '';

    showNotification(`Alarm set for ${formatTime(alarmTime)}`);
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#2ecc71';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '2000';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(function() {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 2000);
  }

  // Format time for display
  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  // Update the alarms list display
  function updateAlarmsList() {
    alarmsList.innerHTML = '';

    if (alarms.length === 0) {
      alarmsList.innerHTML = '<div style="font-size: 0.8rem; opacity: 0.7;">No alarms set</div>';
      return;
    }

    alarms.sort().forEach(function(alarm, index) {
      const alarmItem = document.createElement('div');
      alarmItem.className = 'alarm-item';

      const alarmTime = document.createElement('span');
      alarmTime.className = 'alarm-time';
      alarmTime.textContent = formatTime(alarm);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.onclick = function() {
        deleteAlarm(index);
      };

      alarmItem.appendChild(alarmTime);
      alarmItem.appendChild(deleteBtn);
      alarmsList.appendChild(alarmItem);
    });
  }

  // Delete an alarm
  function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmsList();
  }

  // Trigger the alarm
  function triggerAlarm() {
    isAlarmRinging = true;

    // Show expanded view when alarm goes off
    alarmContainer.classList.add('expanded');
    toggleButton.textContent = '×';

    // Create audio context
    let audioContext;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      playAlarmSound(audioContext);

      // Repeat sound
      alarmInterval = setInterval(function() {
        try {
          playAlarmSound(audioContext);
        } catch (e) {
          console.error("Error playing repeating alarm sound:", e);
        }
      }, 1000);
    } catch (e) {
      console.error("Error initializing audio context:", e);
      // Fallback - at least show visual indicator
    }

    // Visual indication
    alarmContainer.classList.add('alarm-going-off');
    stopAlarmBtn.style.display = 'block';
  }

  // Play alarm sound
  function playAlarmSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start with full volume and fade out
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  // Stop the alarm
  function stopAlarm() {
    isAlarmRinging = false;
    clearInterval(alarmInterval);
    alarmContainer.classList.remove('alarm-going-off');
    stopAlarmBtn.style.display = 'none';
  }

  // Set up event listeners
  setAlarmBtn.addEventListener('click', setAlarm);
  stopAlarmBtn.addEventListener('click', stopAlarm);

  // Initialize
  updateClock();
  setInterval(updateClock, 1000);
  updateAlarmsList();

  // Start collapsed
  alarmContainer.classList.remove('expanded');
});
