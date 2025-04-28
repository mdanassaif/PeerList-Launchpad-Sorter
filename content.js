function getFavicon() {
  const favicon = document.querySelector('link[rel="icon"]')?.href ||
                 document.querySelector('link[rel="shortcut icon"]')?.href ||
                 document.querySelector('link[rel="apple-touch-icon"]')?.href ||
                 'https://peerlist.io/favicon.ico';
  
  return favicon;
}

function createSortButton() {
  // Check Correct URL pattern
  const urlPattern = /^https:\/\/peerlist\.io\/launchpad\/\d{4}\/week\/\d{1,2}$/;
  if (!urlPattern.test(window.location.href)) {
    return; // Exit if not on the correct URL pattern
  }

  const existingButton = document.getElementById('peerlist-sort-button');
  if (existingButton) existingButton.remove();
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'peerlist-sort-container';
  
  // Main sort button
  const button = document.createElement('button');
  button.id = 'peerlist-sort-button';
  button.className = 'peerlist-sort-button';
  button.innerHTML = `
    <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
    <span>Sort by Upvotes</span>
  `;
  
  // Add minimize button
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'peerlist-minimize-button';
  minimizeButton.innerHTML = '−';
  minimizeButton.title = 'Minimize';
  
  minimizeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    buttonContainer.style.display = 'none';
    localStorage.setItem('peerlistButtonMinimized', 'true');
  });
  
  // Add dark mode toggle button
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'peerlist-dark-mode-toggle';
  darkModeToggle.innerHTML = '🌓';
  darkModeToggle.title = 'Toggle Dark Mode';
  
  darkModeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('peerlist-dark-mode');
    const isDarkMode = document.body.classList.contains('peerlist-dark-mode');
    localStorage.setItem('peerlistDarkMode', isDarkMode);
    showNotification(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}!`, 'success');
  });
  
  button.appendChild(minimizeButton);
  button.appendChild(darkModeToggle);
  
  let isSorted = false;
  button.addEventListener('click', () => {
    button.innerHTML = `
      <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
      <span>Processing...</span>
    `;
    button.appendChild(minimizeButton);
    button.appendChild(darkModeToggle);
    button.style.cursor = 'wait';
    
    setTimeout(() => {
      try {
        const result = sortByUpvotes();
        if (result === 'no_projects') {
          showNotification('No projects found to sort', 'warning');
          button.innerHTML = `
            <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
            <span>Sort by Upvotes</span>
          `;
        } else {
          isSorted = !isSorted;
          if (isSorted) {
            button.innerHTML = `
              <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
              <span>Reset to Default</span>
            `;
          } else {
            button.innerHTML = `
              <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
              <span>Sort by Upvotes</span>
            `;
          }
        }
        button.appendChild(minimizeButton);
        button.appendChild(darkModeToggle);
        button.style.cursor = 'pointer';
      } catch (error) {
        showNotification('An error occurred while sorting', 'error');
        button.innerHTML = `
          <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
          <span>Sort by Upvotes</span>
        `;
        button.appendChild(minimizeButton);
        button.appendChild(darkModeToggle);
        button.style.cursor = 'pointer';
      }
    }, 100);
  });
  
  buttonContainer.appendChild(button);
  document.body.appendChild(buttonContainer);
  
  // Check if button was minimized
  if (localStorage.getItem('peerlistButtonMinimized') === 'true' && 
      performance.navigation.type !== performance.navigation.TYPE_RELOAD) {
    buttonContainer.style.display = 'none';
  }
  
  // Check for dark mode preference
  if (localStorage.getItem('peerlistDarkMode') === 'true') {
    document.body.classList.add('peerlist-dark-mode');
  }
}

function sortByUpvotes() {
  const allArticles = document.querySelectorAll('article');
  
  if (allArticles.length === 0) {
    return 'no_projects';
  }
  
  const container = allArticles[0].parentElement;
  if (!container) {
    showNotification('Could not find project container', 'error');
    return 'error';
  }
  
  const articles = Array.from(allArticles);
  
  if (window.peerlistOriginalOrder) {
    container.innerHTML = '';
    window.peerlistOriginalOrder.forEach(article => {
      container.appendChild(article.cloneNode(true));
    });
    window.peerlistOriginalOrder = null;
    showNotification('Reset to original order!', 'success');
    return 'reset';
  }
  
  window.peerlistOriginalOrder = articles.map(a => a.cloneNode(true));
  
  articles.sort((a, b) => {
    const extractUpvotes = (article) => {
      const upvoteText = article.querySelector('button span.tabular-nums')?.textContent ||
                        article.querySelector('number-flow-react')?.textContent ||
                        article.querySelector('button[type="button"] span')?.textContent ||
                        '0';
      
      return parseInt(upvoteText.trim(), 10) || 0;
    };
    
    const upvotesA = extractUpvotes(a);
    const upvotesB = extractUpvotes(b);
    
    return upvotesB - upvotesA;
  });
  
  articles.forEach(article => article.remove());
  
  articles.forEach(article => {
    container.appendChild(article);
  });
  
  showNotification('Projects sorted by upvotes!', 'success');
  return 'sorted';
}

function showNotification(message, type = 'success') {
  const existingNotification = document.getElementById('peerlist-notification');
  if (existingNotification) existingNotification.remove();
  
  let emoji;
  switch (type) {
    case 'success':
      emoji = '✅';
      break;
    case 'warning':
      emoji = '⚠️';
      break;
    case 'error':
      emoji = '❌';
      break;
  }
  
  const notification = document.createElement('div');
  notification.id = 'peerlist-notification';
  notification.className = `peerlist-notification ${type}`;
  notification.innerHTML = `
    <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
    <span>${message}</span>
    <span class="emoji">${emoji}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'peerlistSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function initialize() {
  // Reset minimized state on page refresh
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    localStorage.removeItem('peerlistButtonMinimized');
  }
  
  // Create the button
  createSortButton();
}

// Handle page load and navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Handle navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Small delay to ensure page is loaded
    setTimeout(initialize, 1000);
  }
}).observe(document, {subtree: true, childList: true});