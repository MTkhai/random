/* ==========================================================================
   MODULE: GROUP GENERATOR
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class GroupsModule {
    constructor() {
        this.container = null;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Group Generator</h2>
                <p class="module-desc">Phân chia danh sách thành các nhóm ngẫu nhiên theo nhiều tùy chọn linh hoạt.</p>
                
                <div class="groups-workspace" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <!-- LEFT PANEL: INPUT & SETTINGS -->
                    <div class="groups-panel">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted, #aaa);">
                                Danh sách tên (Mỗi tên 1 dòng):
                            </label>
                            <textarea id="group-names-input" class="form-input" rows="8" placeholder="Nguyễn Văn A&#10;Nguyễn Khắc An Duy&#10;Mai Nguyệt Anh..." style="width: 100%; resize: vertical;"></textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted, #aaa);">Chế độ chia:</label>
                            <select id="group-mode" class="form-input" style="width: 100%;">
                                <option value="by_groups">Chia theo SỐ LƯỢNG NHÓM</option>
                                <option value="by_size">Chia theo SỐ NGƯỜI / NHÓM</option>
                                <option value="unique_names">Chia KHÔNG TRÙNG TÊN trong nhóm</option>
                                <option value="same_names">GOM TÊN GIỐNG NHAU vào chung nhóm</option>
                            </select>
                        </div>

                        <div class="form-group" id="group-count-group" style="margin-bottom: 15px;">
                            <label id="group-count-label" style="display: block; margin-bottom: 5px; color: var(--text-muted, #aaa);">Số lượng nhóm:</label>
                            <input type="number" id="group-count-val" class="form-input" value="2" min="1" max="100" style="width: 100%;">
                        </div>

                        <div class="form-group" id="remainder-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted, #aaa);">Xử lý số dư (nếu lẻ):</label>
                            <select id="group-remainder" class="form-input" style="width: 100%;">
                                <option value="distribute">Rải đều người thừa vào các nhóm đầu</option>
                                <option value="extra">Tạo thêm 1 nhóm phụ cho phần dư</option>
                            </select>
                        </div>

                        <button id="btn-gen-groups" class="btn-primary" style="width: 100%;">👥 Chia Nhóm Ngẫu Nhiên</button>
                    </div>

                    <!-- RIGHT PANEL: RESULTS -->
                    <div class="groups-results-panel">
                        <h3 style="margin-top: 0; color: var(--text-main, #fff);">Kết quả chia nhóm</h3>
                        <div id="groups-output-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; max-height: 480px; overflow-y: auto;">
                            <div style="color: var(--text-muted, #aaa); font-style: italic;">Chưa có dữ liệu. Hãy nhập danh sách và bấm "Chia Nhóm".</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const btnGen = this.container.querySelector('#btn-gen-groups');
        const modeSelect = this.container.querySelector('#group-mode');
        const countGroup = this.container.querySelector('#group-count-group');
        const countLabel = this.container.querySelector('#group-count-label');
        const remainderGroup = this.container.querySelector('#remainder-group');

        modeSelect?.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === 'by_groups') {
                countGroup.style.display = 'block';
                remainderGroup.style.display = 'block';
                countLabel.textContent = 'Số lượng nhóm:';
            } else if (mode === 'by_size') {
                countGroup.style.display = 'block';
                remainderGroup.style.display = 'block';
                countLabel.textContent = 'Số người tối đa 1 nhóm:';
            } else if (mode === 'unique_names') {
                countGroup.style.display = 'none';
                remainderGroup.style.display = 'none';
            } else if (mode === 'same_names') {
                countGroup.style.display = 'block';
                remainderGroup.style.display = 'none';
                countLabel.textContent = 'Số lượng nhóm mong muốn:';
            }
        });

        btnGen?.addEventListener('click', () => this.generateGroups());
    }

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    generateGroups() {
        const text = this.container.querySelector('#group-names-input').value;
        const names = text.split('\n').map(n => n.trim()).filter(n => n !== '');

        if (names.length === 0) {
            alert('Vui lòng nhập ít nhất 1 tên!');
            return;
        }

        const mode = this.container.querySelector('#group-mode').value;
        const targetVal = parseInt(this.container.querySelector('#group-count-val').value) || 2;
        const remainderMode = this.container.querySelector('#group-remainder').value;

        let resultGroups = [];

        if (mode === 'by_groups' || mode === 'by_size') {
            resultGroups = this.splitStandard(names, targetVal, mode, remainderMode);
        } else if (mode === 'unique_names') {
            resultGroups = this.splitUnique(names);
        } else if (mode === 'same_names') {
            resultGroups = this.splitSameNames(names, targetVal);
        }

        this.renderResults(resultGroups);
        this.playSFX();

        const logMsg = `${names.length} người -> ${resultGroups.length} nhóm`;
        historyManager.addLog('Group Generator', logMsg);
    }

    splitStandard(names, targetVal, mode, remainderMode) {
        const shuffled = this.shuffle(names);
        const total = shuffled.length;
        let numGroups = mode === 'by_groups' ? targetVal : Math.ceil(total / targetVal);
        numGroups = Math.max(1, Math.min(numGroups, total));

        const groups = Array.from({ length: numGroups }, () => []);

        if (remainderMode === 'distribute') {
            shuffled.forEach((name, idx) => {
                groups[idx % numGroups].push(name);
            });
        } else {
            const baseSize = Math.floor(total / numGroups);
            let currentIdx = 0;
            for (let i = 0; i < numGroups; i++) {
                const size = (i === numGroups - 1) ? (total - currentIdx) : baseSize;
                groups[i] = shuffled.slice(currentIdx, currentIdx + size);
                currentIdx += size;
            }
        }
        return groups;
    }

    splitUnique(names) {
        const nameMap = {};
        names.forEach(n => nameMap[n] = (nameMap[n] || 0) + 1);

        const maxFreq = Math.max(...Object.values(nameMap));
        const groups = Array.from({ length: maxFreq }, () => []);

        Object.keys(nameMap).forEach(name => {
            const count = nameMap[name];
            for (let i = 0; i < count; i++) {
                groups[i].push(name);
            }
        });

        return groups.map(g => this.shuffle(g));
    }

    splitSameNames(names, targetGroupsCount) {
        const buckets = {};
        names.forEach(n => {
            if (!buckets[n]) buckets[n] = [];
            buckets[n].push(n);
        });

        const groupBuckets = Object.values(buckets);
        const numGroups = Math.max(1, Math.min(targetGroupsCount, groupBuckets.length));
        const groups = Array.from({ length: numGroups }, () => []);

        groupBuckets.sort((a, b) => b.length - a.length);

        groupBuckets.forEach(bucket => {
            let minG = groups[0];
            for (let g of groups) {
                if (g.length < minG.length) minG = g;
            }
            minG.push(...bucket);
        });

        return groups;
    }

    renderResults(groups) {
        const grid = this.container.querySelector('#groups-output-grid');
        grid.innerHTML = '';

        groups.forEach((group, idx) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
            `;

            const membersList = group.map(m => `<li style="margin-bottom: 4px; color: var(--text-main, #eee);">${m}</li>`).join('');

            card.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; color: #10b981; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                    Nhóm ${idx + 1} (${group.length})
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 0.9em;">
                    ${membersList}
                </ul>
            `;
            grid.appendChild(card);
        });
    }

    playSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();

            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(200 + i * 80, ctx.currentTime);

                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

                    osc.connect(gain);
                    gain.connect(output);

                    osc.start();
                    osc.stop(ctx.currentTime + 0.06);
                }, i * 40);
            }
        } catch (e) {
            console.warn('SFX Error:', e);
        }
    }
}