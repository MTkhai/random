/* ==========================================================================
   MODULE: GROUP GENERATOR (REFACTORED ARCHITECTURE)
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class GroupModule {
    constructor() {
        this.container = null;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Group Generator</h2>
                <p class="module-desc">Randomly split names into groups by count, size, or duplicate-name constraints.</p>

                <div class="group-workspace" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px;">
                    <!-- INPUT PANEL -->
                    <div class="input-panel">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-muted, #aaa); font-size: 0.9em;">Name list (one name per line):</label>
                            <textarea id="group-names-input" class="form-input" rows="10" placeholder="Alice&#10;Bob&#10;Charlie&#10;David&#10;Alice&#10;Bob" style="width: 100%; resize: vertical; padding: 12px; font-family: inherit;"></textarea>
                        </div>

                        <!-- MODES -->
                        <div class="form-group" style="margin-top: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-muted, #aaa); font-size: 0.9em;">Group split mode:</label>
                            <select id="group-mode" class="form-input" style="width: 100%; padding: 10px;">
                                <option value="by_groups">By desired number of groups</option>
                                <option value="by_size">By maximum people per group</option>
                                <option value="unique_names">Each group has no duplicate names</option>
                                <option value="same_names">Same names must stay in the same group</option>
                            </select>
                        </div>

                        <!-- DYNAMIC CONFIG -->
                        <div id="config-target-container" class="form-group" style="margin-top: 16px;">
                            <label id="config-target-label" style="display: block; margin-bottom: 8px; color: var(--text-muted, #aaa); font-size: 0.9em;">Number of groups:</label>
                            <input type="number" id="group-target-val" class="form-input" value="3" min="1" max="100" style="width: 100%; padding: 8px 12px;">
                        </div>

                        <!-- REMAINDER CONFIG (Shown only when splitting by group count) -->
                        <div id="config-remainder-container" class="form-group" style="margin-top: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-muted, #aaa); font-size: 0.9em;">Remainder handling:</label>
                            <select id="group-remainder-mode" class="form-input" style="width: 100%; padding: 10px;">
                                <option value="distribute">Distribute evenly across groups (e.g. 4, 3, 3)</option>
                                <option value="extra">Create an extra group for the remainder</option>
                            </select>
                        </div>

                        <button id="btn-split-groups" class="btn-primary" style="width: 100%; padding: 12px; margin-top: 20px; font-size: 1rem;">🎲 Split Groups</button>
                    </div>

                    <!-- OUTPUT PANEL -->
                    <div class="output-panel" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="font-size: 1.1rem; color: #10b981; margin: 0;">Group Split Result</h3>
                            <button id="btn-copy-groups" class="btn-secondary" style="padding: 6px 12px; font-size: 0.85em; display: none;">📋 Copy Result</button>
                        </div>
                        <div id="group-results" style="flex: 1; overflow-y: auto; max-height: 480px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="color: var(--text-muted, #888); text-align: center; margin-top: 40px; font-style: italic;">Enter a list and click "Split Groups" to see the result.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.updateUIByMode();
    }

    bindEvents() {
        const modeSelect = this.container.querySelector('#group-mode');
        const btnSplit = this.container.querySelector('#btn-split-groups');
        const btnCopy = this.container.querySelector('#btn-copy-groups');

        modeSelect?.addEventListener('change', () => this.updateUIByMode());
        btnSplit?.addEventListener('click', () => this.processSplit());

        btnCopy?.addEventListener('click', () => {
            const resultsEl = this.container.querySelector('#group-results');
            if (!resultsEl) return;

            let text = '';
            resultsEl.querySelectorAll('.group-box').forEach((box) => {
                const title = box.querySelector('.group-title')?.textContent || '';
                const members = Array.from(box.querySelectorAll('.group-member')).map(m => m.textContent.trim());
                text += `${title}\n${members.map(m => `- ${m}`).join('\n')}\n\n`;
            });

            if (text) {
                navigator.clipboard.writeText(text.trim());
                btnCopy.textContent = '✅ Copied!';
                setTimeout(() => btnCopy.textContent = '📋 Copy Result', 1200);
            }
        });
    }

    updateUIByMode() {
        const mode = this.container.querySelector('#group-mode').value;
        const targetContainer = this.container.querySelector('#config-target-container');
        const targetLabel = this.container.querySelector('#config-target-label');
        const remainderContainer = this.container.querySelector('#config-remainder-container');

        if (mode === 'by_groups') {
            targetContainer.style.display = 'block';
            targetLabel.textContent = 'Desired number of groups:';
            remainderContainer.style.display = 'block';
        } else if (mode === 'by_size') {
            targetContainer.style.display = 'block';
            targetLabel.textContent = 'Maximum people per group:';
            remainderContainer.style.display = 'none';
        } else if (mode === 'unique_names') {
            targetContainer.style.display = 'none';
            remainderContainer.style.display = 'none';
        } else if (mode === 'same_names') {
            targetContainer.style.display = 'block';
            targetLabel.textContent = 'Desired number of groups:';
            remainderContainer.style.display = 'none';
        }
    }

    processSplit() {
        const rawInput = this.container.querySelector('#group-names-input').value;
        const names = rawInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);

        if (names.length === 0) {
            alert('Please enter at least 1 name!');
            return;
        }

        const mode = this.container.querySelector('#group-mode').value;
        const targetVal = parseInt(this.container.querySelector('#group-target-val').value) || 1;
        const remainderMode = this.container.querySelector('#group-remainder-mode').value;

        let groups = [];

        // INDEPENDENT ALGORITHM ROUTING
        switch (mode) {
            case 'by_groups':
                groups = this.splitByGroupCount(names, targetVal, remainderMode);
                break;
            case 'by_size':
                groups = this.splitByGroupSize(names, targetVal);
                break;
            case 'unique_names':
                groups = this.splitUniqueNames(names);
                break;
            case 'same_names':
                groups = this.splitSameNames(names, targetVal);
                break;
        }

        this.renderResults(groups);
        this.playSuccessSFX();
        historyManager.addLog('Group Generator', `Split ${names.length} people into ${groups.length} groups (${mode})`);
    }

    // 1. ALGORITHM 1: BY GROUP COUNT
    splitByGroupCount(names, groupCount, remainderMode) {
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        const total = shuffled.length;
        const actualCount = Math.max(1, Math.min(groupCount, total));

        if (remainderMode === 'distribute') {
            const groups = Array.from({ length: actualCount }, () => []);
            shuffled.forEach((name, idx) => {
                groups[idx % actualCount].push(name);
            });
            return groups;
        } else {
            // 'extra' mode: create main groups with a base size, and place the remainder in a separate extra group
            const baseSize = Math.floor(total / actualCount);
            const groups = [];
            let currentIdx = 0;

            for (let i = 0; i < actualCount; i++) {
                groups.push(shuffled.slice(currentIdx, currentIdx + baseSize));
                currentIdx += baseSize;
            }

            // Put the remainder into a extra group N+1
            if (currentIdx < total) {
                groups.push(shuffled.slice(currentIdx));
            }

            return groups;
        }
    }

    // 2. ALGORITHM 2: BY GROUP SIZE
    splitByGroupSize(names, maxSize) {
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        const validSize = Math.max(1, maxSize);
        const groups = [];

        for (let i = 0; i < shuffled.length; i += validSize) {
            groups.push(shuffled.slice(i, i + validSize));
        }

        return groups;
    }

    // 3. ALGORITHM 3: UNIQUE NAMES (No duplicate names in the same group)
    splitUniqueNames(names) {
        // Frequency of each name
        const freqMap = {};
        names.forEach(name => {
            freqMap[name] = (freqMap[name] || 0) + 1;
        });

        // Number of groups required = highest frequency of any name
        const maxFreq = Math.max(...Object.values(freqMap));
        const groups = Array.from({ length: maxFreq }, () => []);

        // Group names by duplicates
        const buckets = {};
        names.forEach(name => {
            if (!buckets[name]) buckets[name] = [];
            buckets[name].push(name);
        });

        // For each name type, randomly assign to groups that do not already contain it
        Object.keys(buckets).forEach(nameKey => {
            const count = buckets[nameKey].length;
            // Randomly choose 'count' group positions from a total of 'maxFreq' groups
            const availableGroupIndices = Array.from({ length: maxFreq }, (_, i) => i)
                .sort(() => Math.random() - 0.5)
                .slice(0, count);

            availableGroupIndices.forEach(gIdx => {
                groups[gIdx].push(nameKey);
            });
        });

        return groups;
    }

    // 4. ALGORITHM 4: SAME NAMES (Duplicate names must stay in the same group)
    splitSameNames(names, targetGroupCount) {
        const buckets = {};
        names.forEach(name => {
            if (!buckets[name]) buckets[name] = [];
            buckets[name].push(name);
        });

        // Convert into block list: [ { name: 'A', items: ['A', 'A'] }, ... ]
        const blockList = Object.keys(buckets).map(k => ({
            name: k,
            items: buckets[k]
        }));

        // Sort blocks with largest size first (Greedy heuristic)
        blockList.sort((a, b) => b.items.length - a.items.length);

        const actualGroupCount = Math.max(1, Math.min(targetGroupCount, blockList.length));
        const groups = Array.from({ length: actualGroupCount }, () => []);

        // Distribute each block to the group with the lowest total members currently
        blockList.forEach(block => {
            let minGroup = groups[0];
            for (let g of groups) {
                if (g.length < minGroup.length) {
                    minGroup = g;
                }
            }
            minGroup.push(...block.items);
        });

        return groups;
    }

    renderResults(groups) {
        const container = this.container.querySelector('#group-results');
        const btnCopy = this.container.querySelector('#btn-copy-groups');
        if (!container) return;

        container.innerHTML = '';
        if (btnCopy) btnCopy.style.display = groups.length > 0 ? 'block' : 'none';

        groups.forEach((group, idx) => {
            const box = document.createElement('div');
            box.className = 'group-box';
            box.style.cssText = `
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px 16px;
            `;

            box.innerHTML = `
                <div class="group-title" style="font-weight: 600; color: #10b981; margin-bottom: 8px; font-size: 0.95em;">
                    Group ${idx + 1} (${group.length} members)
                </div>
                <div class="group-members" style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${group.map(m => `
                        <span class="group-member" style="
                            background: rgba(255,255,255,0.08); 
                            padding: 4px 10px; 
                            border-radius: 4px; 
                            font-size: 0.85em; 
                            color: #e2e8f0;
                        ">${m}</span>
                    `).join('')}
                </div>
            `;

            container.appendChild(box);
        });
    }

    playSuccessSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {
            console.warn(e);
        }
    }
}