/* ==========================================================================
   MODULE: GROUP GENERATOR (With Preset Support)
   ========================================================================== */

import { historyManager } from '../history.js';

export default class GroupGeneratorModule {
    constructor() {
        this.container = null;
        this.presets = JSON.parse(localStorage.getItem('rans_group_presets') || '{}');
    }

    render(container) {
        this.container = container;
        
        // Render giao diện kèm khu vực Preset Controls
        this.container.innerHTML = `
            <div class="module-card" style="max-width: 680px; margin: 0 auto;">
                <h2 class="module-title">Group Generator</h2>
                <p class="module-desc">Randomly split names into groups by count, size, or duplicate-name constraints.</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <!-- LEFT COLUMN: INPUTS -->
                    <div>
                        <!-- PRESET CONTROLS BAR -->
                        <div style="margin-bottom: 8px; display: flex; gap: 6px; align-items: center;">
                            <select id="select-group-preset" style="
                                flex: 1; 
                                background: #1e293b; 
                                color: #f8fafc; 
                                border: 1px solid rgba(255,255,255,0.15); 
                                border-radius: 6px; 
                                padding: 5px 8px; 
                                font-size: 0.8em;
                                outline: none;
                            ">
                                <option value="">-- Select Preset --</option>
                                ${Object.keys(this.presets).map(name => `<option value="${name}">${name}</option>`).join('')}
                            </select>
                            <button id="btn-save-preset" class="btn-primary" style="padding: 5px 10px; font-size: 0.75em; white-space: nowrap;">💾 Save</button>
                            <button id="btn-del-preset" style="
                                background: rgba(239, 68, 68, 0.15); 
                                color: #ef4444; 
                                border: 1px solid rgba(239, 68, 68, 0.3); 
                                padding: 5px 8px; 
                                border-radius: 6px; 
                                font-size: 0.75em; 
                                cursor: pointer;
                            " title="Delete selected preset">🗑️</button>
                        </div>

                        <label style="font-size: 0.85em; color: #94a3b8; display: block; margin-bottom: 6px;">Name list (one name per line):</label>
                        <textarea id="group-names-input" rows="8" style="
                            width: 100%; 
                            background: rgba(0,0,0,0.25); 
                            border: 1px solid rgba(255,255,255,0.1); 
                            border-radius: 8px; 
                            color: #f8fafc; 
                            padding: 10px; 
                            font-family: monospace; 
                            font-size: 0.9em;
                            resize: vertical;
                            box-sizing: border-box;
                        " placeholder="Enter names here..."></textarea>

                        <div style="margin-top: 14px;">
                            <label style="font-size: 0.85em; color: #94a3b8; display: block; margin-bottom: 6px;">Group split mode:</label>
                            <select id="group-mode-select" style="width: 100%; background: #1e293b; color: #f8fafc; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px; font-size: 0.85em;">
                                <option value="by_groups">By desired number of groups</option>
                                <option value="by_members">By members per group</option>
                            </select>
                        </div>

                        <div style="margin-top: 12px;">
                            <label id="mode-val-label" style="font-size: 0.85em; color: #94a3b8; display: block; margin-bottom: 6px;">Desired number of groups:</label>
                            <input type="number" id="group-mode-val" value="3" min="1" style="width: 100%; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #f8fafc; padding: 8px; font-size: 0.9em; box-sizing: border-box;">
                        </div>

                        <button id="btn-split-groups" class="btn-primary" style="width: 100%; margin-top: 16px; padding: 10px; font-size: 0.9em;">🎲 Split Groups</button>
                    </div>

                    <!-- RIGHT COLUMN: RESULTS -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 style="font-size: 0.95em; color: #10b981; margin: 0;">Group Split Result</h3>
                        </div>
                        <div id="groups-result-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
                            <div style="text-align: center; color: #64748b; font-size: 0.85em; padding: 20px;">No groups generated yet.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const textarea = this.container.querySelector('#group-names-input');
        const selectPreset = this.container.querySelector('#select-group-preset');
        const btnSave = this.container.querySelector('#btn-save-preset');
        const btnDel = this.container.querySelector('#btn-del-preset');
        const btnSplit = this.container.querySelector('#btn-split-groups');

        // Khi chọn Preset -> Đổ dữ liệu vào textarea
        selectPreset?.addEventListener('change', (e) => {
            const name = e.target.value;
            if (name && this.presets[name]) {
                textarea.value = this.presets[name].join('\n');
            }
        });

        // Lưu Preset mới
        btnSave?.addEventListener('click', () => {
            const list = textarea.value.split('\n').map(s => s.trim()).filter(Boolean);
            if (list.length === 0) return alert('Please enter at least one name to save!');

            const presetName = prompt('Enter preset name (e.g. Class 12A, Dev Team):');
            if (!presetName) return;

            this.presets[presetName] = list;
            localStorage.setItem('rans_group_presets', JSON.stringify(this.presets));

            // Re-render select options
            selectPreset.innerHTML = `<option value="">-- Select Preset --</option>` + 
                Object.keys(this.presets).map(n => `<option value="${n}">${n}</option>`).join('');
            selectPreset.value = presetName;

            alert(`Preset "${presetName}" saved!`);
        });

        // Xóa Preset
        btnDel?.addEventListener('click', () => {
            const selected = selectPreset.value;
            if (!selected) return alert('Please select a preset to delete!');

            if (confirm(`Delete preset "${selected}"?`)) {
                delete this.presets[selected];
                localStorage.setItem('rans_group_presets', JSON.stringify(this.presets));
                selectPreset.querySelector(`option[value="${selected}"]`)?.remove();
                selectPreset.value = "";
            }
        });

        // Chia nhóm
        btnSplit?.addEventListener('click', () => this.generateGroups());
    }

    generateGroups() {
    const input = this.container.querySelector('#group-names-input').value;
    const names = input.split('\n').map(s => s.trim()).filter(Boolean);
    if (names.length === 0) return alert('Please enter some names!');

    const mode = this.container.querySelector('#group-mode-select').value;
    const val = parseInt(this.container.querySelector('#group-mode-val').value) || 1;

    // Trộn ngẫu nhiên danh sách (Fisher-Yates Shuffle)
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    let groups = [];

    if (mode === 'by_groups') {
        const groupCount = Math.min(val, shuffled.length);
        for (let i = 0; i < groupCount; i++) groups.push([]);
        shuffled.forEach((name, idx) => groups[idx % groupCount].push(name));
    } else {
        const memberCount = val;
        for (let i = 0; i < shuffled.length; i += memberCount) {
            groups.push(shuffled.slice(i, i + memberCount));
        }
    }

    // Render kết quả ra UI chính
    const resContainer = this.container.querySelector('#groups-result-container');
    resContainer.innerHTML = groups.map((grp, idx) => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px;">
            <div style="font-size: 0.8em; color: #10b981; font-weight: 600; margin-bottom: 6px;">Group ${idx + 1} (${grp.length} members)</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${grp.map(m => `<span style="background: rgba(0,0,0,0.3); color: #f8fafc; font-size: 0.8em; padding: 2px 6px; border-radius: 4px;">${m}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Build chuỗi kết quả chi tiết từng nhóm để lưu vào Log
    const logFormattedResult = groups.map((grp, idx) => 
        `<div style="margin-bottom: 6px;">` +
            `<strong style="color: #10b981; font-size: 0.8em;">Group ${idx + 1}:</strong> ` +
            `<span style="color: #cbd5e1; font-size: 0.85em;">${grp.join(', ')}</span>` +
        `</div>`
    ).join('');

    // Ghi Log chi tiết các nhóm vào Global History
    historyManager.addLog('Group Generator', logFormattedResult);
}
}