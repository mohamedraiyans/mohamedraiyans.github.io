// ==============================
// CV Data Model — loaded from data.json
// ==============================
let cvData = {};
let portfolioData = {};

// Section SVG icons (structural UI — not editable content)
const SECTION_ICONS = {
    skills: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    experience: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    projects: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19 12h3M2 12h3M12 2v3M12 19v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    education: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    recommendations: '<svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4v8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const SECTION_ACCENT_VARS = {
    skills: '--accent-skills',
    experience: '--accent-experience',
    projects: '--accent-projects',
    education: '--accent-education',
    recommendations: '--accent-recommendations'
};

// ==============================
// Data Loading & Population
// ==============================
async function loadPortfolioData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        portfolioData = data;
        cvData = data.sections;
        return data;
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
        return null;
    }
}

function populateDashboard(data) {
    // Hero overlay
    const heroName = document.getElementById('heroName');
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroName) heroName.textContent = data.profile.name;
    if (heroSubtitle) heroSubtitle.textContent = data.profile.subtitle;

    // Topbar
    const orgName = document.getElementById('orgName');
    if (orgName) orgName.textContent = data.profile.name;

    // Dashboard hero
    const dashHeroBadge = document.getElementById('dashHeroBadge');
    const dashHeroTitle = document.getElementById('dashHeroTitle');
    const dashHeroTagline = document.getElementById('dashHeroTagline');
    if (dashHeroBadge) dashHeroBadge.textContent = data.profile.title;
    if (dashHeroTitle) dashHeroTitle.textContent = data.profile.name;
    if (dashHeroTagline) dashHeroTagline.textContent = data.profile.tagline;

    // Stats
    const dashStats = document.getElementById('dashStats');
    if (dashStats) {
        dashStats.innerHTML = data.stats.map(s => `
            <div class="dash-stat">
                <span class="dash-stat-number" data-count="${s.count}">0</span>${s.suffix ? `<span class="dash-stat-suffix">${s.suffix}</span>` : ''}
                <span class="dash-stat-label">${s.label}</span>
            </div>
        `).join('');
    }

    // Section Cards
    const dashCards = document.getElementById('dashCards');
    if (dashCards) {
        dashCards.innerHTML = Object.entries(data.sections).map(([key, section]) => {
            const icon = SECTION_ICONS[key] || '';
            const accentVar = SECTION_ACCENT_VARS[key] || '--color-primary';
            const card = section.card || {};
            const tags = (card.tags || []).map(t => `<span>${t}</span>`).join('');
            return `
                <div class="dash-card" data-goto="${key}">
                    <div class="dash-card-accent" style="--card-accent: var(${accentVar})"></div>
                    <div class="dash-card-icon" style="--card-accent: var(${accentVar})">${icon}</div>
                    <h3>${section.title}</h3>
                    <p>${card.description || ''}</p>
                    <div class="dash-card-tags">${tags}</div>
                    <div class="dash-card-arrow">→</div>
                </div>
            `;
        }).join('');
    }
}

function populateAboutModal(profile) {
    const aboutName = document.getElementById('aboutName');
    const aboutHeadline = document.getElementById('aboutHeadline');
    const body = document.getElementById('aboutModalBody');
    if (aboutName) aboutName.textContent = profile.name;
    if (aboutHeadline) aboutHeadline.textContent = `${profile.title} @ ${profile.company}`;
    if (body) {
        body.innerHTML = `
            <div class="about-info-grid">
                <div class="about-info-item"><span class="about-info-label">📍 Location</span><span>${profile.location}</span></div>
                <div class="about-info-item"><span class="about-info-label">🌍 Nationality</span><span>${profile.nationality}</span></div>
                <div class="about-info-item"><span class="about-info-label">🎂 Date of Birth</span><span>${profile.dob}</span></div>
                <div class="about-info-item"><span class="about-info-label">🗣️ Languages</span><span>${profile.languages}</span></div>
            </div>
            <h3>Profile</h3>
            <p>${profile.bio}</p>
        `;
    }
}

function populateContactModal(contact) {
    const body = document.getElementById('contactModalBody');
    if (!body) return;
    body.innerHTML = `
        <div class="contact-cards">
            <a href="tel:${contact.phone}" class="contact-card phone-card">
                <div class="contact-card-icon"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" stroke-width="2"/></svg></div>
                <div><div class="contact-card-label">Phone</div><div class="contact-card-value">${contact.phoneDisplay}</div></div>
                <div class="contact-card-arrow">→</div>
            </a>
            <a href="mailto:${contact.email}" class="contact-card email-card">
                <div class="contact-card-icon"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/></svg></div>
                <div><div class="contact-card-label">Email</div><div class="contact-card-value">${contact.email}</div></div>
                <div class="contact-card-arrow">→</div>
            </a>
            <a href="${contact.linkedin}" target="_blank" class="contact-card linkedin-card">
                <div class="contact-card-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></div>
                <div><div class="contact-card-label">LinkedIn</div><div class="contact-card-value">${contact.linkedinDisplay}</div></div>
                <div class="contact-card-arrow">→</div>
            </a>
        </div>
    `;
}

// ==============================
// State
// ==============================
let currentSection = 'dashboard';
let scale = 1;
let translateX = 0;
let translateY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;
let activeNode = null;
let isDraggingNode = false;
let selectedNodeEl = null;
let ghostDemoDone = {};

// ==============================
// Global Modal Helpers
// ==============================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'flex';
        el.offsetHeight;
        el.classList.add('active');
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('active');
        setTimeout(() => { el.style.display = 'none'; }, 300);
    }
}

// ==============================
// Main
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
    // Load data from JSON
    const loadedData = await loadPortfolioData();
    if (!loadedData) {
        console.error('Portfolio data failed to load');
        return;
    }

    // Populate dynamic content
    populateDashboard(loadedData);
    populateAboutModal(loadedData.profile);
    populateContactModal(loadedData.contact);

    const canvas = document.getElementById('canvas');
    const interactiveLayer = document.getElementById('interactiveLayer');
    const canvasBackground = document.getElementById('canvasBackground');
    const svgLayer = document.getElementById('connectionsLayer');
    const detailPanel = document.getElementById('detailPanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const panelContent = document.getElementById('panelContent');
    const pageTitle = document.getElementById('pageTitle');
    const navItems = document.querySelectorAll('.nav-item');
    const zoomIndicator = document.getElementById('zoomIndicator');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const autoAlignBtn = document.getElementById('autoAlignBtn');
    const themeToggle = document.getElementById('themeToggle');
    const heroOverlay = document.getElementById('heroOverlay');
    const heroCta = document.getElementById('heroCta');
    const minimapCanvas = document.getElementById('minimapCanvas');
    const minimapViewport = document.getElementById('minimapViewport');
    const dashboardEl = document.getElementById('dashboard');

    // Modal buttons
    document.getElementById('aboutBtn').addEventListener('click', () => openModal('aboutModal'));
    document.getElementById('contactBtn').addEventListener('click', () => openModal('contactModal'));
    document.getElementById('dashContactBtn').addEventListener('click', () => openModal('contactModal'));

    // ---- Dashboard Helpers ----
    const heroVideoEl = document.getElementById('heroVideo');

    function showDashboard() {
        cancelGhostDemo();
        dashboardEl.classList.add('active');
        canvas.style.display = 'none';
        detailPanel.classList.remove('open');
        if (pageTitle) pageTitle.textContent = 'Dashboard';
        history.replaceState(null, '', '#dashboard');
        animateStatCounters();
        if (heroVideoEl) heroVideoEl.play().catch(() => {});
    }

    function hideDashboard() {
        dashboardEl.classList.remove('active');
        canvas.style.display = '';
        if (heroVideoEl) heroVideoEl.pause();
    }

    function navigateToSection(sectionKey) {
        cancelGhostDemo();
        if (sectionKey === 'dashboard') {
            hideDashboard();
            navItems.forEach(n => n.classList.remove('active'));
            const navTarget = document.querySelector('.nav-item[data-section="dashboard"]');
            if (navTarget) navTarget.classList.add('active');
            showDashboard();
            return;
        }
        hideDashboard();
        navItems.forEach(n => n.classList.remove('active'));
        const navTarget = document.querySelector(`.nav-item[data-section="${sectionKey}"]`);
        if (navTarget) navTarget.classList.add('active');
        renderSection(sectionKey);
        if (typeof featureFlags === 'undefined' || featureFlags.particles) startParticles();
        setTimeout(() => { fitToScreen(); if (typeof featureFlags === 'undefined' || featureFlags.ghostCursor) runGhostDemo(sectionKey); }, 60);
    }

    function animateStatCounters() {
        document.querySelectorAll('.dash-stat-number[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            const duration = 1200;
            const startTime = performance.now();
            el.textContent = '0';
            function tick(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * ease);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    // Use event delegation for data-goto (handles dynamically created cards)
    document.addEventListener('click', (e) => {
        const gotoEl = e.target.closest('[data-goto]');
        if (gotoEl) {
            const target = gotoEl.getAttribute('data-goto');
            if (target && cvData[target]) navigateToSection(target);
        }
    });

    // ---- Hero Intro ----
    const _heroFlagRaw = localStorage.getItem('portfolioFeatures');
    const _heroEnabled = _heroFlagRaw ? (JSON.parse(_heroFlagRaw).heroIntro !== false) : true;
    if (!_heroEnabled || sessionStorage.getItem('heroShown')) {
        heroOverlay.style.display = 'none';
    } else {
        function dismissHero() {
            heroOverlay.classList.add('hidden');
            sessionStorage.setItem('heroShown', '1');
            setTimeout(() => { heroOverlay.style.display = 'none'; }, 800);
        }
        heroCta.addEventListener('click', dismissHero);
        setTimeout(() => heroOverlay.addEventListener('click', (e) => { if (e.target === heroOverlay) dismissHero(); }), 2500);
    }

    // ---- Dark Mode ----
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
        updateMinimap();
    });

    // ---- Transform Helpers ----
    function updateTransform() {
        interactiveLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        canvasBackground.style.backgroundPosition = `${translateX}px ${translateY}px`;
        zoomIndicator.textContent = `${Math.round(scale * 100)}%`;
        updateMinimap();
    }

    function fitToScreen(isClosingPanel = false, isPanelOpening = false) {
        const data = cvData[currentSection];
        if (!data || !data.nodes.length) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        data.nodes.forEach(n => {
            minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x); maxY = Math.max(maxY, n.y);
        });

        const pad = 100, nw = 250, nh = 80;
        minX -= pad; minY -= pad; maxX += nw + pad; maxY += nh + pad;
        const cw = maxX - minX, ch = maxY - minY;
        const rect = canvas.getBoundingClientRect();
        let aw = rect.width;

        if (isClosingPanel && detailPanel.classList.contains('open')) aw += 400;
        if (isPanelOpening && !isClosingPanel) aw -= 400;
        aw = Math.max(200, aw);

        scale = Math.min(Math.max(0.2, Math.min(aw / cw, rect.height / ch)), 1.2);
        translateX = (aw / 2) - ((minX + cw / 2) * scale);
        translateY = (rect.height / 2) - ((minY + ch / 2) * scale);
        updateTransform();
    }

    // ---- Auto-Align (multi-pattern) ----
    const ALIGN_LAYOUTS = ['Tree', 'Radial', 'Circular', 'Grid'];
    let alignLayoutIdx = 0;

    function showAlignLabel(name) {
        let label = document.getElementById('alignLabel');
        if (!label) {
            label = document.createElement('div');
            label.id = 'alignLabel';
            label.style.cssText = 'position:absolute;bottom:68px;right:24px;background:var(--color-panel-bg);border:1px solid var(--color-topbar-border);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;color:var(--color-primary);box-shadow:0 4px 12px rgba(0,0,0,0.12);z-index:16;opacity:0;transition:opacity 0.3s,transform 0.3s;pointer-events:none;font-family:var(--font-family);transform:translateY(4px);';
            canvas.appendChild(label);
        }
        label.textContent = '\u2B21 ' + name;
        label.style.opacity = '1';
        label.style.transform = 'translateY(0)';
        clearTimeout(label._hideTimer);
        label._hideTimer = setTimeout(() => { label.style.opacity = '0'; label.style.transform = 'translateY(4px)'; }, 1800);
    }

    function autoAlignNodes() {
        const data = cvData[currentSection];
        if (!data || !data.nodes.length) return;

        const layoutName = ALIGN_LAYOUTS[alignLayoutIdx];
        alignLayoutIdx = (alignLayoutIdx + 1) % ALIGN_LAYOUTS.length;
        showAlignLabel(layoutName);

        const nodes = data.nodes;
        const connections = data.connections;

        // Build adjacency
        const childrenOf = {}, parentsOf = {};
        nodes.forEach(n => { childrenOf[n.id] = []; parentsOf[n.id] = []; });
        connections.forEach(c => {
            if (childrenOf[c.start]) childrenOf[c.start].push(c.end);
            if (parentsOf[c.end]) parentsOf[c.end].push(c.start);
        });

        // Find roots
        let roots = nodes.filter(n => n.type === 'trigger' || parentsOf[n.id].length === 0);
        if (roots.length === 0) roots = [nodes[0]];

        // BFS: layer assignment + traversal order
        const depthMap = {};
        const bfsOrder = [];
        const visited = new Set();
        const queue = [];
        roots.forEach(r => { queue.push(r.id); visited.add(r.id); depthMap[r.id] = 0; });
        while (queue.length > 0) {
            const id = queue.shift();
            bfsOrder.push(id);
            childrenOf[id].forEach(childId => {
                if (!visited.has(childId)) {
                    visited.add(childId);
                    depthMap[childId] = (depthMap[id] || 0) + 1;
                    queue.push(childId);
                } else {
                    depthMap[childId] = Math.max(depthMap[childId] || 0, (depthMap[id] || 0) + 1);
                }
            });
        }
        nodes.forEach(n => { if (!(n.id in depthMap)) { depthMap[n.id] = 0; bfsOrder.push(n.id); } });

        // Group by layer
        const layers = {};
        nodes.forEach(n => {
            const d = depthMap[n.id];
            if (!layers[d]) layers[d] = [];
            layers[d].push(n);
        });
        const layerKeys = Object.keys(layers).map(Number).sort((a, b) => a - b);
        const maxDepth = layerKeys.length > 0 ? layerKeys[layerKeys.length - 1] : 0;

        const targets = {};
        const cx = 400, cy = 300;

        // ===== LAYOUT: Tree (hierarchical L-to-R) =====
        if (layoutName === 'Tree') {
            const hSp = 280, vSp = 150;

            // Cross-minimization: barycenter heuristic
            if (layerKeys.length > 0) layers[layerKeys[0]].sort((a, b) => a.y - b.y);
            for (let i = 1; i < layerKeys.length; i++) {
                const prev = layers[layerKeys[i - 1]];
                const prevOrd = {};
                prev.forEach((n, idx) => prevOrd[n.id] = idx);
                layers[layerKeys[i]].forEach(n => {
                    const pi = parentsOf[n.id].filter(p => p in prevOrd).map(p => prevOrd[p]);
                    n._bary = pi.length > 0 ? pi.reduce((a, b) => a + b, 0) / pi.length : Infinity;
                });
                layers[layerKeys[i]].sort((a, b) => a._bary - b._bary);
            }

            // Pass 1: even vertical distribution per layer
            layerKeys.forEach(layer => {
                const ln = layers[layer];
                const totalH = (ln.length - 1) * vSp;
                ln.forEach((node, idx) => {
                    targets[node.id] = { x: 100 + layer * hSp, y: cy - totalH / 2 + idx * vSp };
                });
            });
            // Pass 2: pull parents toward children center
            for (let i = layerKeys.length - 2; i >= 0; i--) {
                const ln = layers[layerKeys[i]];
                ln.forEach(n => {
                    const kids = childrenOf[n.id].filter(id => id in targets);
                    if (kids.length > 0) targets[n.id].y = kids.reduce((s, k) => s + targets[k].y, 0) / kids.length;
                });
                ln.sort((a, b) => targets[a.id].y - targets[b.id].y);
                for (let j = 1; j < ln.length; j++) {
                    if (targets[ln[j].id].y - targets[ln[j-1].id].y < vSp) targets[ln[j].id].y = targets[ln[j-1].id].y + vSp;
                }
            }
            // Pass 3: blend children toward parents
            for (let i = 1; i < layerKeys.length; i++) {
                const ln = layers[layerKeys[i]];
                ln.forEach(n => {
                    const pars = parentsOf[n.id].filter(id => id in targets);
                    if (pars.length > 0) {
                        const avgPY = pars.reduce((s, p) => s + targets[p].y, 0) / pars.length;
                        targets[n.id].y = targets[n.id].y * 0.35 + avgPY * 0.65;
                    }
                });
                ln.sort((a, b) => targets[a.id].y - targets[b.id].y);
                for (let j = 1; j < ln.length; j++) {
                    if (targets[ln[j].id].y - targets[ln[j-1].id].y < vSp) targets[ln[j].id].y = targets[ln[j-1].id].y + vSp;
                }
            }
        }

        // ===== LAYOUT: Radial (concentric rings from root) =====
        else if (layoutName === 'Radial') {
            const ringGap = 180;

            // Roots at center
            if (roots.length === 1) {
                targets[roots[0].id] = { x: cx, y: cy };
            } else {
                roots.forEach((r, i) => {
                    const a = (i / roots.length) * Math.PI * 2 - Math.PI / 2;
                    targets[r.id] = { x: cx + Math.cos(a) * 50, y: cy + Math.sin(a) * 50 };
                });
            }

            // Each depth level on a concentric ring
            for (let d = 1; d <= maxDepth; d++) {
                const ln = layers[d] || [];
                if (ln.length === 0) continue;
                const radius = d * ringGap;

                // Calculate parent angles so children cluster near their parents
                const parentAngles = {};
                ln.forEach(n => {
                    const pars = parentsOf[n.id].filter(p => p in targets);
                    if (pars.length > 0) {
                        const avgX = pars.reduce((s, p) => s + targets[p].x, 0) / pars.length;
                        const avgY = pars.reduce((s, p) => s + targets[p].y, 0) / pars.length;
                        parentAngles[n.id] = Math.atan2(avgY - cy, avgX - cx);
                    } else {
                        parentAngles[n.id] = 0;
                    }
                });

                // Sort by parent angle, then distribute evenly
                ln.sort((a, b) => parentAngles[a.id] - parentAngles[b.id]);
                const angleStep = (Math.PI * 2) / Math.max(ln.length, 1);
                const baseAngle = ln.length <= 2 ? -Math.PI / 2 : parentAngles[ln[0].id] - (ln.length - 1) * angleStep / 2;
                ln.forEach((node, idx) => {
                    const angle = baseAngle + idx * angleStep;
                    targets[node.id] = {
                        x: cx + Math.cos(angle) * radius,
                        y: cy + Math.sin(angle) * radius
                    };
                });
            }

            // Place any orphans at center
            nodes.forEach(n => { if (!(n.id in targets)) targets[n.id] = { x: cx, y: cy }; });
        }

        // ===== LAYOUT: Circular (single ring, BFS order) =====
        else if (layoutName === 'Circular') {
            const radius = Math.max(150, nodes.length * 35);
            bfsOrder.forEach((id, idx) => {
                const angle = (idx / bfsOrder.length) * Math.PI * 2 - Math.PI / 2;
                targets[id] = {
                    x: cx + Math.cos(angle) * radius,
                    y: cy + Math.sin(angle) * radius
                };
            });
        }

        // ===== LAYOUT: Grid (rectangular, BFS order) =====
        else if (layoutName === 'Grid') {
            const cols = Math.ceil(Math.sqrt(nodes.length));
            const spacing = 190;
            const gridW = (cols - 1) * spacing;
            const numRows = Math.ceil(nodes.length / cols);
            const gridH = (numRows - 1) * spacing;
            bfsOrder.forEach((id, idx) => {
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                targets[id] = {
                    x: cx - gridW / 2 + col * spacing,
                    y: cy - gridH / 2 + row * spacing
                };
            });
        }

        // Re-center the whole layout
        let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
        nodes.forEach(n => {
            const t = targets[n.id]; if (!t) return;
            gMinX = Math.min(gMinX, t.x); gMaxX = Math.max(gMaxX, t.x);
            gMinY = Math.min(gMinY, t.y); gMaxY = Math.max(gMaxY, t.y);
        });
        const offX = cx - (gMinX + gMaxX) / 2;
        const offY = cy - (gMinY + gMaxY) / 2;
        nodes.forEach(n => { if (targets[n.id]) { targets[n.id].x += offX; targets[n.id].y += offY; } });

        // --- Smooth animation ---
        const duration = 600;
        const startTime = performance.now();
        const startPos = {};
        nodes.forEach(n => { startPos[n.id] = { x: n.x, y: n.y }; });

        function animateAlign(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3.5);

            nodes.forEach(n => {
                const s = startPos[n.id];
                const tgt = targets[n.id];
                if (!tgt) return;
                n.x = s.x + (tgt.x - s.x) * ease;
                n.y = s.y + (tgt.y - s.y) * ease;
                const el = document.getElementById('node-' + n.id);
                if (el) {
                    el.style.left = n.x + 'px';
                    el.style.top = n.y + 'px';
                }
            });

            updateConnectionPaths(nodes, connections);
            updateMinimap();

            if (t < 1) {
                requestAnimationFrame(animateAlign);
            } else {
                fitToScreen();
                window.dispatchEvent(new CustomEvent('nodeDragEnd'));
            }
        }

        requestAnimationFrame(animateAlign);
    }



    function centerOnNode(node, panelAlreadyOpen) {
        const nodeW = 64, nodeH = 64;
        const rect = canvas.getBoundingClientRect();
        const aw = panelAlreadyOpen ? rect.width : Math.max(200, rect.width - 400);
        const ah = rect.height;
        const targetScale = 1.0;
        const nodeCenterX = node.x + nodeW / 2;
        const nodeCenterY = node.y + nodeH / 2;
        const targetTX = (aw / 2) - (nodeCenterX * targetScale);
        const targetTY = (ah / 2) - (nodeCenterY * targetScale);
        const startTX = translateX, startTY = translateY, startScale2 = scale;
        const duration = 400;
        const startTime = performance.now();
        function animate(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            translateX = startTX + (targetTX - startTX) * ease;
            translateY = startTY + (targetTY - startTY) * ease;
            scale = startScale2 + (targetScale - startScale2) * ease;
            updateTransform();
            if (t < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ---- Zoom Buttons ----
    function applyZoom(factor) {
        let ns = Math.min(Math.max(0.2, scale * factor), 3);
        const r = canvas.getBoundingClientRect();
        const cx = r.width / 2, cy = r.height / 2;
        translateX = cx - (cx - translateX) * (ns / scale);
        translateY = cy - (cy - translateY) * (ns / scale);
        scale = ns;
        updateTransform();
    }

    zoomInBtn.addEventListener('click', () => applyZoom(1.2));
    zoomOutBtn.addEventListener('click', () => applyZoom(0.8));
    zoomResetBtn.addEventListener('click', () => fitToScreen());
    autoAlignBtn.addEventListener('click', () => autoAlignNodes());

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        let ns = Math.min(Math.max(0.2, scale * (1 + e.deltaY * -0.001)), 3);
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        translateX = x - (x - translateX) * (ns / scale);
        translateY = y - (y - translateY) * (ns / scale);
        scale = ns;
        updateTransform();
    }, { passive: false });

    // ---- Touch Support ----
    let lastTouchDist = 0;
    canvas.addEventListener('touchstart', (e) => {
        if (e.target.closest('.node-module,.zoom-controls,.minimap')) return;
        if (e.touches.length === 2) {
            lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        } else if (e.touches.length === 1) {
            isPanning = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            let ns = Math.min(Math.max(0.2, scale * (dist / lastTouchDist)), 3);
            const r = canvas.getBoundingClientRect();
            const cx2 = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
            const cy2 = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
            translateX = cx2 - (cx2 - translateX) * (ns / scale);
            translateY = cy2 - (cy2 - translateY) * (ns / scale);
            scale = ns;
            lastTouchDist = dist;
            updateTransform();
        } else if (isPanning && e.touches.length === 1) {
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', () => { isPanning = false; lastTouchDist = 0; });

    // ---- Mouse Panning ----
    canvas.addEventListener('mousedown', (e) => {
        cancelGhostDemo();
        if (e.target.closest('.node-module,.detail-panel,.sidebar,.topbar,.minimap,.editor-add-node-btn')) return;
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (isPanning) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
        if (isDraggingNode && activeNode) {
            activeNode.data.x = (e.clientX - startX) / scale;
            activeNode.data.y = (e.clientY - startY) / scale;
            activeNode.element.style.left = `${activeNode.data.x}px`;
            activeNode.element.style.top = `${activeNode.data.y}px`;
            updateConnectionPaths(cvData[currentSection].nodes, cvData[currentSection].connections);
            updateMinimap();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDraggingNode) {
            // Dispatch event for editor.js to track position changes
            window.dispatchEvent(new CustomEvent('nodeDragEnd'));
        }
        isPanning = false;
        isDraggingNode = false;
        activeNode = null;
        canvas.style.cursor = 'grab';
    });

    // ---- Render Section ----
    function renderSection(sectionKey) {
        currentSection = sectionKey;
        const data = cvData[sectionKey];
        if (pageTitle && data.title) pageTitle.textContent = data.title;

        interactiveLayer.querySelectorAll('.node-module').forEach(n => n.remove());
        selectedNodeEl = null;
        detailPanel.classList.remove('open');
        scale = 1; translateX = 0; translateY = 0;
        updateTransform();

        data.nodes.forEach((node, idx) => {
            const el = document.createElement('div');
            el.className = 'node-module';
            el.setAttribute('data-section', sectionKey);
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            el.style.animationDelay = `${idx * 0.1}s`;
            el.id = `node-${node.id}`;
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', `${node.label}`);

            const opCount = node.operations ? `<div class="node-operation-count">${node.operations}</div>` : '';
            const tooltipHtml = node.tooltip ? `<div class="node-tooltip">${node.tooltip}</div>` : '';

            let iconHtml;
            if (node.icon) {
                iconHtml = `<div class="node-icon"><img src="${node.icon}" alt="${node.label}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;"></div>`;
            } else {
                const initials = node.label.split(' ').map(w => w[0]).join('').substring(0, 2);
                iconHtml = `<div class="node-icon" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--accent-recommendations),var(--color-primary));border-radius:50%;color:#fff;font-weight:700;font-size:14px;">${initials}</div>`;
            }

            el.innerHTML = `${opCount}${iconHtml}<div class="node-label">${node.label}</div>${tooltipHtml}`;

            // Drag
            el.addEventListener('mousedown', (e) => {
                e.preventDefault(); e.stopPropagation();
                isDraggingNode = true;
                activeNode = { element: el, data: node };
                startX = e.clientX - (node.x * scale);
                startY = e.clientY - (node.y * scale);
            });

            // Click
            el.addEventListener('click', () => {
                if (isDraggingNode) return;

                // If edit mode is on, delegate to editor
                if (window.portfolio && window.portfolio.editMode && window.portfolio.onNodeEdit) {
                    window.portfolio.onNodeEdit(node, sectionKey);
                    return;
                }

                if (selectedNodeEl) selectedNodeEl.classList.remove('selected');
                el.classList.add('selected');
                selectedNodeEl = el;
                panelContent.innerHTML = node.details;
                detailPanel.classList.add('open');
                highlightConnections(node.id);
                setTimeout(() => {
                    resizeParticleCanvas();
                    centerOnNode(node, true);
                }, 320);
            });

            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
            });

            interactiveLayer.appendChild(el);
        });

        drawConnections(data.nodes, data.connections);
        history.replaceState(null, '', `#${sectionKey}`);
    }

    // ---- Connections ----
    function getPathD(s, e) {
        const sx = s.x + 32, sy = s.y + 32, ex = e.x + 32, ey = e.y + 32;
        const mx = sx + (ex - sx) / 2;
        return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`;
    }

    function drawConnections(nodes, connections) {
        svgLayer.innerHTML = '';
        connections.forEach((conn, i) => {
            const s = nodes.find(n => n.id === conn.start);
            const e = nodes.find(n => n.id === conn.end);
            if (!s || !e) return;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", getPathD(s, e));
            path.setAttribute("class", "connection-path");
            path.setAttribute("data-start", conn.start);
            path.setAttribute("data-end", conn.end);
            path.style.animationDelay = `${i * 0.15}s, ${i * 0.15}s`;
            svgLayer.appendChild(path);
        });
    }

    function updateConnectionPaths(nodes, connections) {
        const paths = svgLayer.querySelectorAll('.connection-path');
        connections.forEach((conn, i) => {
            const s = nodes.find(n => n.id === conn.start);
            const e = nodes.find(n => n.id === conn.end);
            if (!s || !e || !paths[i]) return;
            paths[i].setAttribute("d", getPathD(s, e));
        });
    }

    function highlightConnections(nodeId) {
        svgLayer.querySelectorAll('.connection-path').forEach(p => {
            const isConnected = p.getAttribute('data-start') === nodeId || p.getAttribute('data-end') === nodeId;
            p.classList.toggle('glow', isConnected);
        });
    }

    // ---- Ghost Demo Cursor ----
    const ghostCursor = document.getElementById('ghostCursor');
    const ghostRing = document.getElementById('ghostCursorRing');
    let ghostAnimCancelId = null;
    let ghostDemoCancelled = false;

    function cancelGhostDemo() {
        ghostDemoCancelled = true;
        if (ghostAnimCancelId) {
            clearTimeout(ghostAnimCancelId);
            cancelAnimationFrame(ghostAnimCancelId);
            ghostAnimCancelId = null;
        }
        if (ghostCursor) { ghostCursor.classList.remove('visible', 'clicking'); }
        if (ghostRing) { ghostRing.classList.remove('visible', 'click-burst'); }
    }

    function runGhostDemo(sectionKey) {
        cancelGhostDemo();
        ghostDemoCancelled = false;
        const data = cvData[sectionKey];
        if (!data || !data.nodes.length) return;
        const targetNode = data.nodes[0];
        const targetEl = document.getElementById(`node-${targetNode.id}`);
        if (!targetEl) return;

        ghostAnimCancelId = setTimeout(() => {
            if (ghostDemoCancelled) return;
            const nodeRect = targetEl.getBoundingClientRect();
            const nodeCX = nodeRect.left + nodeRect.width / 2;
            const nodeCY = nodeRect.top + nodeRect.height / 2;
            const canvasRect = canvas.getBoundingClientRect();
            const startCX = canvasRect.left + canvasRect.width * 0.75;
            const startCY = canvasRect.top + 80;

            ghostCursor.style.left = `${startCX}px`;
            ghostCursor.style.top = `${startCY}px`;
            ghostCursor.classList.add('visible');

            const moveDuration = 1200;
            const moveStart = performance.now();

            function animateMove(now) {
                if (ghostDemoCancelled) return;
                const elapsed = now - moveStart;
                const t = Math.min(elapsed / moveDuration, 1);
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const nr = targetEl.getBoundingClientRect();
                const curTargetX = nr.left + nr.width / 2;
                const curTargetY = nr.top + nr.height / 2;
                ghostCursor.style.left = `${startCX + (curTargetX - startCX) * ease}px`;
                ghostCursor.style.top = `${startCY + (curTargetY - startCY) * ease}px`;

                if (t < 1) {
                    ghostAnimCancelId = requestAnimationFrame(animateMove);
                } else {
                    ghostRing.style.left = `${curTargetX}px`;
                    ghostRing.style.top = `${curTargetY}px`;
                    ghostRing.classList.add('visible');
                    ghostAnimCancelId = setTimeout(() => {
                        if (ghostDemoCancelled) return;
                        ghostCursor.classList.add('clicking');
                        ghostRing.classList.remove('visible');
                        ghostRing.classList.add('click-burst');
                        targetEl.click();
                        ghostAnimCancelId = setTimeout(() => {
                            ghostCursor.classList.remove('clicking', 'visible');
                            ghostRing.classList.remove('click-burst');
                        }, 600);
                    }, 500);
                }
            }
            requestAnimationFrame(animateMove);
        }, 1200);
    }

    // ---- Particle Animation ----
    const particleCanvasEl = document.createElement('canvas');
    particleCanvasEl.id = 'particleCanvas';
    canvas.appendChild(particleCanvasEl);
    const pCtx = particleCanvasEl.getContext('2d');
    let particles = [];
    let animFrameId = null;

    function resizeParticleCanvas() {
        const r = canvas.getBoundingClientRect();
        particleCanvasEl.width = r.width;
        particleCanvasEl.height = r.height;
    }
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas);
    detailPanel.addEventListener('transitionend', resizeParticleCanvas);

    class Particle {
        constructor(pathEl) {
            this.pathEl = pathEl;
            this.t = Math.random();
            this.speed = 0.002 + Math.random() * 0.003;
            this.size = 1.5 + Math.random() * 2;
            this.opacity = 0.3 + Math.random() * 0.5;
        }
        update() { this.t += this.speed; if (this.t > 1) this.t = 0; }
        draw(ctx) {
            const len = this.pathEl.getTotalLength();
            const pt = this.pathEl.getPointAtLength(this.t * len);
            const sx = pt.x * scale + translateX;
            const sy = pt.y * scale + translateY;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const c = isDark ? '139,92,246' : '82,0,255';
            ctx.beginPath();
            ctx.arc(sx, sy, this.size * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c},${this.opacity})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx, sy, this.size * 2.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c},${this.opacity * 0.15})`;
            ctx.fill();
        }
    }

    function startParticles() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        setTimeout(() => {
            particles = [];
            svgLayer.querySelectorAll('.connection-path').forEach(p => {
                for (let i = 0; i < 4; i++) particles.push(new Particle(p));
            });
            (function loop() {
                pCtx.clearRect(0, 0, particleCanvasEl.width, particleCanvasEl.height);
                particles.forEach(p => { p.update(); p.draw(pCtx); });
                animFrameId = requestAnimationFrame(loop);
            })();
        }, 100);
    }

    // ---- Mini-Map ----
    function updateMinimap() {
        if (!minimapCanvas) return;
        const data = cvData[currentSection];
        if (!data || !data.nodes.length) return;
        const ctx = minimapCanvas.getContext('2d');
        minimapCanvas.width = 160; minimapCanvas.height = 100;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        data.nodes.forEach(n => {
            minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x); maxY = Math.max(maxY, n.y);
        });
        const pad = 50;
        minX -= pad; minY -= pad; maxX += 64 + pad; maxY += 64 + pad;
        const rx = maxX - minX || 1, ry = maxY - minY || 1;

        ctx.clearRect(0, 0, 160, 100);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        ctx.strokeStyle = isDark ? 'rgba(139,92,246,0.3)' : 'rgba(82,0,255,0.2)';
        ctx.lineWidth = 1;
        data.connections.forEach(c => {
            const s = data.nodes.find(n => n.id === c.start);
            const e = data.nodes.find(n => n.id === c.end);
            if (s && e) {
                ctx.beginPath();
                ctx.moveTo(((s.x + 32 - minX) / rx) * 160, ((s.y + 32 - minY) / ry) * 100);
                ctx.lineTo(((e.x + 32 - minX) / rx) * 160, ((e.y + 32 - minY) / ry) * 100);
                ctx.stroke();
            }
        });

        const colors = { skills: '#7C3AED', experience: '#2563EB', projects: '#059669', education: '#D97706', recommendations: '#DB2777' };
        const nc = colors[currentSection] || '#5200FF';
        data.nodes.forEach(n => {
            const nx = ((n.x + 32 - minX) / rx) * 160;
            const ny = ((n.y + 32 - minY) / ry) * 100;
            ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2); ctx.fillStyle = nc; ctx.fill();
            ctx.beginPath(); ctx.arc(nx, ny, 6, 0, Math.PI * 2); ctx.fillStyle = nc + '33'; ctx.fill();
        });

        const cr = canvas.getBoundingClientRect();
        const vl = (-translateX / scale - minX) / rx * 160;
        const vt = (-translateY / scale - minY) / ry * 100;
        const vw = (cr.width / scale) / rx * 160;
        const vh = (cr.height / scale) / ry * 100;
        minimapViewport.style.left = `${Math.max(0, vl)}px`;
        minimapViewport.style.top = `${Math.max(0, vt)}px`;
        minimapViewport.style.width = `${Math.min(160, vw)}px`;
        minimapViewport.style.height = `${Math.min(100, vh)}px`;
    }

    // ---- Navigation ----
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const s = item.getAttribute('data-section');
            if (s) navigateToSection(s);
        });
    });

    closePanelBtn.addEventListener('click', () => {
        const wasOpen = detailPanel.classList.contains('open');
        detailPanel.classList.remove('open');
        if (selectedNodeEl) { selectedNodeEl.classList.remove('selected'); selectedNodeEl = null; }
        svgLayer.querySelectorAll('.connection-path.glow').forEach(p => p.classList.remove('glow'));
        if (wasOpen) {
            fitToScreen(true);
            setTimeout(() => { resizeParticleCanvas(); fitToScreen(); }, 320);
        }
    });

    // ---- Keyboard Navigation ----
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('aboutModal');
            closeModal('contactModal');
            closeModal('settingsModal');
            if (detailPanel.classList.contains('open')) closePanelBtn.click();
        }
        const step = 50;
        if (e.key === 'ArrowLeft') { translateX += step; updateTransform(); }
        if (e.key === 'ArrowRight') { translateX -= step; updateTransform(); }
        if (e.key === 'ArrowUp') { translateY += step; updateTransform(); }
        if (e.key === 'ArrowDown') { translateY -= step; updateTransform(); }

        const sections = ['dashboard', 'skills', 'experience', 'projects', 'education', 'recommendations'];
        const idx = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
        if (idx !== -1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                navigateToSection(sections[idx]);
            }
        }
    });

    // ---- URL Hash Routing ----
    window.addEventListener('hashchange', () => {
        const h = location.hash.replace('#', '');
        if (h === 'dashboard' || (h && cvData[h])) {
            navigateToSection(h);
        }
    });

    // ==============================
    // Settings Panel Logic
    // ==============================
    const SETTINGS_PASSWORD_ENABLED = (typeof CONFIG !== 'undefined' && CONFIG.SETTINGS_PASSWORD_ENABLED !== undefined)
        ? CONFIG.SETTINGS_PASSWORD_ENABLED : true;
    const SETTINGS_USER = (typeof CONFIG !== 'undefined' && CONFIG.SETTINGS_USERNAME) || 'sahfas';
    const SETTINGS_PASS = (typeof CONFIG !== 'undefined' && CONFIG.SETTINGS_PASSWORD) || 'admin123';
    let settingsAuthed = !SETTINGS_PASSWORD_ENABLED;

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsLoginEl = document.getElementById('settingsLogin');
    const settingsPanelEl = document.getElementById('settingsPanel');
    const settingsUserInput = document.getElementById('settingsUser');
    const settingsPassInput = document.getElementById('settingsPass');
    const settingsError = document.getElementById('settingsError');
    const settingsLoginBtn = document.getElementById('settingsLoginBtn');
    const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
    const settingsSubtitle = document.getElementById('settingsSubtitle');

    const toggleGhostCursor = document.getElementById('toggleGhostCursor');
    const toggleHeroIntro = document.getElementById('toggleHeroIntro');
    const toggleParticles = document.getElementById('toggleParticles');
    const toggleTooltips = document.getElementById('toggleTooltips');

    const featureDefaults = { ghostCursor: true, heroIntro: true, particles: true, tooltips: true };

    function loadFeatureFlags() {
        const saved = localStorage.getItem('portfolioFeatures');
        if (saved) {
            try { return { ...featureDefaults, ...JSON.parse(saved) }; }
            catch (e) { return { ...featureDefaults }; }
        }
        return { ...featureDefaults };
    }

    function saveFeatureFlags(flags) {
        localStorage.setItem('portfolioFeatures', JSON.stringify(flags));
    }

    let featureFlags = loadFeatureFlags();

    function applyFeatureFlags() {
        toggleGhostCursor.checked = featureFlags.ghostCursor;
        toggleHeroIntro.checked = featureFlags.heroIntro;
        toggleParticles.checked = featureFlags.particles;
        toggleTooltips.checked = featureFlags.tooltips;
        if (!featureFlags.tooltips) document.body.classList.add('tooltips-disabled');
        else document.body.classList.remove('tooltips-disabled');
        if (!featureFlags.particles && animFrameId) {
            cancelAnimationFrame(animFrameId); animFrameId = null;
            pCtx.clearRect(0, 0, particleCanvasEl.width, particleCanvasEl.height);
            particles = [];
        }
        if (!featureFlags.heroIntro) heroOverlay.style.display = 'none';
    }

    settingsBtn.addEventListener('click', () => {
        if (!settingsAuthed && SETTINGS_PASSWORD_ENABLED) {
            settingsLoginEl.style.display = '';
            settingsPanelEl.style.display = 'none';
            settingsSubtitle.textContent = 'Admin access required';
            settingsError.textContent = '';
            settingsUserInput.value = '';
            settingsPassInput.value = '';
        } else {
            settingsLoginEl.style.display = 'none';
            settingsPanelEl.style.display = '';
            settingsSubtitle.textContent = 'Manage portfolio features';
            if (!SETTINGS_PASSWORD_ENABLED) settingsLogoutBtn.parentElement.style.display = 'none';
            applyFeatureFlags();
        }
        openModal('settingsModal');
        if (!settingsAuthed && SETTINGS_PASSWORD_ENABLED) setTimeout(() => settingsUserInput.focus(), 300);
    });

    function handleSettingsLogin() {
        const user = settingsUserInput.value.trim();
        const pass = settingsPassInput.value;
        if (user === SETTINGS_USER && pass === SETTINGS_PASS) {
            settingsAuthed = true;
            settingsError.textContent = '';
            settingsLoginEl.style.display = 'none';
            settingsPanelEl.style.display = '';
            settingsSubtitle.textContent = 'Manage portfolio features';
            applyFeatureFlags();
        } else {
            settingsError.textContent = '⚠ Invalid credentials. Try again.';
            settingsPassInput.value = '';
            settingsPassInput.focus();
        }
    }

    settingsLoginBtn.addEventListener('click', handleSettingsLogin);
    settingsPassInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSettingsLogin(); });
    settingsUserInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') settingsPassInput.focus(); });

    settingsLogoutBtn.addEventListener('click', () => {
        settingsAuthed = false;
        settingsLoginEl.style.display = '';
        settingsPanelEl.style.display = 'none';
        settingsSubtitle.textContent = 'Admin access required';
        settingsUserInput.value = '';
        settingsPassInput.value = '';
        settingsError.textContent = '';
        setTimeout(() => settingsUserInput.focus(), 100);
    });

    toggleGhostCursor.addEventListener('change', () => {
        featureFlags.ghostCursor = toggleGhostCursor.checked;
        saveFeatureFlags(featureFlags);
        if (!featureFlags.ghostCursor) cancelGhostDemo();
    });

    toggleHeroIntro.addEventListener('change', () => {
        featureFlags.heroIntro = toggleHeroIntro.checked;
        saveFeatureFlags(featureFlags);
        if (!featureFlags.heroIntro) { heroOverlay.style.display = 'none'; sessionStorage.removeItem('heroShown'); }
        else sessionStorage.removeItem('heroShown');
    });

    toggleParticles.addEventListener('change', () => {
        featureFlags.particles = toggleParticles.checked;
        saveFeatureFlags(featureFlags);
        if (!featureFlags.particles) {
            if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
            pCtx.clearRect(0, 0, particleCanvasEl.width, particleCanvasEl.height);
            particles = [];
        } else {
            if (currentSection !== 'dashboard') startParticles();
        }
    });

    toggleTooltips.addEventListener('change', () => {
        featureFlags.tooltips = toggleTooltips.checked;
        saveFeatureFlags(featureFlags);
        if (!featureFlags.tooltips) document.body.classList.add('tooltips-disabled');
        else document.body.classList.remove('tooltips-disabled');
    });

    applyFeatureFlags();

    // ==============================
    // Expose Portfolio API for Editor
    // ==============================
    window.portfolio = {
        editMode: false,
        onNodeEdit: null,
        getData: () => portfolioData,
        getCurrentSection: () => currentSection,
        getFeatureFlags: () => featureFlags,
        renderSection,
        fitToScreen,
        startParticles,
        navigateToSection,
        drawConnections,
        populateDashboard,
        populateAboutModal,
        populateContactModal,
        autoAlignNodes,
    };

    // ---- Initial Render ----
    const hash = location.hash.replace('#', '');
    if (hash && cvData[hash]) {
        navigateToSection(hash);
    } else {
        showDashboard();
    }

    setTimeout(() => { if (currentSection !== 'dashboard') { fitToScreen(); if (featureFlags.particles) startParticles(); } }, 50);
});
