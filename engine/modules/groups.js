/* ==========================================================================
   MODULE: GROUP GENERATOR
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../utils/history_manager.js'; // Nếu có

export class GroupGeneratorModule {
    constructor() {
        this.names = [];
    }

    // Hàm xáo trộn danh sách (Fisher-Yates Shuffle)
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * CHẾ ĐỘ 1: Chia theo số lượng nhóm (hoặc số người/nhóm) + Xử lý chẵn/lẻ
     * @param {string[]} nameList - Danh sách tên
     * @param {number} targetCount - Số nhóm (hoặc số người/nhóm)
     * @param {'by_groups'|'by_size'} mode - Chia theo số nhóm hay quy mô nhóm
     * @param {'distribute'|'extra'} remainderMode - 'distribute': rải đều dư; 'extra': tạo nhóm phụ
     */
    generateStandardGroups(nameList, targetCount, mode = 'by_groups', remainderMode = 'distribute') {
        const shuffled = this.shuffle(nameList.filter(n => n.trim() !== ''));
        const total = shuffled.length;
        if (total === 0 || targetCount <= 0) return [];

        let numGroups = mode === 'by_groups' ? targetCount : Math.ceil(total / targetCount);
        numGroups = Math.min(numGroups, total); // Không thể chia nhiều nhóm hơn số người

        const groups = Array.from({ length: numGroups }, () => []);

        if (remainderMode === 'distribute') {
            // Rải đều từng người vào từng nhóm theo vòng tròn
            shuffled.forEach((name, idx) => {
                groups[idx % numGroups].push(name);
            });
        } else {
            // Chia đúng size cơ bản, phần thừa đẩy vào nhóm cuối
            const baseSize = Math.floor(total / numGroups);
            let currentIdx = 0;
            for (let i = 0; i < numGroups; i++) {
                const size = (i === numGroups - 1) ? (total - currentIdx) : baseSize;
                groups[i] = shuffled.slice(currentIdx, currentIdx + size);
                currentIdx += size;
            }
        }

        this.triggerSFX();
        return groups;
    }

    /**
     * CHẾ ĐỘ 2: Chia không trùng tên trong cùng 1 nhóm
     */
    generateUniqueGroups(nameList) {
        const cleaned = nameList.map(n => n.trim()).filter(n => n !== '');
        
        // Thống kê tần suất xuất hiện của từng tên
        const nameMap = {};
        cleaned.forEach(name => {
            nameMap[name] = (nameMap[name] || 0) + 1;
        });

        // Số nhóm tối thiểu bắt buộc phải bằng số lần xuất hiện nhiều nhất của 1 tên
        const maxFrequency = Math.max(...Object.values(nameMap));
        const groups = Array.from({ length: maxFrequency }, () => []);

        // Phân bổ từng nhóm tên trùng vào các nhóm khác nhau
        Object.keys(nameMap).forEach(name => {
            const count = nameMap[name];
            for (let i = 0; i < count; i++) {
                groups[i].push(name); // Mỗi nhóm i nhận 1 người tên này
            }
        });

        // Xáo trộn nội bộ từng nhóm cho ngẫu nhiên
        const finalGroups = groups.map(g => this.shuffle(g));

        this.triggerSFX();
        return finalGroups;
    }

    /**
     * CHẾ ĐỘ 3: Chia gom người trùng tên vào chung nhóm
     */
    generateSameNameGroups(nameList, targetGroupsCount) {
        const cleaned = nameList.map(n => n.trim()).filter(n => n !== '');
        
        // Gom nhóm theo tên
        const buckets = {};
        cleaned.forEach(name => {
            if (!buckets[name]) buckets[name] = [];
            buckets[name].push(name);
        });

        const groupBuckets = Object.values(buckets); // Mảng chứa các nhóm người cùng tên
        const numGroups = Math.min(targetGroupsCount, groupBuckets.length);
        const groups = Array.from({ length: numGroups }, () => []);

        // Phân bổ các bucket vào nhóm để tổng số người cân bằng nhất có thể
        groupBuckets.sort((a, b) => b.length - a.length); // Ưu tiên xếp cụm đông trước

        groupBuckets.forEach(bucket => {
            // Tìm nhóm đang có ít người nhất để thả bucket vào
            let minGroup = groups[0];
            for (let g of groups) {
                if (g.length < minGroup.length) minGroup = g;
            }
            minGroup.push(...bucket);
        });

        this.triggerSFX();
        return groups;
    }

    // Phát âm thanh xáo bài / chia nhóm
    triggerSFX() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        // Tạo tiếng Raspy/Shuffle nhẹ bằng Noise
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150 + Math.random() * 200, ctx.currentTime);

                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

                osc.connect(gain);
                gain.connect(output);

                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            }, i * 50);
        }
    }
}

export const groupGenerator = new GroupGeneratorModule();