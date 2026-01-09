/**
 * iOS Safari 触觉反馈工具
 * 
 * iOS Safari 不支持 navigator.vibrate API
 * 但 iOS 18+ 支持通过 <input type="checkbox" switch> 的 label 点击触发触觉反馈
 * 
 * 参考: https://webkit.org/blog/15421/webkit-features-in-safari-18/
 */

let hapticElement = null;
let hapticLabel = null;

/**
 * 初始化 iOS 触觉反馈元素（隐藏）
 */
const initIOSHaptic = () => {
    if (hapticElement) return;

    // 创建隐藏的 switch checkbox
    hapticElement = document.createElement('input');
    hapticElement.type = 'checkbox';
    hapticElement.setAttribute('switch', ''); // iOS 18+ switch 属性
    hapticElement.id = 'ios-haptic-trigger';
    hapticElement.style.cssText = 'position:fixed;left:-9999px;opacity:0;pointer-events:none;';

    // 创建对应的 label
    hapticLabel = document.createElement('label');
    hapticLabel.htmlFor = 'ios-haptic-trigger';
    hapticLabel.style.cssText = 'position:fixed;left:-9999px;opacity:0;pointer-events:none;';

    document.body.appendChild(hapticElement);
    document.body.appendChild(hapticLabel);
};

/**
 * 触发触觉反馈
 * @param {string} type - 反馈类型: 'light' | 'medium' | 'heavy'
 */
export const triggerHaptic = (type = 'light') => {
    // 尝试 Android/通用震动 API
    if (navigator.vibrate) {
        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate([20, 30, 20]);
                break;
            default:
                navigator.vibrate(10);
        }
        return;
    }

    // iOS Safari workaround (iOS 18+)
    try {
        initIOSHaptic();
        if (hapticLabel) {
            hapticLabel.click();
        }
    } catch (e) {
        // 静默失败 - 设备不支持
    }
};

/**
 * 检测是否支持触觉反馈
 */
export const hasHapticSupport = () => {
    // Android/通用
    if (navigator.vibrate) return true;

    // iOS 检测 - Safari 且是移动设备
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    return isIOS && isSafari;
};

export default { triggerHaptic, hasHapticSupport };
