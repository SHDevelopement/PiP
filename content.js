function createPiPButton(video, isTwitch = false) {
  const button = document.createElement('button');
  button.className = 'pip-button';
  
  const pipIcon = `<svg class="pip-icon" viewBox="0 0 24 24">
    <path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"/>
  </svg>`;
  const closeIcon = `<svg class="pip-icon" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`;
  
  button.innerHTML = pipIcon;

  button.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed:', error);
    }
  });

  video.addEventListener('enterpictureinpicture', () => {
    button.innerHTML = closeIcon;
    button.classList.add('pip-active');
  });

  video.addEventListener('leavepictureinpicture', () => {
    button.innerHTML = pipIcon;
    button.classList.remove('pip-active');
  });

  if (isTwitch) {
    const container = video.closest('.video-player__container') || video.closest('.persistent-player');
    if (container) {
      container.style.position = 'relative';
      container.appendChild(button);
    }
  } else {
    const container = document.createElement('div');
    container.className = 'video-container';
    container.style.position = 'relative';
    video.parentElement.insertBefore(container, video);
    container.appendChild(video);
    container.appendChild(button);
  }
}

// Ajoutez ces fonctions d'aide globales
function updatePiPOpacity(value) {
  const pipVideo = document.pictureInPictureElement;
  if (pipVideo) {
    pipVideo.style.opacity = value;
  }
}

function updatePiPShadow(value) {
  const pipVideo = document.pictureInPictureElement;
  if (pipVideo) {
    const shadowSize = Math.round(value * 30);
    const shadowColor = `rgba(0, 0, 0, ${value})`;
    pipVideo.style.filter = `drop-shadow(0 0 ${shadowSize}px ${shadowColor})`;
  }
}

// Fonction pour vérifier si nous sommes sur une page valide de Twitch
function isTwitchStreamOrVOD() {
  const url = window.location.href;
  const path = window.location.pathname;
  
  // Vérifier si nous sommes sur une page de stream ou de VOD
  return (path.length > 1 && // Plus qu'un simple "/"
         !path.startsWith('/directory') && 
         !path.startsWith('/settings') &&
         path !== '/');
}

// Fonction pour trouver le lecteur Twitch
function findTwitchPlayer() {
  // Chercher spécifiquement le lecteur Twitch
  return document.querySelector('.video-player__container video') ||
         document.querySelector('.persistent-player video');
}

// Modifier la fonction createPiPButton pour gérer spécifiquement Twitch
function createPiPButton(video) {
  if (!isTwitchStreamOrVOD()) return;

  // Au lieu de créer un nouveau conteneur, on utilise le conteneur existant de Twitch
  const twitchPlayerContainer = video.closest('.video-player__container') || 
                               video.closest('.persistent-player');
  
  if (!twitchPlayerContainer) return;

  const button = document.createElement('button');
  button.className = 'pip-button';
  
  // Créer les deux états du bouton
  const pipIcon = `<svg class="pip-icon" viewBox="0 0 24 24">
    <path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"/>
  </svg>`;
  const closeIcon = `<svg class="pip-icon" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`;
  
  button.innerHTML = pipIcon;

  button.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed:', error);
    }
  });

  // Ajouter directement le bouton au conteneur Twitch
  twitchPlayerContainer.appendChild(button);
  twitchPlayerContainer.style.position = 'relative';

  video.addEventListener('enterpictureinpicture', (event) => {
    button.innerHTML = closeIcon;
    button.classList.add('pip-active');
    
    const { controls } = createPiPControls(video);
    video._pipControls = { controls };
    
    // Appliquer les styles initiaux
    video.style.opacity = '1';
    video.style.filter = 'none';
    
    // Gérer les sous-titres
    const tracks = video.textTracks;
    for (const track of tracks) {
      if (track.mode === 'showing') {
        // Forcer les sous-titres à s'afficher dans la fenêtre PiP
        track.mode = 'hidden';
        track.mode = 'showing';
      }
    }
  });

  video.addEventListener('leavepictureinpicture', () => {
    button.innerHTML = pipIcon;
    button.classList.remove('pip-active');
    
    if (video._pipControls) {
      video._pipControls.controls.remove();
      delete video._pipControls;
    }
  });

  // Observer les changements de sous-titres
  const trackObserver = new MutationObserver((mutations) => {
    if (document.pictureInPictureElement === video) {
      for (const track of video.textTracks) {
        if (track.mode === 'showing') {
          // Réappliquer les sous-titres dans la fenêtre PiP
          track.mode = 'hidden';
          track.mode = 'showing';
        }
      }
    }
  });

  // Observer les changements de sous-titres
  for (const track of video.textTracks) {
    trackObserver.observe(track, {
      attributes: true,
      attributeFilter: ['mode']
    });
  };
}

function createDefaultPiPButton(video) {
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-container';
  video.parentElement.insertBefore(videoContainer, video);
  videoContainer.appendChild(video);
  videoContainer.style.position = 'relative';

  const button = document.createElement('button');
  button.className = 'pip-button';
  
  // Créer les deux états du bouton
  const pipIcon = `<svg class="pip-icon" viewBox="0 0 24 24">
    <path d="M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z"/>
  </svg>`;
  const closeIcon = `<svg class="pip-icon" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>`;
  
  button.innerHTML = pipIcon;

  // Événements du bouton
  button.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed:', error);
    }
  });

  // Événements PiP
  video.addEventListener('enterpictureinpicture', (event) => {
    button.innerHTML = closeIcon;
    button.classList.add('pip-active');
    const { controls } = createPiPControls(video);
    video._pipControls = { controls };
    
    // Appliquer les styles initiaux
    video.style.opacity = '1';
    video.style.filter = 'none';
    
    // ...rest of pip controls code...
  });

  video.addEventListener('leavepictureinpicture', () => {
    button.innerHTML = pipIcon;
    button.classList.remove('pip-active');
    if (video._pipControls) {
      video._pipControls.controls.remove();
      delete video._pipControls;
    }
  });

  videoContainer.appendChild(button);
}

// Remplacer l'ancien code de détection des vidéos par celui-ci
function initializePiPForTwitch() {
  if (!isTwitchStreamOrVOD()) return;

  // Observer pour le lecteur Twitch
  const observer = new MutationObserver((mutations, obs) => {
    const player = findTwitchPlayer();
    if (player && !player.hasAttribute('pip-initialized')) {
      player.setAttribute('pip-initialized', 'true');
      createPiPButton(player);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Vérifier immédiatement si le lecteur existe déjà
  const player = findTwitchPlayer();
  if (player && !player.hasAttribute('pip-initialized')) {
    player.setAttribute('pip-initialized', 'true');
    createPiPButton(player);
  }
}

// Fonction principale d'initialisation
function initialize() {
  const isTwitch = window.location.hostname === 'www.twitch.tv';
  
  if (isTwitch) {
    if (isTwitchStreamOrVOD()) {
      initializePiPForTwitch();
    }
  } else {
    // Pour tous les autres sites
    const videos = document.getElementsByTagName('video');
    Array.from(videos).forEach(video => {
      if (!video.hasAttribute('pip-initialized')) {
        video.setAttribute('pip-initialized', 'true');
        createDefaultPiPButton(video);
      }
    });

    // Observer pour les nouvelles vidéos (hors Twitch)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'VIDEO' && !node.hasAttribute('pip-initialized')) {
            node.setAttribute('pip-initialized', 'true');
            createDefaultPiPButton(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialiser
initialize();

// Réinitialiser lors des changements de navigation sur Twitch (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Attendre que le nouveau contenu soit chargé
    setTimeout(initialize, 1000);
  }
}).observe(document.body, {childList: true, subtree: true});

// Modifier le listener de messages pour tenir compte de Twitch
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!isTwitchStreamOrVOD()) return;
  
  if (request.action === "activatePiP") {
    const videos = document.getElementsByTagName('video');
    
    Array.from(videos).forEach(async (video) => {
      try {
        if (video.readyState >= 2) {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          }
          await video.requestPictureInPicture();
        }
      } catch (error) {
        console.error('Failed to enter Picture-in-Picture mode:', error);
      }
    });
  }

  if (request.action === "resetPiP" && document.pictureInPictureElement) {
    const video = document.pictureInPictureElement;
    const pipWindow = video.parentElement;
    
    // Utiliser l'API Picture-in-Picture Window
    if (document.pictureInPictureElement) {
      const pipWindow = document.pictureInPictureElement.remote;
      
      // Définir la taille standard
      pipWindow.width = 320;
      pipWindow.height = 180;

      // Essayer de repositionner la fenêtre si possible
      if (window.screen) {
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        
        // Positionner au centre de l'écran
        const left = Math.max(0, (screenWidth - 320) / 2);
        const top = Math.max(0, (screenHeight - 180) / 2);
        
        if (pipWindow.positionTo) {
          pipWindow.positionTo({
            x: left,
            y: top
          });
        }
      }
    }
  }
});

// Modifier le listener de messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "togglePiP") {
    const videos = document.getElementsByTagName('video');
    
    // Si une vidéo est déjà en PiP, on la désactive
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
      return;
    }
    
    // Sinon, on active le PiP sur la première vidéo trouvée
    Array.from(videos).forEach(async (video) => {
      try {
        if (video.readyState >= 2) {
          await video.requestPictureInPicture();
        }
      } catch (error) {
        console.error('Failed to toggle Picture-in-Picture mode:', error);
      }
    });
  }
});
