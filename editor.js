// ==============================
// Localhost CMS Editor
// ==============================
// Only activates on localhost (XAMPP).
// On GitHub Pages this file loads but does nothing.

(function () {
    'use strict';

    // Only activate on localhost
    const hostname = location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '') return;

    let editMode = false;
    let hasUnsavedChanges = false;
    let toolbar, saveBtn, statusText, addNodeBtn;

    // Wait for portfolio to expose its API
    function waitForPortfolio() {
        return new Promise(resolve => {
            if (window.portfolio) return resolve();
            const check = setInterval(() => {
                if (window.portfolio) { clearInterval(check); resolve(); }
            }, 100);
        });
    }

    // ---- Utilities ----
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ---- Toolbar ----
    function createToolbar() {
        toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.innerHTML = `
            <div class="editor-toolbar-left">
                <span class="editor-toolbar-icon">✏️</span>
                <span class="editor-toolbar-label">Edit Mode</span>
            </div>
            <label class="editor-toggle">
                <input type="checkbox" id="editModeToggle">
                <span class="editor-toggle-slider"></span>
            </label>
            <div class="editor-toolbar-status" id="editorStatus"></div>
            <button class="editor-save-btn" id="editorSaveBtn" disabled>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/><polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2"/><polyline points="7 3 7 8 15 8" stroke="currentColor" stroke-width="2"/></svg>
                Save
            </button>
            <button class="editor-sync-btn" id="editorSyncBtn">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Sync
            </button>
        `;
        document.body.appendChild(toolbar);

        // Add node button on canvas
        addNodeBtn = document.createElement('button');
        addNodeBtn.className = 'editor-add-node-btn';
        addNodeBtn.textContent = '+ Add Node';
        addNodeBtn.style.display = 'none';
        const canvasEl = document.querySelector('.canvas');
        if (canvasEl) canvasEl.appendChild(addNodeBtn);

        // Events
        document.getElementById('editModeToggle').addEventListener('change', (e) => toggleEditMode(e.target.checked));
        saveBtn = document.getElementById('editorSaveBtn');
        saveBtn.addEventListener('click', saveData);
        statusText = document.getElementById('editorStatus');

        const syncBtn = document.getElementById('editorSyncBtn');
        syncBtn.addEventListener('click', syncToGit);

        addNodeBtn.addEventListener('click', () => {
            const section = window.portfolio.getCurrentSection();
            if (section && section !== 'dashboard') addNode(section);
        });
    }

    function toggleEditMode(on) {
        editMode = on;
        window.portfolio.editMode = on;
        document.body.classList.toggle('edit-mode-active', on);

        const section = window.portfolio.getCurrentSection();
        addNodeBtn.style.display = (on && section !== 'dashboard') ? '' : 'none';

        if (on) {
            setStatus('Edit mode enabled', 'info');
            if (section === 'dashboard') enableDashboardEditing();
        } else {
            setStatus('', '');
            const panel = document.getElementById('detailPanel');
            if (panel && panel.classList.contains('open')) {
                document.getElementById('closePanelBtn').click();
            }
        }
    }

    function setStatus(text, type) {
        if (!statusText) return;
        statusText.textContent = text;
        statusText.className = 'editor-toolbar-status' + (type ? ` status-${type}` : '');
    }

    function markUnsaved() {
        hasUnsavedChanges = true;
        if (saveBtn) saveBtn.disabled = false;
        setStatus('Unsaved changes', 'warning');
    }

    // ---- Save ----
    async function saveData() {
        const data = window.portfolio.getData();
        setStatus('Saving...', 'info');
        saveBtn.disabled = true;

        try {
            const response = await fetch('api/save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (result.success) {
                hasUnsavedChanges = false;
                setStatus('Saved ✓', 'success');
                setTimeout(() => { if (!hasUnsavedChanges) setStatus('', ''); }, 3000);
            } else {
                saveBtn.disabled = false;
                setStatus('Error: ' + result.error, 'error');
            }
        } catch (err) {
            saveBtn.disabled = false;
            setStatus('Save failed: ' + err.message, 'error');
        }
    }

    // ---- Git Sync ----
    async function syncToGit() {
        const syncBtn = document.getElementById('editorSyncBtn');
        setStatus('Syncing to Git...', 'info');
        syncBtn.disabled = true;

        // If there are unsaved changes, save first
        if (hasUnsavedChanges) {
            try {
                await saveData();
            } catch (e) {
                syncBtn.disabled = false;
                setStatus('Save failed, sync aborted', 'error');
                return;
            }
        }

        try {
            const response = await fetch('api/sync.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.success) {
                const msg = result.committed ? 'Pushed to ' + result.branch + ' ✓' : 'Already up to date ✓';
                setStatus(msg, 'success');
                setTimeout(() => { if (!hasUnsavedChanges) setStatus('', ''); }, 4000);
            } else {
                setStatus('Sync error: ' + result.error, 'error');
            }
        } catch (err) {
            setStatus('Sync failed: ' + err.message, 'error');
        }
        syncBtn.disabled = false;
    }

    // ---- Node Editor (Detail Panel) ----
    function showNodeEditor(node, sectionKey) {
        const panelContent = document.getElementById('panelContent');
        const panelTitle = document.getElementById('panelTitle');
        if (panelTitle) panelTitle.textContent = 'Edit Node';

        const data = window.portfolio.getData();
        const section = data.sections[sectionKey];
        const otherNodes = section.nodes.filter(n => n.id !== node.id);
        const nodeConns = section.connections.filter(c => c.start === node.id || c.end === node.id);

        const connOptions = otherNodes.map(n => `<option value="${n.id}">${escapeHtml(n.label)}</option>`).join('');
        const connList = nodeConns.length ? nodeConns.map(c => {
            const otherId = c.start === node.id ? c.end : c.start;
            const other = section.nodes.find(n => n.id === otherId);
            const dir = c.start === node.id ? '→' : '←';
            return `<div class="editor-conn-item"><span>${dir} ${other ? escapeHtml(other.label) : otherId}</span><button class="editor-conn-delete" data-start="${c.start}" data-end="${c.end}">✕</button></div>`;
        }).join('') : '<div class="editor-conn-empty">No connections</div>';

        panelContent.innerHTML = `
            <div class="editor-form">
                <div class="editor-field"><label>Label</label><input type="text" id="editLabel" value="${escapeAttr(node.label)}"></div>
                <div class="editor-field"><label>Type</label><select id="editType"><option value="trigger" ${node.type === 'trigger' ? 'selected' : ''}>Trigger</option><option value="action" ${node.type === 'action' ? 'selected' : ''}>Action</option></select></div>
                <div class="editor-field"><label>Icon URL</label><div class="editor-icon-row"><input type="text" id="editIcon" value="${escapeAttr(node.icon)}"><div class="editor-icon-preview" id="editIconPreview">${node.icon ? `<img src="${escapeAttr(node.icon)}" alt="icon">` : '—'}</div></div></div>
                <div class="editor-field"><label>Badge</label><input type="text" id="editOps" value="${escapeAttr(node.operations)}"></div>
                <div class="editor-field"><label>Tooltip</label><input type="text" id="editTooltip" value="${escapeAttr(node.tooltip)}"></div>
                <div class="editor-field"><label>Details (HTML)</label><textarea id="editDetails" rows="8">${escapeHtml(node.details || '')}</textarea></div>
                <div class="editor-field"><label>Preview</label><div class="editor-preview" id="editPreview">${node.details || ''}</div></div>
                <div class="editor-field"><label>Connections</label><div class="editor-connections-list" id="editConnList">${connList}</div><div class="editor-conn-add"><select id="editConnTarget"><option value="">— Select node —</option>${connOptions}</select><button class="editor-conn-add-btn" id="editConnAddBtn">+ Connect</button></div></div>
                <div class="editor-form-actions"><button class="editor-btn-save" id="editNodeSaveBtn">💾 Save Node</button><button class="editor-btn-delete" id="editNodeDeleteBtn">🗑️ Delete</button></div>
            </div>
        `;

        // Icon preview
        document.getElementById('editIcon').addEventListener('input', (e) => {
            const p = document.getElementById('editIconPreview');
            p.innerHTML = e.target.value ? `<img src="${escapeAttr(e.target.value)}" alt="icon" onerror="this.parentElement.textContent='❌'">` : '—';
        });

        // Details live preview
        document.getElementById('editDetails').addEventListener('input', (e) => {
            document.getElementById('editPreview').innerHTML = e.target.value;
        });

        // Delete connection
        document.querySelectorAll('.editor-conn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                section.connections = section.connections.filter(c => !(c.start === btn.dataset.start && c.end === btn.dataset.end));
                markUnsaved();
                refreshAfterEdit(sectionKey, node.id);
            });
        });

        // Add connection
        document.getElementById('editConnAddBtn').addEventListener('click', () => {
            const targetId = document.getElementById('editConnTarget').value;
            if (!targetId) return;
            if (section.connections.some(c => (c.start === node.id && c.end === targetId) || (c.start === targetId && c.end === node.id))) {
                alert('Connection already exists'); return;
            }
            section.connections.push({ start: node.id, end: targetId });
            markUnsaved();
            refreshAfterEdit(sectionKey, node.id);
        });

        // Save node
        document.getElementById('editNodeSaveBtn').addEventListener('click', () => {
            node.label = document.getElementById('editLabel').value;
            node.type = document.getElementById('editType').value;
            node.icon = document.getElementById('editIcon').value;
            node.operations = document.getElementById('editOps').value;
            node.tooltip = document.getElementById('editTooltip').value;
            node.details = document.getElementById('editDetails').value;
            markUnsaved();
            refreshAfterEdit(sectionKey, node.id);
        });

        // Delete node
        document.getElementById('editNodeDeleteBtn').addEventListener('click', () => {
            if (!confirm('Delete node "' + node.label + '"? This also removes its connections.')) return;
            section.nodes = section.nodes.filter(n => n.id !== node.id);
            section.connections = section.connections.filter(c => c.start !== node.id && c.end !== node.id);
            markUnsaved();
            document.getElementById('closePanelBtn').click();
            window.portfolio.renderSection(sectionKey);
            setTimeout(() => {
                window.portfolio.fitToScreen();
                if (window.portfolio.getFeatureFlags().particles) window.portfolio.startParticles();
            }, 100);
        });

        document.getElementById('detailPanel').classList.add('open');
    }

    function refreshAfterEdit(sectionKey, nodeId) {
        window.portfolio.renderSection(sectionKey);
        setTimeout(() => {
            window.portfolio.fitToScreen();
            if (window.portfolio.getFeatureFlags().particles) window.portfolio.startParticles();
            const el = document.getElementById('node-' + nodeId);
            if (el) el.click();
        }, 150);
    }

    // ---- Add Node ----
    function addNode(sectionKey) {
        const data = window.portfolio.getData();
        const section = data.sections[sectionKey];
        const newId = sectionKey + '_' + Date.now();

        let cx = 400, cy = 300;
        if (section.nodes.length > 0) {
            cx = section.nodes.reduce((s, n) => s + n.x, 0) / section.nodes.length + 150;
            cy = section.nodes.reduce((s, n) => s + n.y, 0) / section.nodes.length + 100;
        }

        const newNode = {
            id: newId, type: 'action', label: 'New Node', icon: '',
            x: cx, y: cy, operations: '', tooltip: 'Click to edit',
            details: '<h2>New Node</h2><p>Edit this node to add your content.</p>'
        };

        section.nodes.push(newNode);
        markUnsaved();
        window.portfolio.renderSection(sectionKey);
        setTimeout(() => {
            window.portfolio.fitToScreen();
            if (window.portfolio.getFeatureFlags().particles) window.portfolio.startParticles();
            showNodeEditor(newNode, sectionKey);
        }, 200);
    }

    // ---- Dashboard Editing ----
    function enableDashboardEditing() {
        if (!editMode) return;
        const data = window.portfolio.getData();

        // Stats edit overlays
        document.querySelectorAll('.dash-stat').forEach((el, idx) => {
            if (idx >= data.stats.length || el.querySelector('.editor-stat-overlay')) return;
            const overlay = document.createElement('div');
            overlay.className = 'editor-stat-overlay';
            overlay.innerHTML = '✏️';
            overlay.title = 'Edit stat';
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                showStatEditor(data.stats[idx]);
            });
            el.appendChild(overlay);
        });

        // Card edit buttons
        document.querySelectorAll('.dash-card').forEach(card => {
            if (card.querySelector('.editor-card-edit-btn')) return;
            const key = card.dataset.goto;
            if (!key || !data.sections[key]) return;
            const btn = document.createElement('button');
            btn.className = 'editor-card-edit-btn';
            btn.innerHTML = '✏️';
            btn.title = 'Edit card';
            btn.addEventListener('click', (e) => { e.stopPropagation(); showCardEditor(key); });
            card.appendChild(btn);
        });
    }

    function showStatEditor(stat) {
        createEditModal('Edit Stat', `
            <div class="editor-field"><label>Number</label><input type="number" id="statCount" value="${stat.count}"></div>
            <div class="editor-field"><label>Suffix</label><input type="text" id="statSuffix" value="${escapeAttr(stat.suffix)}"></div>
            <div class="editor-field"><label>Label</label><input type="text" id="statLabel" value="${escapeAttr(stat.label)}"></div>
        `, (modal) => {
            stat.count = parseInt(document.getElementById('statCount').value) || 0;
            stat.suffix = document.getElementById('statSuffix').value;
            stat.label = document.getElementById('statLabel').value;
            markUnsaved();
            window.portfolio.populateDashboard(window.portfolio.getData());
            setTimeout(enableDashboardEditing, 100);
            removeEditModal(modal);
        });
    }

    function showCardEditor(sectionKey) {
        const data = window.portfolio.getData();
        const section = data.sections[sectionKey];
        const card = section.card || {};
        const tags = (card.tags || []).join(', ');

        createEditModal('Edit — ' + section.title, `
            <div class="editor-field"><label>Section Title</label><input type="text" id="cardTitle" value="${escapeAttr(section.title)}"></div>
            <div class="editor-field"><label>Card Description</label><textarea id="cardDesc" rows="3">${escapeHtml(card.description || '')}</textarea></div>
            <div class="editor-field"><label>Tags (comma-separated)</label><input type="text" id="cardTags" value="${escapeAttr(tags)}"></div>
        `, (modal) => {
            section.title = document.getElementById('cardTitle').value;
            section.card = section.card || {};
            section.card.description = document.getElementById('cardDesc').value;
            section.card.tags = document.getElementById('cardTags').value.split(',').map(t => t.trim()).filter(Boolean);
            markUnsaved();
            window.portfolio.populateDashboard(window.portfolio.getData());
            setTimeout(enableDashboardEditing, 100);
            removeEditModal(modal);
        });
    }

    // ---- Profile / Contact Editing ----
    function enableProfileEditing() {
        if (!editMode) return;
        const modal = document.getElementById('aboutModal');
        if (!modal || modal.querySelector('.editor-profile-edit-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'editor-profile-edit-btn';
        btn.textContent = '✏️ Edit Profile';
        btn.addEventListener('click', (e) => { e.stopPropagation(); showProfileEditor(); });
        const body = modal.querySelector('.modal-body');
        if (body) body.appendChild(btn);
    }

    function showProfileEditor() {
        const data = window.portfolio.getData();
        const p = data.profile;
        createEditModal('Edit Profile', `
            <div class="editor-field"><label>Name</label><input type="text" id="profName" value="${escapeAttr(p.name)}"></div>
            <div class="editor-field"><label>Title</label><input type="text" id="profTitle" value="${escapeAttr(p.title)}"></div>
            <div class="editor-field"><label>Subtitle</label><input type="text" id="profSubtitle" value="${escapeAttr(p.subtitle)}"></div>
            <div class="editor-field"><label>Company</label><input type="text" id="profCompany" value="${escapeAttr(p.company)}"></div>
            <div class="editor-field"><label>Tagline</label><textarea id="profTagline" rows="2">${escapeHtml(p.tagline)}</textarea></div>
            <div class="editor-field"><label>Bio</label><textarea id="profBio" rows="4">${escapeHtml(p.bio)}</textarea></div>
            <div class="editor-field"><label>Location</label><input type="text" id="profLoc" value="${escapeAttr(p.location)}"></div>
            <div class="editor-field"><label>Nationality</label><input type="text" id="profNat" value="${escapeAttr(p.nationality)}"></div>
            <div class="editor-field"><label>Date of Birth</label><input type="text" id="profDob" value="${escapeAttr(p.dob)}"></div>
            <div class="editor-field"><label>Languages</label><input type="text" id="profLangs" value="${escapeAttr(p.languages)}"></div>
        `, (modal) => {
            p.name = document.getElementById('profName').value;
            p.title = document.getElementById('profTitle').value;
            p.subtitle = document.getElementById('profSubtitle').value;
            p.company = document.getElementById('profCompany').value;
            p.tagline = document.getElementById('profTagline').value;
            p.bio = document.getElementById('profBio').value;
            p.location = document.getElementById('profLoc').value;
            p.nationality = document.getElementById('profNat').value;
            p.dob = document.getElementById('profDob').value;
            p.languages = document.getElementById('profLangs').value;
            markUnsaved();
            window.portfolio.populateDashboard(data);
            window.portfolio.populateAboutModal(p);
            closeModal('aboutModal');
            removeEditModal(modal);
        });
    }

    function enableContactEditing() {
        if (!editMode) return;
        const modal = document.getElementById('contactModal');
        if (!modal || modal.querySelector('.editor-profile-edit-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'editor-profile-edit-btn';
        btn.textContent = '✏️ Edit Contact';
        btn.addEventListener('click', (e) => { e.stopPropagation(); showContactEditor(); });
        const body = modal.querySelector('.modal-body');
        if (body) body.appendChild(btn);
    }

    function showContactEditor() {
        const data = window.portfolio.getData();
        const c = data.contact;
        createEditModal('Edit Contact', `
            <div class="editor-field"><label>Phone (link)</label><input type="text" id="contPhone" value="${escapeAttr(c.phone)}"></div>
            <div class="editor-field"><label>Phone (display)</label><input type="text" id="contPhoneDisp" value="${escapeAttr(c.phoneDisplay)}"></div>
            <div class="editor-field"><label>Email</label><input type="text" id="contEmail" value="${escapeAttr(c.email)}"></div>
            <div class="editor-field"><label>LinkedIn URL</label><input type="text" id="contLi" value="${escapeAttr(c.linkedin)}"></div>
            <div class="editor-field"><label>LinkedIn Display</label><input type="text" id="contLiDisp" value="${escapeAttr(c.linkedinDisplay)}"></div>
        `, (modal) => {
            c.phone = document.getElementById('contPhone').value;
            c.phoneDisplay = document.getElementById('contPhoneDisp').value;
            c.email = document.getElementById('contEmail').value;
            c.linkedin = document.getElementById('contLi').value;
            c.linkedinDisplay = document.getElementById('contLiDisp').value;
            markUnsaved();
            window.portfolio.populateContactModal(c);
            closeModal('contactModal');
            removeEditModal(modal);
        });
    }

    // ---- Generic Edit Modal ----
    function createEditModal(title, fieldsHtml, onSave) {
        const modal = document.createElement('div');
        modal.className = 'editor-modal-overlay';
        modal.innerHTML = `
            <div class="editor-modal">
                <div class="editor-modal-header"><h3>${title}</h3><button class="editor-modal-close">✕</button></div>
                <div class="editor-modal-body">${fieldsHtml}</div>
                <div class="editor-modal-footer"><button class="editor-modal-cancel">Cancel</button><button class="editor-modal-save">💾 Save</button></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.offsetHeight; // reflow
        modal.classList.add('active');

        modal.querySelector('.editor-modal-close').addEventListener('click', () => removeEditModal(modal));
        modal.querySelector('.editor-modal-cancel').addEventListener('click', () => removeEditModal(modal));
        modal.querySelector('.editor-modal-save').addEventListener('click', () => onSave(modal));
        modal.addEventListener('click', (e) => { if (e.target === modal) removeEditModal(modal); });
        return modal;
    }

    function removeEditModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    // ---- Observers (for dynamic edit buttons) ----
    function setupObservers() {
        // Re-add dashboard edit overlays when dashboard is shown
        const dashEl = document.getElementById('dashboard');
        if (dashEl) {
            new MutationObserver(() => {
                if (dashEl.classList.contains('active') && editMode) setTimeout(enableDashboardEditing, 100);
            }).observe(dashEl, { attributes: true, attributeFilter: ['class'] });
        }

        // Add profile/contact edit buttons when modals open
        const aboutModal = document.getElementById('aboutModal');
        if (aboutModal) {
            new MutationObserver(() => {
                if (aboutModal.classList.contains('active') && editMode) setTimeout(enableProfileEditing, 100);
            }).observe(aboutModal, { attributes: true, attributeFilter: ['class'] });
        }

        const contactModal = document.getElementById('contactModal');
        if (contactModal) {
            new MutationObserver(() => {
                if (contactModal.classList.contains('active') && editMode) setTimeout(enableContactEditing, 100);
            }).observe(contactModal, { attributes: true, attributeFilter: ['class'] });
        }

        // Update addNodeBtn visibility when section changes
        setInterval(() => {
            if (!addNodeBtn) return;
            const section = window.portfolio.getCurrentSection();
            addNodeBtn.style.display = (editMode && section !== 'dashboard') ? '' : 'none';
        }, 500);
    }

    // ---- Drag position tracking ----
    function setupDragTracking() {
        window.addEventListener('mouseup', () => {
            if (editMode && window.portfolio.editMode) {
                // Node positions are updated live by the main script's drag handler.
                // We just mark unsaved if a drag happened (debounced check).
            }
        });

        // Listen for the custom event from script.js
        window.addEventListener('nodeDragEnd', () => {
            if (editMode) markUnsaved();
        });
    }

    // ---- Init ----
    async function init() {
        await waitForPortfolio();
        createToolbar();
        window.portfolio.onNodeEdit = showNodeEditor;
        setupObservers();
        setupDragTracking();
        console.log('📝 Editor ready — localhost CMS active');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
