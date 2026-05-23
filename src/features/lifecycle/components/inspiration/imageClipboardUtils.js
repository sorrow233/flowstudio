export const copyImageToClipboard = async (src, textContent = '') => {
    try {
        const response = await fetch(src);
        const blob = await response.blob();

        let pngBlob = blob;
        if (blob.type !== 'image/png') {
            pngBlob = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (canvasBlob) => canvasBlob
                            ? resolve(canvasBlob)
                            : reject(new Error('Canvas toBlob failed')),
                        'image/png'
                    );
                };
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = src;
            });
        }

        const items = { 'image/png': pngBlob };
        if (textContent) {
            items['text/plain'] = new Blob([textContent], { type: 'text/plain' });
        }

        await navigator.clipboard.write([new ClipboardItem(items)]);
        return true;
    } catch (err) {
        console.error('Failed to copy image via Clipboard API:', err);

        try {
            const div = document.createElement('div');
            div.contentEditable = 'true';
            div.style.position = 'fixed';
            div.style.left = '-9999px';
            div.style.top = '0';
            div.style.whiteSpace = 'pre-wrap';

            const img = document.createElement('img');
            img.src = src;
            div.appendChild(img);

            if (textContent) {
                div.appendChild(document.createElement('br'));
                div.appendChild(document.createTextNode(textContent));
            }

            document.body.appendChild(div);

            const range = document.createRange();
            range.selectNodeContents(div);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            const success = document.execCommand('copy');

            document.body.removeChild(div);
            selection?.removeAllRanges();

            if (success) return 'html-fallback';
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
        }

        if (textContent) {
            try {
                await navigator.clipboard.writeText(textContent);
                return 'text-only';
            } catch {
                return false;
            }
        }

        return false;
    }
};
