/**
 * 跨平台触觉反馈系统 (Haptic System)
 * 
 * 方案 1: Android/通用 - 使用 navigator.vibrate
 * 方案 2: iOS 18+ Safari - 使用 <input type="checkbox" switch> 的开关特性触发系统 Taptic tick
 * 方案 3: iOS 通用备选 - 使用 AudioContext 瞬态脉冲 (Audio Pop) 产生机械敲击感
 */

let hapticElement = null;
let audioCtx = null;

/**
 * 初始化系统
 */
export const initHaptic = () => {
    if (typeof document === 'undefined' || hapticElement) return;

    // 1. 初始化 iOS 18 Switch Hack 元素
    hapticElement = document.createElement('input');
    hapticElement.type = 'checkbox';
    // @ts-ignore
    hapticElement.setAttribute('switch', '');
    hapticElement.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-1;';
    document.body.appendChild(hapticElement);

    // 2. 预热 AudioContext (iOS 需要用户交互后才能激活，但在主逻辑中处理)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }

    console.info('[Haptic] System initialized');
};

/**
 * 产生一个极短的“爆破音”脉冲，在 iOS 上感觉像是一次物理点击
 */
const playAudioPop = () => {
    if (!audioCtx) return;

    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // 方波在低频时能产生更好的“震动”感
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime); // 极小音量，主要利用脉冲感
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
        // 静默
    }
};

/**
 * 触发触觉反馈
 * @param {string} type - 'light' | 'medium' | 'heavy'
 */
export const triggerHaptic = (type = 'light') => {
    // 1. Android/通用
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const patterns = {
            light: 10,
            medium: 20,
            heavy: [20, 30, 20]
        };
        navigator.vibrate(patterns[type] || 10);
        return;
    }

    // 2. iOS Safari (iOS 18+ Switch Hack + Audio Pop 组合)
    if (typeof window !== 'undefined') {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            // A. 执行 Switch Click (iOS 18)
            if (hapticElement) {
                hapticElement.click();
            } else {
                initHaptic();
                hapticElement?.click();
            }

            // B. 执行 Audio Pop (所有 iOS 版本)
            // 用户反馈完全没感觉时，Audio Pop 是最有效的补充
            playAudioPop();
        }
    }
};

/**
 * 检测支持情况
 */
export const hasHapticSupport = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) return true;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// 尝试在加载时初始化
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
        initHaptic();
    } else {
        window.addEventListener('load', initHaptic);
    }
}

export default { triggerHaptic, hasHapticSupport, initHaptic };
