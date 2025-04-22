// content.js
function createSortButton() {
  const existingButton = document.getElementById('peerlist-sort-button');
  if (existingButton) existingButton.remove();
  
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'peerlist-sort-container';
  buttonContainer.style.cssText = 'position: fixed; top: 100px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 12px;';
  
  const button = document.createElement('button');
  button.id = 'peerlist-sort-button';
  button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M11 5h10"></path><path d="M11 9h7"></path><path d="M11 13h4"></path><path d="M3 17h18"></path><path d="M11 21h7"></path><path d="M7 5v12"></path><path d="M7 5 3 9"></path><path d="m7 5 4 4"></path></svg>Sort by Upvotes';
  button.style.cssText = `
    padding: 10px 16px;
    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    color: white;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;
  
  button.addEventListener('mouseover', () => {
    button.style.background = 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)';
    button.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)';
    button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
  });
  
  button.addEventListener('mousedown', () => {
    button.style.transform = 'scale(0.97)';
  });
  
  button.addEventListener('mouseup', () => {
    button.style.transform = 'scale(1)';
  });
  
  let isSorted = false;
  button.addEventListener('click', () => {
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>Sorting...';
    button.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
    
    setTimeout(() => {
      sortByUpvotes();
      isSorted = !isSorted;
      
      if (isSorted) {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Reset to Default';
      } else {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M11 5h10"></path><path d="M11 9h7"></path><path d="M11 13h4"></path><path d="M3 17h18"></path><path d="M11 21h7"></path><path d="M7 5v12"></path><path d="M7 5 3 9"></path><path d="m7 5 4 4"></path></svg>Sort by Upvotes';
      }
      
      button.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)';
    }, 100);
  });
  
  buttonContainer.appendChild(button);
  document.body.appendChild(buttonContainer);
}

function sortByUpvotes() {
  const allArticles = document.querySelectorAll('article');
  
  if (allArticles.length === 0) {
    showNotification('No projects found to sort', 'warning');
    return;
  }
  
  const container = allArticles[0].parentElement;
  if (!container) {
    showNotification('Could not find project container', 'error');
    return;
  }
  
  const articles = Array.from(allArticles);
  
  if (window.peerlistOriginalOrder) {
    container.innerHTML = '';
    window.peerlistOriginalOrder.forEach(article => {
      container.appendChild(article.cloneNode(true));
    });
    window.peerlistOriginalOrder = null;
    showNotification('✨ Reset to original order!', 'success');
    return;
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
  
  showNotification('✨ Projects sorted by upvotes!', 'success');
}

function showNotification(message, type = 'success') {
  const existingNotification = document.getElementById('peerlist-notification');
  if (existingNotification) existingNotification.remove();
  
  let bgColor, icon;
  switch (type) {
    case 'success':
      bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      break;
    case 'warning':
      bgColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      break;
    case 'error':
      bgColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      break;
  }
  
  const notification = document.createElement('div');
  notification.id = 'peerlist-notification';
  notification.innerHTML = `${icon}<span>${message}</span>`;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    animation: peerlistSlideIn 0.3s ease forwards;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;
  
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes peerlistSlideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes peerlistSlideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'peerlistSlideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function initialize() {
  createSortButton();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(createSortButton, 1000);
  }
}).observe(document, {subtree: true, childList: true});