function getFavicon() {
  const favicon = document.querySelector('link[rel="icon"]')?.href ||
                 document.querySelector('link[rel="shortcut icon"]')?.href ||
                 document.querySelector('link[rel="apple-touch-icon"]')?.href ||
                 'https://peerlist.io/favicon.ico';
  
  return favicon;
}

function createSortButton() {
  // Check Correct URL : ( Basically made for Peerlist launchpad for now)
  const urlPattern = /^https:\/\/peerlist\.io\/launchpad\/\d{4}\/week\/\d{1,2}(\/.*)?$/;
  if (!urlPattern.test(window.location.href)) {
    return; 
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
    <span>Sort Options</span>
  `;
  
  // Add minimize button
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'peerlist-minimize-button';
  minimizeButton.innerHTML = '−';
  minimizeButton.title = 'Minimize';
  
  minimizeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    buttonContainer.style.display = 'none';
  });
  
  // WHo loves dark mode
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'peerlist-dark-mode-toggle';
  darkModeToggle.innerHTML = '🌓';
  darkModeToggle.title = 'Toggle Dark Mode';
  
  darkModeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Toggle dark mode
    document.body.classList.toggle('peerlist-dark-mode');
    
    const isDarkMode = document.body.classList.contains('peerlist-dark-mode');
    
    // Save your choice to localStorage( we care about your choice)
    localStorage.setItem('peerlistDarkMode', isDarkMode);
    
    // Your mood your decisions
    darkModeToggle.innerHTML = isDarkMode ? '☀️' : '🌓';
    darkModeToggle.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    
    // Show notification
    showNotification(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}!`, 'success');
  });
  
  button.appendChild(minimizeButton);
  button.appendChild(darkModeToggle);
  
  // Dropdown menu  
  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'peerlist-dropdown-menu';
  dropdownMenu.style.display = 'none';
  
  // Search and see what you're missing
  const searchContainer = document.createElement('div');
  searchContainer.className = 'peerlist-search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'peerlist-search-input';
  searchInput.placeholder = 'Search projects...';
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    filterProjects(searchTerm);
  });
  
  const searchIcon = document.createElement('span');
  searchIcon.className = 'peerlist-search-icon';
  searchIcon.innerHTML = '🔍';
  
  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);
  dropdownMenu.appendChild(searchContainer);
  
  // Add divider
  const divider = document.createElement('div');
  divider.className = 'peerlist-dropdown-divider';
  dropdownMenu.appendChild(divider);
  
  // Sort options
  const sortOptions = [
    { label: 'Sort by Upvotes', value: 'upvotes', icon: '👍' },
    { label: 'Sort by Engagement (Views + Saves + Comments)', value: 'engagement', icon: '🔥' },
    { label: 'Sort by Staff Picks', value: 'staff-picks', icon: '⭐' },
    { label: 'Sort Alphabetically (A-Z)', value: 'alphabetical', icon: '🔤' },
    { label: 'Predict Future Staff Picks', value: 'predict-staff-picks', icon: '🔮' },
    { label: 'Reset to Default', value: 'reset', icon: '🔄' }
  ];
  
  // Create buttons for each sort option
  sortOptions.forEach(option => {
    const optionButton = document.createElement('button');
    optionButton.className = 'peerlist-dropdown-item';
    
    // Add icon and label with proper spacing
    optionButton.innerHTML = `
      <span class="peerlist-option-icon">${option.icon}</span>
      <span class="peerlist-option-label">${option.label}</span>
    `;
    
    optionButton.addEventListener('click', () => {
      // Hide dropdown
      dropdownMenu.style.display = 'none';
      
      // Update main button text
      button.innerHTML = `
        <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
        <span>Processing...</span>
      `;
      button.appendChild(minimizeButton);
      button.appendChild(darkModeToggle);
      button.style.cursor = 'wait';
      
      // Perform sorting
      setTimeout(() => {
        try {
          let result;
          
          if (option.value === 'reset') {
            result = resetSort();
          } else if (option.value === 'predict-staff-picks') {
            result = predictStaffPicks();
          } else {
            result = sortProjects(option.value);
          }
          
          if (result === 'no_projects') {
            showNotification('No projects found to sort', 'warning');
            button.innerHTML = `
              <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
              <span>Sort Options</span>
            `;
          } else {
            button.innerHTML = `
              <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
              <span>Sort Options</span>
            `;
          }
          button.appendChild(minimizeButton);
          button.appendChild(darkModeToggle);
          button.style.cursor = 'pointer';
        } catch (error) {
          console.error('Sorting error:', error);
          showNotification('An error occurred while sorting', 'error');
          button.innerHTML = `
            <img src="${getFavicon()}" alt="Peerlist Logo" class="peerlist-favicon">
            <span>Sort Options</span>
          `;
          button.appendChild(minimizeButton);
          button.appendChild(darkModeToggle);
          button.style.cursor = 'pointer';
        }
      }, 100);
    });
    
    dropdownMenu.appendChild(optionButton);
  });
  
  // Toggle dropdown on button click
  button.addEventListener('click', () => {
    if (dropdownMenu.style.display === 'none') {
      dropdownMenu.style.display = 'block';
    } else {
      dropdownMenu.style.display = 'none';
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = 'none';
    }
  });
  
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(dropdownMenu);
  document.body.appendChild(buttonContainer);
  
  // Always show the button - removed minimized state persistence as requested
  
  // Check for dark mode preference and apply if needed
  const isDarkMode = localStorage.getItem('peerlistDarkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('peerlist-dark-mode');
    // Update dark mode toggle button to reflect current state
    const darkToggle = document.querySelector('.peerlist-dark-mode-toggle');
    if (darkToggle) {
      darkToggle.innerHTML = '☀️';
      darkToggle.title = 'Switch to Light Mode';
    }
  }
}

function resetSort() {
  // Find all project articles on the page
  const allArticles = document.querySelectorAll('article');
  
  if (allArticles.length === 0) {
    return 'no_projects';
  }
  
  const container = allArticles[0].parentElement;
  if (!container) {
    showNotification('Could not find project container', 'error');
    return 'error';
  }
  
  // If we have stored the original order, restore it
  if (window.peerlistOriginalOrder) {
    // Clear the container first
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Add back the original articles
    window.peerlistOriginalOrder.forEach(article => {
      container.appendChild(article.cloneNode(true));
    });
    
    // Clear the stored order
    window.peerlistOriginalOrder = null;
    showNotification('Reset to original order!', 'success');
    return 'reset';
  } else {
    showNotification('Already in original order', 'info');
    return 'already_reset';
  }
}

function sortProjects(sortType) {
  // Find all project articles on the page
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
  
  // Store the original order for later restoration if not already stored
  if (!window.peerlistOriginalOrder) {
    window.peerlistOriginalOrder = articles.map(a => a.cloneNode(true));
  }
  
  // Sort the articles based on the selected sort type
  articles.sort((a, b) => {
    switch (sortType) {
      case 'upvotes':
        return sortByUpvotesCompare(a, b);
      case 'engagement':
        return sortByEngagementCompare(a, b);
      case 'staff-picks':
        return sortByStaffPicksCompare(a, b);
      case 'alphabetical':
        return sortAlphabeticallyCompare(a, b);
      default:
        return sortByUpvotesCompare(a, b);
    }
  });
  
  // Remove all articles from the DOM
  articles.forEach(article => article.remove());
  
  // Add them back in sorted order
  articles.forEach(article => {
    container.appendChild(article);
  });
  
  let successMessage = '';
  switch (sortType) {
    case 'upvotes':
      successMessage = 'Projects sorted by upvotes!';
      break;
    case 'engagement':
      successMessage = 'Projects sorted by engagement (views + saves + comments)!';
      break;
    case 'staff-picks':
      successMessage = 'Projects sorted by staff picks!';
      break;
    case 'alphabetical':
      successMessage = 'Projects sorted alphabetically (A-Z)!';
      break;
    default:
      successMessage = 'Projects sorted successfully!';
  }
  
  showNotification(successMessage, 'success');
  return 'sorted';
}

// Helper function to predict future staff picks
function predictStaffPicks() {
  // Remove any existing prediction badges
  const existingBadges = document.querySelectorAll('.peerlist-prediction-badge');
  existingBadges.forEach(badge => badge.remove());
  
  // Find all project articles
  const allArticles = document.querySelectorAll('article');
  
  if (allArticles.length === 0) {
    showNotification('No projects found to analyze', 'warning');
    return 'no_projects';
  }
  
  const container = allArticles[0].parentElement;
  if (!container) {
    showNotification('Could not find project container', 'error');
    return 'error';
  }
  
  const articles = Array.from(allArticles);
  
  // Predictformula (engagement + upvotes + quality signals)
  const predictions = articles.map(article => {
    // Extract base metrics
    const upvotes = extractUpvotes(article);
    const engagement = extractEngagement(article);
    
    // Extract quality signals
    const projectName = getProjectName(article);
    const projectDescription = getProjectDescription(article);
    const projectCategory = getProjectCategory(article);
    
    // Calculate quality score factors
    let qualityScore = 0;
    
    // Factor 1: Description length (longer descriptions often show more effort)
    if (projectDescription.length > 100) qualityScore += 5;
    
    // Factor 2: Name originality (shorter names are often more memorable)
    if (projectName.length < 20 && projectName.length > 3) qualityScore += 3;
    
    // Factor 3: Engagement-to-upvote ratio (high ratios can indicate genuine interest)
    const ratio = upvotes > 0 ? engagement / upvotes : 0;
    if (ratio > 2) qualityScore += 5;
    
    // Factor 4: Certain categories get more staff picks (AI, tools, productivity)
    const popularCategories = ['ai', 'tool', 'productivity', 'design', 'developer'];
    if (popularCategories.some(cat => projectCategory.toLowerCase().includes(cat))) {
      qualityScore += 4;
    }
    
    // Calculate final prediction score
    // 50% engagement, 30% upvotes, 20% quality signals
    const predictionScore = (engagement * 0.5) + (upvotes * 0.3) + (qualityScore * 0.2);
    
    // Check if it's already a staff pick (we'll exclude these)
    const isAlreadyStaffPick = isStaffPick(article);
    
    return { 
      article, 
      score: predictionScore,
      isStaffPick: isAlreadyStaffPick,
      name: projectName
    };
  });
  
  // Filter out existing staff picks
  const nonStaffPicks = predictions.filter(p => !p.isStaffPick);
  
  // Sort by prediction score
  nonStaffPicks.sort((a, b) => b.score - a.score);
  
  // Get top 3 predictions
  const topPredictions = nonStaffPicks.slice(0, 3);
  
  // Highlight the predicted staff picks
  topPredictions.forEach((prediction, index) => {
    const article = prediction.article;
    
    // Find the span that contains engagement metrics
    const engagementSpan = article.querySelector('span.flex.gap-2') || 
                          article.querySelector('span.flex.gap-0\\.5.items-center');
    
    if (engagementSpan) {
      // Create a badge similar to the Staff Picked style
      const badge = document.createElement('p');
      badge.className = 'peerlist-prediction-badge font-normal text-xs flex gap-0.5 items-center shrink-0 max-h-6';
      
      // Different colors for different ranks
      let badgeColor;
      if (index === 0) {
        badgeColor = '#9333ea'; // Purple for #1 prediction
      } else if (index === 1) {
        badgeColor = '#2563eb'; // Blue for #2 prediction
      } else {
        badgeColor = '#0891b2'; // Teal for #3 prediction
      }
      
      // Set text color
      badge.style.color = badgeColor;
      
      // Add Peerlist icon + prediction text
      badge.innerHTML = `
        <img alt="Peerlist" loading="lazy" width="14" height="14" src="${getFavicon()}" style="color: transparent;">
        #${index + 1} Staff Pick Prediction
      `;
      
      // Insert the badge right after the engagement span
      engagementSpan.parentNode.insertBefore(badge, engagementSpan.nextSibling);
    } else {
      // Fallback to the old style if no engagement span is found
      article.style.position = 'relative';
      
      const badge = document.createElement('div');
      badge.className = 'peerlist-prediction-badge';
      
      // Different colors for different ranks
      let badgeColor, bgColor;
      if (index === 0) {
        badgeColor = 'white';
        bgColor = 'rgba(147, 51, 234, 0.9)'; 
      } else if (index === 1) {
        badgeColor = 'white';
        bgColor = 'rgba(37, 99, 235, 0.9)'; 
      } else {
        badgeColor = 'white';
        bgColor = 'rgba(8, 145, 178, 0.9)';  
      }
      
      badge.innerHTML = `
        <div class="peerlist-prediction-text">
          <span>🔮 #${index + 1} Staff Pick Prediction</span>
        </div>
      `;
      
      badge.style.position = 'absolute';
      badge.style.top = '10px';
      badge.style.right = '10px';
      badge.style.backgroundColor = bgColor;
      badge.style.color = badgeColor;
      badge.style.padding = '5px 10px';
      badge.style.borderRadius = '8px';
      badge.style.fontSize = '12px';
      badge.style.fontWeight = 'bold';
      badge.style.zIndex = '5';
      badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
      article.appendChild(badge);
    }
  });
  
  // Show notification with results
  showNotification(`Predicted ${topPredictions.length} potential staff picks!`, 'success');
  
  // Create a more detailed notification for the top pick
  if (topPredictions.length > 0) {
    const topPick = topPredictions[0];
    setTimeout(() => {
      showNotification(`Top prediction: "${topPick.name}"`, 'info');
    }, 3500);
  }
  
  return 'predicted';
}


// Helper function to compare upvotes
function sortByUpvotesCompare(a, b) {
  const upvotesA = extractUpvotes(a);
  const upvotesB = extractUpvotes(b);
  
  return upvotesB - upvotesA; // Sort in descending order
}

// Helper function to extract upvotes from an article
function extractUpvotes(article) {
  // Try multiple selectors to find upvote count
  // This makes the extension more robust against site changes
  const upvoteText = article.querySelector('button span.tabular-nums')?.textContent ||
                    article.querySelector('number-flow-react')?.textContent ||
                    article.querySelector('button[type="button"] span')?.textContent ||
                    article.querySelector('[data-testid="upvote-count"]')?.textContent ||
                    article.querySelector('.upvote-count')?.textContent ||
                    '0';
  
  // Parse the upvote count, defaulting to 0 if not found
  return parseInt(upvoteText.trim().replace(/[^\d]/g, ''), 10) || 0;
}

// Helper function to compare engagement (views + saves + comments)
function sortByEngagementCompare(a, b) {
  const engagementA = extractEngagement(a);
  const engagementB = extractEngagement(b);
  
  return engagementB - engagementA; // Sort in descending order
}

// Helper function to extract engagement metrics from an article
function extractEngagement(article) {
  let views = 0, saves = 0, comments = 0;
  
  // Find all SVG paths and their associated text to identify metrics
  const metricElements = article.querySelectorAll('span.flex.gap-0\\.5.items-center');
  
  metricElements.forEach(element => {
    const svgPath = element.querySelector('svg path')?.getAttribute('d');
    const countElement = element.querySelector('p');
    
    if (!svgPath || !countElement) return;
    
    const countText = countElement.textContent.trim();
    const count = parseInt(countText.replace(/[^\d]/g, ''), 10) || 0;
    
    // Identify metric type by SVG path
    // Comments typically have a path with "stroke-linecap" and "stroke-linejoin" containing a bubble-like shape
    if (svgPath.includes('M6.09881 19C4.7987') || svgPath.includes('path d="M4 17.9808V9.70753')) {
      comments = count;
    } 
    // Saves typically have a path with a bookmark-like shape
    else if (svgPath.includes('M4 17.9808V9.70753') || svgPath.includes('bookmark')) {
      saves = count;
    }
    // Views typically have an eye-like shape
    else if (svgPath.includes('M17.5 5a1.5 1.5') || svgPath.includes('eye')) {
      views = count;
    }
  });
  
  // Fallback to other selectors if the above didn't work
  if (views === 0) {
    const viewsText = article.querySelector('[title="Views"]')?.textContent || 
                     article.querySelector('[data-testid="views-count"]')?.textContent || 
                     '0';
    views = parseInt(viewsText.trim().replace(/[^\d]/g, ''), 10) || 0;
  }
  
  if (saves === 0) {
    const savesText = article.querySelector('[title="Saves"]')?.textContent || 
                     article.querySelector('[data-testid="saves-count"]')?.textContent || 
                     '0';
    saves = parseInt(savesText.trim().replace(/[^\d]/g, ''), 10) || 0;
  }
  
  if (comments === 0) {
    const commentsText = article.querySelector('[title="Comments"]')?.textContent || 
                        article.querySelector('[data-testid="comments-count"]')?.textContent || 
                        '0';
    comments = parseInt(commentsText.trim().replace(/[^\d]/g, ''), 10) || 0;
  }
  
  // Calculate total engagement
  return views + saves + comments;
}

// Helper function to compare staff picks
function sortByStaffPicksCompare(a, b) {
  const isStaffPickA = isStaffPick(a);
  const isStaffPickB = isStaffPick(b);
  
  if (isStaffPickA && !isStaffPickB) return -1; // A comes first
  if (!isStaffPickA && isStaffPickB) return 1;  // B comes first
  
  // If both are staff picks or both are not, sort by upvotes as secondary criteria
  return sortByUpvotesCompare(a, b);
}

// Helper function to check if an article is a staff pick
function isStaffPick(article) {
  // Check for staff pick badge or indicator
  // First check for specific elements
  if (article.querySelector('[title="Staff Pick"]') !== null || 
      article.querySelector('.staff-pick-badge') !== null ||
      article.querySelector('[data-testid="staff-pick"]') !== null) {
    return true;
  }
  
  // Check for text content that includes "Staff Pick" or "Staff Picked"
  if (article.textContent.includes('Staff Pick') || 
      article.textContent.includes('Staff Picked')) {
    return true;
  }
  
  // Check for specific paragraph with Peerlist icon that might indicate staff pick
  const paragraphs = article.querySelectorAll('p');
  for (const p of paragraphs) {
    // Look for paragraphs with Peerlist icon and staff pick text
    if (p.querySelector('img[alt="Peerlist"]') && 
        (p.textContent.includes('Staff') || p.textContent.includes('Pick'))) {
      return true;
    }
  }
  
  return false;
}

// Helper function to compare alphabetically
function sortAlphabeticallyCompare(a, b) {
  const nameA = getProjectName(a);
  const nameB = getProjectName(b);
  
  return nameA.localeCompare(nameB); // Sort alphabetically
}

// Helper function to get project name for search
function getProjectName(article) {
  // Try multiple selectors to find project name
  const nameElement = article.querySelector('p.font-semibold') || 
                     article.querySelector('h2') || 
                     article.querySelector('.project-title') ||
                     article.querySelector('[data-testid="project-title"]');
  
  if (nameElement) {
    return nameElement.textContent.trim();
  }
  
  // Try to find the project name in the link
  const projectLink = article.querySelector('a[href*="/project/"]');
  if (projectLink) {
    const href = projectLink.getAttribute('href');
    // Extract the project name from the URL
    const projectName = href.split('/').pop();
    if (projectName) {
      return projectName;
    }
  }
  
  // Last resort: try to find any text that might be a title
  const allParagraphs = article.querySelectorAll('p');
  for (const p of allParagraphs) {
    // Look for paragraphs that are likely to be titles (short text, prominent styling)
    if (p.textContent.trim().length > 0 && p.textContent.trim().length < 50) {
      return p.textContent.trim();
    }
  }
  
  return ''; // If all else fails, return empty string
}

// Helper function to get project description for search
function getProjectDescription(article) {
  // Try to find description paragraph (usually the second paragraph after the title)
  const paragraphs = article.querySelectorAll('p');
  if (paragraphs.length >= 2) {
    return paragraphs[1].textContent.trim();
  }
  
  return '';
}

// Helper function to get project category for search
function getProjectCategory(article) {
  // Try to find category tags
  const categoryElements = article.querySelectorAll('span.flex.gap-0\\.5.items-center p');
  for (const element of categoryElements) {
    const text = element.textContent.trim();
    if (text && !text.match(/^\d+$/) && !text.includes('Staff')) {
      return text;
    }
  }
  
  // Try to find categories in other elements
  const allParagraphs = article.querySelectorAll('p');
  for (const p of allParagraphs) {
    const text = p.textContent.trim();
    // Look for comma-separated lists that might be categories
    if (text.includes(',') && text.length < 100) {
      return text;
    }
  }
  
  return ''; // If no category is found
}

// Function to filter projects based on search term
function filterProjects(searchTerm) {
  if (!searchTerm) {
    // If search term is empty, show all projects
    resetProjectVisibility();
    return;
  }
  
  // Find all project articles
  const allArticles = document.querySelectorAll('article');
  if (allArticles.length === 0) {
    return;
  }
  
  let matchCount = 0;
  
  // Loop through each article and check if it matches the search term
  allArticles.forEach(article => {
    const projectText = article.textContent.toLowerCase();
    const projectName = getProjectName(article).toLowerCase();
    const projectDescription = getProjectDescription(article).toLowerCase();
    const projectCategory = getProjectCategory(article).toLowerCase();
    
    // Check if any of the project details match the search term
    if (projectText.includes(searchTerm) || 
        projectName.includes(searchTerm) || 
        projectDescription.includes(searchTerm) || 
        projectCategory.includes(searchTerm)) {
      // Show matching projects
      article.style.display = '';
      matchCount++;
    } else {
      // Hide non-matching projects
      article.style.display = 'none';
    }
  });

  if (matchCount === 0) {
    showNotification('No projects match your search', 'warning');
  } else {
    showNotification(`Found ${matchCount} matching projects`, 'info');
  }
}

// Function to reset project visibility
function resetProjectVisibility() {
  const allArticles = document.querySelectorAll('article');
  allArticles.forEach(article => {
    article.style.display = '';
  });
}
function showNotification(message, type = 'success') {
  const existingNotification = document.getElementById('peerlist-notification');
  if (existingNotification) {
    clearTimeout(existingNotification.dismissTimeout);
    existingNotification.remove();
  }
  
  // Notification types with icons and colors
  const notificationTypes = {
    success: { emoji: '✅', color: '#10B981', bgColor: '#ECFDF5', borderColor: '#10B984' },
    warning: { emoji: '⚠️', color: '#F59E0B', bgColor: '#FFFBEB', borderColor: '#F59E0B' },
    error: { emoji: '❌', color: '#EF4444', bgColor: '#FEE2E2', borderColor: '#EF4444' },
    info: { emoji: 'ℹ️', color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#3B82F6' },
    comment: { emoji: '💬', color: '#8B5CF6', bgColor: '#F5F3FF', borderColor: '#8B5CF6' }
  };
  
  const config = notificationTypes[type] || notificationTypes.info;
 
  const notification = document.createElement('div');
  notification.id = 'peerlist-notification';
  notification.className = `peerlist-notification ${type}`;
  
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: ${config.bgColor};
    color: ${config.color};
    border: 2px solid ${config.borderColor};
    padding: 12px 16px;
    border-radius: 12px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: flex-start;
    max-width: 280px;
    animation: peerlistSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.4;
  `;
  
 
  notification.innerHTML = `
    <div class="peerlist-notification-content">
      <div class="peerlist-notification-header">
        <span class="peerlist-notification-emoji">${config.emoji}</span>
        <span class="peerlist-notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </div>
      <div class="peerlist-notification-message">${message}</div>
    </div>
  `;
  
  
  const closeButton = document.createElement('button');
  closeButton.className = 'peerlist-notification-close';
  closeButton.innerHTML = '×';
  closeButton.title = 'Dismiss';
  closeButton.style.cssText = `
    position: absolute;
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid ${config.borderColor};
    color: ${config.color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1;
    padding: 0;
    line-height: 1;
  `;
  
  closeButton.addEventListener('click', () => {
    notification.style.animation = 'peerlistSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => notification.remove(), 300);
  });
  
  notification.appendChild(closeButton);
  document.body.appendChild(notification);
  
  // Auto-dismiss after 4 seconds
  const dismissTimeout = setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = 'peerlistSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      setTimeout(() => notification.remove(), 300);
    }
  }, 4000);

  notification.dismissTimeout = dismissTimeout;
  
  return notification;
}

 
function addCommentImportance() {
  const allArticles = document.querySelectorAll('article');
  
  allArticles.forEach(article => {
    // Skip if already processed
    if (article.dataset.commentImportanceAdded) return;
    
    const commentsCount = extractCommentsCount(article);
    if (commentsCount === 0) return;
    
    // Calculate importance score (comments per upvote)
    const upvotes = extractUpvotes(article);
    const importanceScore = upvotes > 0 ? (commentsCount / upvotes) : commentsCount;
    
    // Create importance badge
    const badge = document.createElement('div');
    badge.className = 'peerlist-comment-importance';
    
    // Determine badge level
    let badgeLevel, badgeColor, badgeText;
    if (importanceScore > 0.5) {
      badgeLevel = 'high';
      badgeColor = '#EF4444';  
      badgeText = 'Hot Discussion';
    } else if (importanceScore > 0.2) {
      badgeLevel = 'medium';
      badgeColor = '#F59E0B'; 
      badgeText = 'Active Discussion';
    } else {
      badgeLevel = 'low';
      badgeColor = '#10B981'; 
      badgeText = 'Some Discussion';
    }
    
    badge.innerHTML = `
      <span class="peerlist-comment-emoji">💬</span>
      <span class="peerlist-comment-text">${badgeText}</span>
    `;
    
    badge.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: white;
      color: ${badgeColor};
      border: 1px solid ${badgeColor};
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    
    // Add hover effect
    badge.addEventListener('mouseenter', () => {
      showNotification(
        `This project has ${commentsCount} comments and ${upvotes} upvotes (${Math.round(importanceScore * 100)}% comment-to-upvote ratio)`,
        'comment'
      );
    });
    
    badge.addEventListener('mouseleave', () => {
      const notification = document.getElementById('peerlist-notification');
      if (notification && notification.classList.contains('comment')) {
        clearTimeout(notification.dismissTimeout);
        notification.style.animation = 'peerlistSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        setTimeout(() => notification.remove(), 300);
      }
    });
    
    article.style.position = 'relative';
    article.appendChild(badge);
    article.dataset.commentImportanceAdded = 'true';
  });
}

function extractCommentsCount(article) {
  const commentsText = article.querySelector('[title="Comments"]')?.textContent || 
                      article.querySelector('[data-testid="comments-count"]')?.textContent || 
                      '0';
  
  return parseInt(commentsText.trim().replace(/[^\d]/g, ''), 10) || 0;
}

function initialize() {
  createSortButton();
  setTimeout(addCommentImportance, 1500);
}

// Handle page load and navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    //Small delay : )
    setTimeout(initialize, 1000);
  }
}).observe(document, {subtree: true, childList: true});