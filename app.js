// תיק אתר IT - לוגיקת האפליקציה (עיצוב בהיר ונקי + אפקט בחירה אינטראקטיבי ונעים)

const STORAGE_KEY = 'IT_SITE_MANAGER_DATA_V4';

// App State
let state = {
  sites: [],
  selectedTechnician: 'all',
  selectedRegion: 'all',
  selectedStatus: 'all',
  searchQuery: '',
  viewMode: 'grid', // 'grid' | 'table'
  currentViewingSiteId: null,
  activeDossierTab: 'general', // 'general' | 'contacts' | 'it' | 'qr'
  isEditing: false,
  technicians: { ...TECHNICIANS_META }
};

// Initialize App
function initApp() {
  loadData();
  renderTechniciansSidebar();
  renderStats();
  renderSites();
  setupEventListeners();
  initLucideIcons();
}

// Load data from LocalStorage or INITIAL_SITES
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.sites = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved sites, using defaults', e);
      state.sites = [...INITIAL_SITES];
    }
  } else {
    state.sites = [...INITIAL_SITES];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sites));
  renderStats();
  renderTechniciansSidebar();
}

function resetToDefault() {
  if (confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים למאגר המקורי?')) {
    state.sites = JSON.parse(JSON.stringify(INITIAL_SITES));
    saveData();
    renderSites();
    showToast('הנתונים אופסו בהצלחה למאגר המקורי', 'info');
    triggerConfetti();
  }
}

// Event Listeners setup
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      renderSites();
    });
  }

  const regionFilter = document.getElementById('region-filter');
  if (regionFilter) {
    regionFilter.addEventListener('change', (e) => {
      state.selectedRegion = e.target.value;
      renderSites();
    });
  }

  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      state.selectedStatus = e.target.value;
      renderSites();
    });
  }

  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewTableBtn = document.getElementById('view-table-btn');
  if (viewGridBtn && viewTableBtn) {
    viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    viewTableBtn.addEventListener('click', () => setViewMode('table'));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDossierModal();
      closeEditModal();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }
  });
}

function setViewMode(mode) {
  state.viewMode = mode;
  const gridBtn = document.getElementById('view-grid-btn');
  const tableBtn = document.getElementById('view-table-btn');
  
  if (mode === 'grid') {
    gridBtn.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm transition';
    tableBtn.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition';
  } else {
    tableBtn.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm transition';
    gridBtn.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition';
  }
  renderSites();
}

function filterByRegionQuick(regionName) {
  state.selectedRegion = regionName;
  const select = document.getElementById('region-filter');
  if (select) select.value = regionName;
  renderSites();
  showToast(`מסנן לפי מרחב: ${regionName}`, 'info');
}

// Select Technician with clean tactile feedback & animated transitions
function selectTechnician(techName) {
  if (state.selectedTechnician === techName) return;
  state.selectedTechnician = techName;

  // Pulse effect on active title container
  const iconContainer = document.getElementById('active-tech-icon');
  if (iconContainer) {
    iconContainer.classList.add('animate-pulse-once');
    setTimeout(() => iconContainer.classList.remove('animate-pulse-once'), 400);
  }

  renderTechniciansSidebar();
  renderSites();
  renderStats();

  // Scroll to sites list on mobile
  if (window.innerWidth < 768) {
    document.getElementById('sites-container')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// Render Technicians in Sidebar
function renderTechniciansSidebar() {
  const container = document.getElementById('technicians-list');
  if (!container) return;

  const totalSitesCount = state.sites.length;
  const techNames = ['אלן', 'ברוך', 'חזי'];

  state.sites.forEach(s => {
    if (s.technician && !techNames.includes(s.technician)) {
      techNames.push(s.technician);
    }
  });

  const isAllSelected = state.selectedTechnician === 'all';

  let html = `
    <button onclick="selectTechnician('all')" 
      class="w-full text-right p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between group relative active:scale-[0.98] ${
        isAllSelected 
          ? 'tech-card-active ring-2 ring-blue-500/20' 
          : 'white-card hover:bg-slate-50 text-slate-700'
      }">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl ${
          isAllSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-white'
        } flex items-center justify-center transition-colors">
          <i data-lucide="layers" class="w-5 h-5"></i>
        </div>
        <div>
          <div class="font-extrabold text-sm sm:text-base flex items-center gap-2 text-slate-900">
            כלל האתרים
            ${isAllSelected ? `<span class="w-2 h-2 rounded-full bg-blue-600"></span>` : ''}
          </div>
          <div class="text-xs text-slate-500 font-normal">ארצי - כל המרחבים והטכנאים</div>
        </div>
      </div>
      <span class="px-3 py-1 text-xs rounded-full font-mono font-bold ${
        isAllSelected ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700'
      }">${totalSitesCount}</span>
    </button>
  `;

  techNames.forEach(name => {
    const techMeta = state.technicians[name] || {
      name,
      role: 'טכנאי שטח',
      phone: '',
      email: '',
      avatarBg: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    const techSites = state.sites.filter(s => s.technician === name);
    const count = techSites.length;
    const isSelected = state.selectedTechnician === name;
    const regions = [...new Set(techSites.map(s => s.region))].join(', ');

    html += `
      <button onclick="selectTechnician('${name}')" 
        class="w-full text-right p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between group relative active:scale-[0.98] ${
          isSelected 
            ? 'tech-card-active ring-2 ring-blue-500/20' 
            : 'white-card hover:bg-slate-50 text-slate-700'
        }">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${techMeta.avatarBg} text-white flex items-center justify-center font-black text-lg shadow-md transition-transform ${
              isSelected ? 'scale-105' : 'group-hover:scale-105'
            }">
              ${name.charAt(0)}
            </div>
            ${isSelected ? `
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] shadow">
                <i data-lucide="check" class="w-2.5 h-2.5"></i>
              </span>
            ` : ''}
          </div>
          <div>
            <div class="font-extrabold text-sm sm:text-base flex items-center gap-2 text-slate-900">
              ${name}
              ${isSelected ? `
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                  פעיל
                </span>
              ` : ''}
              ${techMeta.phone ? `
                <a href="tel:${techMeta.phone}" onclick="event.stopPropagation()" title="התקשר ל${name}" class="text-slate-400 hover:text-emerald-600 p-1 transition">
                  <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                </a>
              ` : ''}
            </div>
            <div class="text-xs text-slate-500 font-medium truncate max-w-[140px]">${techMeta.role}</div>
            <div class="text-[11px] text-blue-600 font-medium truncate max-w-[140px] mt-0.5">${regions || 'ללא אזור'}</div>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1.5">
          <span class="px-3 py-1 text-xs rounded-full font-mono font-bold ${
            isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200'
          }">${count} אתרים</span>
          <span class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> זמין
          </span>
        </div>
      </button>
    `;
  });

  container.innerHTML = html;
  initLucideIcons();
}

// Smooth animated count up helper
function animateCountUp(elementId, targetNumber) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const current = parseInt(el.textContent, 10) || 0;
  if (current === targetNumber) return;

  const duration = 250;
  const start = performance.now();

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(current + (targetNumber - current) * progress);
    el.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetNumber;
    }
  }
  requestAnimationFrame(update);
}

// Render Stats Header & Badges
function renderStats() {
  const filtered = getFilteredSites();
  const total = state.sites.length;
  const activeTech = state.selectedTechnician;

  const currentCount = filtered.length;
  const centralCount = state.sites.filter(s => s.region.includes('מרכז')).length;
  const southCount = state.sites.filter(s => s.region.includes('דרום')).length;
  const jerusalemCount = state.sites.filter(s => s.region.includes('ירושלים')).length;

  animateCountUp('stat-total-sites', total);
  animateCountUp('stat-filtered-sites', currentCount);
  animateCountUp('stat-center-sites', centralCount);
  animateCountUp('stat-south-sites', southCount);
  animateCountUp('stat-jerusalem-sites', jerusalemCount);

  const activeTitle = document.getElementById('active-view-title');
  const activeSubtitle = document.getElementById('active-view-subtitle');
  const countBadge = document.getElementById('active-count-badge');
  
  if (countBadge) {
    countBadge.textContent = `${currentCount} אתרים`;
  }

  if (activeTitle && activeSubtitle) {
    if (activeTech === 'all') {
      activeTitle.textContent = 'כלל האתרים והמתחמים';
      activeSubtitle.textContent = `מציג סה"כ ${currentCount} אתרים פעילים בכל רחבי הארץ`;
    } else {
      const meta = state.technicians[activeTech];
      activeTitle.textContent = `האתרים של ${activeTech}`;
      activeSubtitle.textContent = `${meta ? meta.role : 'טכנאי שטח'} • סה"כ ${currentCount} אתרים באחריותו`;
    }
  }
}

function getFilteredSites() {
  return state.sites.filter(site => {
    if (state.selectedTechnician !== 'all' && site.technician !== state.selectedTechnician) {
      return false;
    }
    if (state.selectedRegion !== 'all') {
      if (state.selectedRegion === 'מרכז \\ דרום') {
        if (!site.region.includes('מרכז') && !site.region.includes('דרום')) return false;
      } else if (!site.region.includes(state.selectedRegion)) {
        return false;
      }
    }
    if (state.selectedStatus !== 'all' && site.status !== state.selectedStatus) {
      return false;
    }
    if (state.searchQuery) {
      const q = state.searchQuery;
      const contactsText = (site.contacts || []).map(c => `${c.name} ${c.role} ${c.phone} ${c.email}`).join(' ');
      const itText = site.itSpecs ? `${site.itSpecs.provider} ${site.itSpecs.ipAddress} ${site.itSpecs.routerModel} ${site.itSpecs.techNotes}` : '';
      const searchable = `${site.name} ${site.city} ${site.region} ${site.notes} ${site.technician} ${site.address} ${contactsText} ${itText}`.toLowerCase();
      
      if (!searchable.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

// Render Sites View
function renderSites() {
  const container = document.getElementById('sites-container');
  if (!container) return;

  const filteredSites = getFilteredSites();

  if (filteredSites.length === 0) {
    container.innerHTML = `
      <div class="white-card rounded-3xl p-12 text-center shadow-sm">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">לא נמצאו אתרים תואמים לחיפוש</h3>
        <p class="text-sm text-slate-500 mb-6 max-w-md mx-auto">נסה לחפש לפי מונח אחר או אפס את הסינונים כדי לצפות בכלל האתרים.</p>
        <button onclick="resetFilters()" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition">
          <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
          איפוס כל הסינונים
        </button>
      </div>
    `;
    initLucideIcons();
    return;
  }

  if (state.viewMode === 'grid') {
    renderGridView(container, filteredSites);
  } else {
    renderTableView(container, filteredSites);
  }

  initLucideIcons();
}

function getRegionBadge(region) {
  if (region.includes('ירושלים')) {
    return `<span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ירושלים
    </span>`;
  }
  if (region.includes('מרכז') && region.includes('דרום')) {
    return `<span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span> מרכז \\ דרום
    </span>`;
  }
  if (region.includes('דרום')) {
    return `<span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> דרום
    </span>`;
  }
  return `<span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> מרכז
  </span>`;
}

function getHighlightClasses(highlight, notes) {
  if (highlight === 'red' || notes.includes('אנרגיה') || notes.includes('בטיפול')) {
    return {
      border: 'border-r-4 border-r-rose-500 hover:border-r-rose-600',
      tagBadge: notes ? `<span class="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">${notes}</span>` : ''
    };
  }
  if (highlight === 'yellow' || notes.includes('לבדוק') || notes.includes('עתידי') || notes.includes('בהקמה')) {
    return {
      border: 'border-r-4 border-r-amber-400 hover:border-r-amber-500',
      tagBadge: notes ? `<span class="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">${notes}</span>` : ''
    };
  }
  if (highlight === 'grey' || notes.includes('אתר גדול')) {
    return {
      border: 'border-r-4 border-r-indigo-500 hover:border-r-indigo-600',
      tagBadge: notes ? `<span class="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">${notes}</span>` : ''
    };
  }
  return {
    border: 'border-r-4 border-r-slate-300 hover:border-r-blue-500',
    tagBadge: notes ? `<span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${notes}</span>` : ''
  };
}

// Render Grid Cards with smooth entrance
function renderGridView(container, sites) {
  let html = `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">`;

  sites.forEach((site, index) => {
    const primaryContact = (site.contacts && site.contacts.length > 0) ? site.contacts[0] : null;
    const highlightInfo = getHighlightClasses(site.highlight, site.notes);
    const techMeta = state.technicians[site.technician] || { badgeBg: 'bg-slate-100 text-slate-800 border-slate-200' };

    html += `
      <div onclick="openDossierModal('${site.id}')" 
        class="white-card rounded-3xl p-5 cursor-pointer flex flex-col justify-between group relative overflow-hidden animate-slide-up ${highlightInfo.border}" 
        style="animation-delay: ${Math.min(index * 25, 300)}ms">
        
        <div>
          <!-- Top Row -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <h4 class="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors tracking-tight">
                ${site.name}
              </h4>
              <div class="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mt-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-500"></i>
                <span class="text-slate-700">${site.city}</span>
                ${site.address ? `<span class="text-slate-300">•</span><span class="truncate max-w-[140px] text-slate-500">${site.address}</span>` : ''}
              </div>
            </div>
            
            <div class="shrink-0">
              ${getRegionBadge(site.region)}
            </div>
          </div>

          <!-- Notes & Tech Badges -->
          <div class="flex items-center gap-2 flex-wrap mb-4">
            <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${techMeta.badgeBg}">
              טכנאי: ${site.technician}
            </span>
            ${highlightInfo.tagBadge}
            ${site.status && site.status !== 'פעיל' ? `
              <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                ${site.status}
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Contact & Quick Actions Footer -->
        <div class="pt-3.5 border-t border-slate-100 mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2.5 overflow-hidden">
            ${primaryContact ? `
              <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                <i data-lucide="user" class="w-4 h-4 text-slate-600"></i>
              </div>
              <div class="truncate">
                <div class="text-xs font-bold text-slate-800 truncate">${primaryContact.name}</div>
                <div class="text-[11px] text-slate-500 font-mono">${primaryContact.phone || 'אין טלפון'}</div>
              </div>
            ` : `
              <div class="text-xs text-slate-400 flex items-center gap-1.5">
                <i data-lucide="info" class="w-3.5 h-3.5"></i>
                <span>לא הוזן איש קשר</span>
              </div>
            `}
          </div>

          <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
            ${primaryContact && primaryContact.phone ? `
              <a href="tel:${primaryContact.phone}" title="התקשר לאיש קשר" class="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition hover:scale-105">
                <i data-lucide="phone" class="w-4 h-4"></i>
              </a>
            ` : ''}
            <a href="https://waze.com/ul?q=${encodeURIComponent(site.name + ' ' + site.city)}" target="_blank" title="נווט ב-Waze" class="w-9 h-9 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center transition hover:scale-105">
              <i data-lucide="navigation" class="w-4 h-4"></i>
            </a>
            <button onclick="openDossierModal('${site.id}')" title="פתח תיק אתר מלא" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition hover:scale-105">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Render Table View
function renderTableView(container, sites) {
  let html = `
    <div class="white-card rounded-3xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-right border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th class="py-4 px-4">שם האתר</th>
              <th class="py-4 px-4">ישוב / מיקום</th>
              <th class="py-4 px-4">מרחב</th>
              <th class="py-4 px-4">סיווג / הערה</th>
              <th class="py-4 px-4">טכנאי שטח</th>
              <th class="py-4 px-4">איש קשר</th>
              <th class="py-4 px-4">טלפון</th>
              <th class="py-4 px-4 text-center">פעולות מהירות</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
  `;

  sites.forEach(site => {
    const primaryContact = (site.contacts && site.contacts.length > 0) ? site.contacts[0] : null;
    const highlightInfo = getHighlightClasses(site.highlight, site.notes);

    html += `
      <tr class="hover:bg-blue-50/50 transition-colors cursor-pointer group" onclick="openDossierModal('${site.id}')">
        <td class="py-3.5 px-4 font-bold text-slate-900 group-hover:text-blue-600">
          ${site.name}
        </td>
        <td class="py-3.5 px-4 text-slate-700 font-medium">${site.city}</td>
        <td class="py-3.5 px-4">${getRegionBadge(site.region)}</td>
        <td class="py-3.5 px-4">
          ${site.notes ? highlightInfo.tagBadge : '<span class="text-slate-300">-</span>'}
        </td>
        <td class="py-3.5 px-4">
          <span class="font-bold text-blue-700">${site.technician}</span>
        </td>
        <td class="py-3.5 px-4 text-slate-700">
          ${primaryContact ? `${primaryContact.name} <span class="text-xs text-slate-400">(${primaryContact.role || 'כללי'})</span>` : '<span class="text-slate-400 text-xs">-</span>'}
        </td>
        <td class="py-3.5 px-4 font-mono text-xs text-slate-600" dir="ltr">
          ${primaryContact && primaryContact.phone ? `
            <a href="tel:${primaryContact.phone}" onclick="event.stopPropagation()" class="text-emerald-600 hover:underline font-bold">
              ${primaryContact.phone}
            </a>
          ` : '<span class="text-slate-300">-</span>'}
        </td>
        <td class="py-3.5 px-4 text-center" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center gap-1.5">
            <a href="https://waze.com/ul?q=${encodeURIComponent(site.name + ' ' + site.city)}" target="_blank" title="נווט ב-Waze" class="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition">
              <i data-lucide="navigation" class="w-4 h-4"></i>
            </a>
            <button onclick="openEditModal('${site.id}')" title="ערוך אתר" class="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="openDossierModal('${site.id}')" title="תיק אתר מלא" class="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function resetFilters() {
  state.selectedTechnician = 'all';
  state.selectedRegion = 'all';
  state.selectedStatus = 'all';
  state.searchQuery = '';
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  const regionFilter = document.getElementById('region-filter');
  if (regionFilter) regionFilter.value = 'all';

  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) statusFilter.value = 'all';

  renderTechniciansSidebar();
  renderStats();
  renderSites();
  showToast('הסינונים אופסו בהצלחה', 'info');
}

// ==========================================
// Site Dossier Modal
// ==========================================
function openDossierModal(siteId) {
  const site = state.sites.find(s => s.id === siteId);
  if (!site) return;

  state.currentViewingSiteId = siteId;
  state.activeDossierTab = 'general';
  const modal = document.getElementById('dossier-modal');
  const content = document.getElementById('dossier-modal-content');
  if (!modal || !content) return;

  renderDossierContent(site, content);

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  initLucideIcons();
}

function setDossierTab(tabName) {
  state.activeDossierTab = tabName;
  const site = state.sites.find(s => s.id === state.currentViewingSiteId);
  const content = document.getElementById('dossier-modal-content');
  if (site && content) {
    renderDossierContent(site, content);
  }
}

function renderDossierContent(site, content) {
  const techMeta = state.technicians[site.technician] || {
    phone: '',
    role: 'טכנאי שטח'
  };
  const specs = site.itSpecs || {};
  const currentTab = state.activeDossierTab;

  let headerGrad = 'from-blue-700 via-indigo-800 to-slate-900';
  if (site.region.includes('ירושלים')) headerGrad = 'from-amber-600 via-orange-700 to-slate-900';
  if (site.region.includes('דרום')) headerGrad = 'from-emerald-600 via-teal-700 to-slate-900';

  const contactsListHtml = (site.contacts && site.contacts.length > 0) ? site.contacts.map((c) => `
    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-lg">
          ${c.name ? c.name.charAt(0) : 'איש'}
        </div>
        <div>
          <div class="font-black text-slate-900 text-base">${c.name || 'איש קשר'}</div>
          <div class="text-xs text-slate-500 font-medium">${c.role || 'מנהל אתר'}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        ${c.phone ? `
          <a href="tel:${c.phone}" class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition hover:scale-105 font-mono">
            <i data-lucide="phone" class="w-3.5 h-3.5"></i>
            <span>${c.phone}</span>
          </a>
          <button onclick="copyToClipboard('${c.phone}', 'מספר טלפון הועתק')" class="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition" title="העתק טלפון">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
        ` : '<span class="text-xs text-slate-400">אין טלפון</span>'}
        ${c.email ? `
          <a href="mailto:${c.email}" class="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition" title="${c.email}">
            <i data-lucide="mail" class="w-4 h-4"></i>
          </a>
        ` : ''}
      </div>
    </div>
  `).join('') : `
    <div class="text-slate-400 text-sm p-6 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
      טרם הוזנו אנשי קשר עבור אתר זה.
    </div>
  `;

  content.innerHTML = `
    <!-- Header Hero Banner -->
    <div class="bg-gradient-to-l ${headerGrad} text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
      
      <button onclick="closeDossierModal()" class="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20 z-10">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>

      <div class="flex flex-wrap items-center gap-2 mb-3">
        ${getRegionBadge(site.region)}
        <span class="px-3 py-1 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30">
          טכנאי אחראי: ${site.technician}
        </span>
        ${site.notes ? `
          <span class="px-3 py-1 rounded-xl text-xs font-bold bg-amber-400 text-amber-950">
            ${site.notes}
          </span>
        ` : ''}
      </div>

      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${site.name}</h2>
      
      <div class="flex flex-wrap items-center gap-4 text-white/90 text-sm mt-2 font-medium">
        <div class="flex items-center gap-1.5">
          <i data-lucide="map-pin" class="w-4 h-4 text-blue-200"></i>
          <span class="text-white font-bold">${site.city}</span>
          ${site.address ? `<span class="text-white/70">• ${site.address}</span>` : ''}
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 mt-6 pt-5 border-t border-white/20">
        <a href="https://waze.com/ul?q=${encodeURIComponent(site.name + ' ' + site.city)}" target="_blank" 
           class="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition hover:scale-105">
          <i data-lucide="navigation" class="w-4 h-4"></i>
          נווט ב-Waze
        </a>
        <a href="https://maps.google.com/?q=${encodeURIComponent(site.name + ' ' + site.city)}" target="_blank" 
           class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition">
          <i data-lucide="map" class="w-4 h-4"></i>
          Google Maps
        </a>
        <button onclick="openEditModal('${site.id}')" 
           class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition">
          <i data-lucide="edit-3" class="w-4 h-4"></i>
          ערוך תיק אתר
        </button>
        <button onclick="window.print()" 
           class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-medium border border-white/20 transition">
          <i data-lucide="printer" class="w-4 h-4"></i>
          הדפסה
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-slate-100 border-b border-slate-200 px-6 sm:px-8 flex items-center gap-2 overflow-x-auto">
      <button onclick="setDossierTab('general')" class="py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${currentTab === 'general' ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl' : 'border-transparent text-slate-600 hover:text-slate-900'}">
        <i data-lucide="info" class="w-4 h-4"></i>
        פרטי אתר ומיקום
      </button>
      <button onclick="setDossierTab('contacts')" class="py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${currentTab === 'contacts' ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl' : 'border-transparent text-slate-600 hover:text-slate-900'}">
        <i data-lucide="users" class="w-4 h-4"></i>
        אנשי קשר וטלפונים (${site.contacts ? site.contacts.length : 0})
      </button>
      <button onclick="setDossierTab('it')" class="py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${currentTab === 'it' ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl' : 'border-transparent text-slate-600 hover:text-slate-900'}">
        <i data-lucide="server" class="w-4 h-4"></i>
        תשתיות רשת ומחשוב (IT)
      </button>
      <button onclick="setDossierTab('qr')" class="py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${currentTab === 'qr' ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl' : 'border-transparent text-slate-600 hover:text-slate-900'}">
        <i data-lucide="qr-code" class="w-4 h-4"></i>
        סריקת QR לסלולרי
      </button>
    </div>

    <!-- Tab Content -->
    <div class="p-6 sm:p-8 max-h-[calc(85vh-250px)] overflow-y-auto space-y-6 bg-white">
      ${getTabContentHtml(currentTab, site, specs, techMeta, contactsListHtml)}
    </div>
  `;

  if (currentTab === 'qr') {
    setTimeout(() => {
      const qrContainer = document.getElementById('site-qr-code');
      if (qrContainer) {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
          text: `https://waze.com/ul?q=${encodeURIComponent(site.name + ' ' + site.city)}`,
          width: 180,
          height: 180,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }, 50);
  }

  initLucideIcons();
}

function getTabContentHtml(tab, site, specs, techMeta, contactsListHtml) {
  if (tab === 'contacts') {
    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <i data-lucide="phone-call" class="w-5 h-5 text-emerald-600"></i>
            אנשי קשר זמינים באתר
          </h3>
          <button onclick="openEditModal('${site.id}')" class="text-xs text-blue-600 hover:underline font-bold">
            + הוסף / ערוך איש קשר
          </button>
        </div>
        <div class="space-y-3">
          ${contactsListHtml}
        </div>
      </div>
    `;
  }

  if (tab === 'it') {
    return `
      <div class="space-y-6">
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 class="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <i data-lucide="cpu" class="w-5 h-5 text-indigo-600"></i>
              מפרט תשתיות תקשורת ומחשוב (IT Specs)
            </h3>
            <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> פעיל ברשת
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
            
            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span class="text-slate-500 text-xs font-bold">ספק ותשתית:</span>
              <span class="font-bold text-slate-900">${specs.provider || 'לא הוגדר'}</span>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span class="text-slate-500 text-xs font-bold">כתובת IP / Gateway:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">${specs.ipAddress || '192.168.1.1'}</span>
                <button onclick="copyToClipboard('${specs.ipAddress || '192.168.1.1'}', 'כתובת IP הועתקה')" class="text-slate-400 hover:text-slate-700" title="העתק IP">
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span class="text-slate-500 text-xs font-bold">דגם ראוטר / פיירוול:</span>
              <span class="font-bold text-slate-900">${specs.routerModel || 'FortiGate / MikroTik'}</span>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span class="text-slate-500 text-xs font-bold">מתגים (Switches):</span>
              <span class="font-bold text-slate-900">${specs.switches || 'Cisco PoE 24P'}</span>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span class="text-slate-500 text-xs font-bold">נקודות WiFi:</span>
              <span class="font-bold text-slate-900">${specs.wifiAp || 'UniFi AP'}</span>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span class="text-slate-500 text-xs font-bold">מדפסת אתר:</span>
              <span class="font-bold text-slate-900">${specs.printerModel || 'מדפסת משולבת'}</span>
            </div>

          </div>

          <div class="pt-3 border-t border-slate-200">
            <h4 class="text-xs font-bold text-amber-800 mb-2 flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              הנחיות לארון התקשורת ודגשים טכניים:
            </h4>
            <p class="text-xs text-slate-800 bg-amber-50 border border-amber-200 rounded-xl p-3.5 leading-relaxed">
              ${specs.techNotes || site.notes || 'אין הערות טכניות מיוחדות.'}
            </p>
          </div>

        </div>
      </div>
    `;
  }

  if (tab === 'qr') {
    return `
      <div class="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center max-w-md mx-auto space-y-4">
        <h3 class="font-extrabold text-slate-900 text-base flex items-center justify-center gap-2">
          <i data-lucide="smartphone" class="w-5 h-5 text-sky-600"></i>
          סריקה מהירה לסמארטפון של הטכנאי
        </h3>
        <p class="text-xs text-slate-600">
          סרוק עם מצלמת הנייד כדי לפתוח ישירות ניווט ב-Waze אל <strong>${site.name}</strong>
        </p>

        <div class="bg-white p-4 rounded-2xl inline-block shadow-md mx-auto border-2 border-slate-200" id="site-qr-code">
          <!-- QR Code injected here -->
        </div>

        <div class="text-xs text-slate-500 font-mono">
          מיקום: ${site.city} (${site.name})
        </div>
      </div>
    `;
  }

  // General Tab
  return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <div class="lg:col-span-7 space-y-4">
        
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <h3 class="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
            <i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>
            פרטי מיקום והגעה לשטח
          </h3>

          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <span class="text-slate-500 text-xs font-bold">עיר / ישוב:</span>
              <span class="font-bold text-slate-900">${site.city}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <span class="text-slate-500 text-xs font-bold">כתובת:</span>
              <span class="font-bold text-slate-900">${site.address || site.city}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <span class="text-slate-500 text-xs font-bold">מרחב גיאוגרפי:</span>
              <span>${getRegionBadge(site.region)}</span>
            </div>
          </div>
        </div>

        <!-- Assigned Technician -->
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <h4 class="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider flex items-center gap-1.5">
            <i data-lucide="user-check" class="w-4 h-4 text-blue-600"></i>
            טכנאי שטח אחראי לאתר
          </h4>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                ${site.technician.charAt(0)}
              </div>
              <div>
                <div class="font-black text-slate-900 text-base">${site.technician}</div>
                <div class="text-xs text-slate-500">${techMeta.role}</div>
              </div>
            </div>
            ${techMeta.phone ? `
              <a href="tel:${techMeta.phone}" class="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition font-mono">
                <i data-lucide="phone-call" class="w-3.5 h-3.5"></i>
                <span>${techMeta.phone}</span>
              </a>
            ` : ''}
          </div>
        </div>

      </div>

      <div class="lg:col-span-5 space-y-4">
        
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-emerald-600"></i>
              איש קשר באתר
            </h4>
            <button onclick="setDossierTab('contacts')" class="text-xs text-blue-600 hover:underline font-bold">
              הצג הכל
            </button>
          </div>

          ${(site.contacts && site.contacts.length > 0) ? `
            <div class="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
              <div class="font-bold text-slate-900 text-sm">${site.contacts[0].name}</div>
              <div class="text-xs text-slate-500">${site.contacts[0].role || 'איש קשר'}</div>
              ${site.contacts[0].phone ? `
                <div class="pt-2">
                  <a href="tel:${site.contacts[0].phone}" class="text-emerald-700 font-mono text-xs font-bold hover:underline flex items-center gap-1.5">
                    <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                    ${site.contacts[0].phone}
                  </a>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="text-xs text-slate-400 p-3 bg-white rounded-xl text-center border border-slate-200">לא הוזן איש קשר</div>
          `}
        </div>

        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-indigo-600"></i>
              סטטוס קו ותקשורת
            </h4>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Online
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">כתובת IP:</span>
              <span class="font-mono text-blue-700 font-bold">${specs.ipAddress || '192.168.1.1'}</span>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">ספק:</span>
              <span class="font-bold">${specs.provider || 'בזק סיבים'}</span>
            </div>
            <div class="flex justify-between text-slate-700">
              <span class="text-slate-500">ראוטר:</span>
              <span class="font-bold">${specs.routerModel || 'FortiGate'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

function closeDossierModal() {
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// ==========================================
// Edit / Add Site Modal
// ==========================================
function openAddSiteModal() {
  openEditModal(null);
}

function openEditModal(siteId) {
  closeDossierModal();
  const modal = document.getElementById('edit-modal');
  const modalTitle = document.getElementById('edit-modal-title');
  if (!modal) return;

  const isNew = !siteId;
  state.isEditing = !isNew;
  state.currentViewingSiteId = siteId;

  let site = isNew ? {
    id: 'site-' + Date.now(),
    name: '',
    city: '',
    region: 'מרכז',
    notes: '',
    technician: state.selectedTechnician !== 'all' ? state.selectedTechnician : 'אלן',
    address: '',
    status: 'פעיל',
    highlight: '',
    contacts: [{ name: '', role: 'מנהל אתר', phone: '', email: '' }],
    itSpecs: {
      provider: '',
      ipAddress: '',
      routerModel: '',
      switches: '',
      wifiAp: '',
      printerModel: '',
      techNotes: ''
    }
  } : state.sites.find(s => s.id === siteId);

  if (!site) return;

  modalTitle.textContent = isNew ? 'הוספת אתר חדש למערכת' : `עריכת אתר: ${site.name}`;

  document.getElementById('edit-site-id').value = site.id;
  document.getElementById('edit-site-name').value = site.name || '';
  document.getElementById('edit-site-city').value = site.city || '';
  document.getElementById('edit-site-region').value = site.region || 'מרכז';
  document.getElementById('edit-site-notes').value = site.notes || '';
  document.getElementById('edit-site-technician').value = site.technician || 'אלן';
  document.getElementById('edit-site-address').value = site.address || '';
  document.getElementById('edit-site-status').value = site.status || 'פעיל';

  const c1 = (site.contacts && site.contacts[0]) || { name: '', role: '', phone: '', email: '' };
  document.getElementById('edit-contact-name').value = c1.name || '';
  document.getElementById('edit-contact-role').value = c1.role || '';
  document.getElementById('edit-contact-phone').value = c1.phone || '';
  document.getElementById('edit-contact-email').value = c1.email || '';

  const specs = site.itSpecs || {};
  document.getElementById('edit-spec-provider').value = specs.provider || '';
  document.getElementById('edit-spec-ip').value = specs.ipAddress || '';
  document.getElementById('edit-spec-router').value = specs.routerModel || '';
  document.getElementById('edit-spec-switches').value = specs.switches || '';
  document.getElementById('edit-spec-wifi').value = specs.wifiAp || '';
  document.getElementById('edit-spec-printer').value = specs.printerModel || '';
  document.getElementById('edit-spec-notes').value = specs.techNotes || '';

  const deleteBtn = document.getElementById('edit-delete-btn');
  if (deleteBtn) {
    deleteBtn.style.display = isNew ? 'none' : 'inline-flex';
  }

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  initLucideIcons();
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function handleSaveSite(e) {
  e.preventDefault();
  const siteId = document.getElementById('edit-site-id').value;
  const name = document.getElementById('edit-site-name').value.trim();
  const city = document.getElementById('edit-site-city').value.trim();

  if (!name || !city) {
    showToast('נא להזין שם אתר ועיר', 'error');
    return;
  }

  const region = document.getElementById('edit-site-region').value;
  const notes = document.getElementById('edit-site-notes').value.trim();
  const technician = document.getElementById('edit-site-technician').value;
  const address = document.getElementById('edit-site-address').value.trim();
  const status = document.getElementById('edit-site-status').value;

  const contactName = document.getElementById('edit-contact-name').value.trim();
  const contactRole = document.getElementById('edit-contact-role').value.trim();
  const contactPhone = document.getElementById('edit-contact-phone').value.trim();
  const contactEmail = document.getElementById('edit-contact-email').value.trim();

  const provider = document.getElementById('edit-spec-provider').value.trim();
  const ipAddress = document.getElementById('edit-spec-ip').value.trim();
  const routerModel = document.getElementById('edit-spec-router').value.trim();
  const switches = document.getElementById('edit-spec-switches').value.trim();
  const wifiAp = document.getElementById('edit-spec-wifi').value.trim();
  const printerModel = document.getElementById('edit-spec-printer').value.trim();
  const techNotes = document.getElementById('edit-spec-notes').value.trim();

  const siteData = {
    id: siteId,
    name,
    city,
    region,
    notes,
    technician,
    address,
    status,
    highlight: notes.includes('אנרגיה') ? 'red' : (notes.includes('עתידי') || notes.includes('לבדוק') ? 'yellow' : ''),
    contacts: contactName || contactPhone ? [{
      name: contactName || 'איש קשר',
      role: contactRole,
      phone: contactPhone,
      email: contactEmail
    }] : [],
    itSpecs: {
      provider,
      ipAddress,
      routerModel,
      switches,
      wifiAp,
      printerModel,
      techNotes
    }
  };

  const existingIndex = state.sites.findIndex(s => s.id === siteId);
  if (existingIndex >= 0) {
    state.sites[existingIndex] = siteData;
    showToast(`האתר "${name}" עודכן בהצלחה!`, 'success');
  } else {
    state.sites.unshift(siteData);
    showToast(`האתר "${name}" נוסף בהצלחה!`, 'success');
  }

  saveData();
  closeEditModal();
  renderSites();
  triggerConfetti();
}

function handleDeleteSite() {
  const siteId = document.getElementById('edit-site-id').value;
  const site = state.sites.find(s => s.id === siteId);
  if (!site) return;

  if (confirm(`האם אתה בטוח שברצונך למחוק את האתר "${site.name}"?`)) {
    state.sites = state.sites.filter(s => s.id !== siteId);
    saveData();
    closeEditModal();
    renderSites();
    showToast(`האתר "${site.name}" נמחק`, 'info');
  }
}

function copyToClipboard(text, message) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(message || 'הועתק ללוח', 'success');
  }).catch(() => {
    showToast('שגיאה בהעתקה', 'error');
  });
}

function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  }
}

function exportToExcelCSV() {
  let csvContent = "\uFEFF";
  csvContent += "שם האתר,ישוב / עיר,מרחב,הערות,טכנאי שטח,כתובת,איש קשר,תפקיד,טלפון,אימייל,ספק אינטרנט,כתובת IP,ציוד רשת,הערות IT\n";

  state.sites.forEach(s => {
    const c = (s.contacts && s.contacts[0]) || {};
    const it = s.itSpecs || {};
    const row = [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.city || '').replace(/"/g, '""')}"`,
      `"${(s.region || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      `"${(s.technician || '').replace(/"/g, '""')}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.role || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(it.provider || '').replace(/"/g, '""')}"`,
      `"${(it.ipAddress || '').replace(/"/g, '""')}"`,
      `"${(it.routerModel || '').replace(/"/g, '""')}"`,
      `"${(it.techNotes || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `IT_Sites_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('קובץ Excel הופק בהצלחה!', 'success');
  triggerConfetti();
}

function exportToJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.sites, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `IT_Sites_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('גיבוי JSON הורד בהצלחה', 'success');
}

function triggerImportJSON() {
  document.getElementById('json-file-input')?.click();
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported) && imported.length > 0) {
        if (confirm(`נמצאו ${imported.length} אתרים בקובץ. האם לייבא ולהחליף את המאגר הקיים?`)) {
          state.sites = imported;
          saveData();
          renderSites();
          showToast(`יובאו בהצלחה ${imported.length} אתרים!`, 'success');
          triggerConfetti();
        }
      } else {
        showToast('מבנה הקובץ אינו תקין', 'error');
      }
    } catch (err) {
      showToast('שגיאה בקריאת קובץ ה-JSON', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    error: 'bg-rose-600 text-white shadow-rose-500/20',
    info: 'bg-slate-900 text-white shadow-slate-500/20'
  };

  toast.className = `${colors[type] || colors.info} px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2.5 transform transition-all duration-300 translate-y-3 opacity-0 z-50`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-4 h-4"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  initLucideIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
