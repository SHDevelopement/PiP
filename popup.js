document.getElementById('pipButton').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "activatePiP" });
});

document.getElementById('resetPiP').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "resetPiP" });
  
  // Afficher le message de confirmation
  const message = document.getElementById('message');
  message.style.display = 'block';
  setTimeout(() => {
    message.style.display = 'none';
  }, 2000);
});

document.addEventListener('DOMContentLoaded', () => {
  const opacitySlider = document.getElementById('opacity');
  const shadowSlider = document.getElementById('shadow');
  const opacityValue = document.getElementById('opacityValue');
  const shadowValue = document.getElementById('shadowValue');

  async function sendSettingsToActiveTab(settings) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      action: "updatePiPSettings",
      settings: settings
    });
  }

  opacitySlider.addEventListener('input', () => {
    const value = opacitySlider.value;
    opacityValue.textContent = `${value}%`;
    sendSettingsToActiveTab({
      type: 'opacity',
      value: value / 100
    });
  });

  shadowSlider.addEventListener('input', () => {
    const value = shadowSlider.value;
    shadowValue.textContent = `${value}%`;
    sendSettingsToActiveTab({
      type: 'shadow',
      value: value / 100
    });
  });
});
