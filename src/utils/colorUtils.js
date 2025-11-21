export const hexFromRgb = (r, g, b) => {
    const toHex = (v) => {
        const s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
        return s.length === 1 ? '0' + s : s;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const darkenHex = (hex, amount = 0.25) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const rr = Math.max(0, Math.min(255, Math.round(r * (1 - amount))));
    const gg = Math.max(0, Math.min(255, Math.round(g * (1 - amount))));
    const bb = Math.max(0, Math.min(255, Math.round(b * (1 - amount))));
    return hexFromRgb(rr, gg, bb);
};

export const extractPaletteFromImage = (url, size = 40) => new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            const counts = {};
            for (let i = 0; i < data.length; i += 8) { // sample every 2nd pixel
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const qr = (r >> 4) & 0xF;
                const qg = (g >> 4) & 0xF;
                const qb = (b >> 4) & 0xF;
                const key = (qr << 8) | (qg << 4) | qb;
                counts[key] = (counts[key] || 0) + 1;
            }
            const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            if (entries.length === 0) return resolve(null);
            const primaryKey = parseInt(entries[0][0], 10);
            const secondaryKey = entries[1] ? parseInt(entries[1][0], 10) : primaryKey;
            const decode = (k) => {
                const qr = (k >> 8) & 0xF;
                const qg = (k >> 4) & 0xF;
                const qb = k & 0xF;
                return {
                    r: Math.round((qr * 17)),
                    g: Math.round((qg * 17)),
                    b: Math.round((qb * 17))
                };
            };
            const p = decode(primaryKey);
            const s = decode(secondaryKey);
            const primary = hexFromRgb(p.r, p.g, p.b);
            const secondary = hexFromRgb(s.r, s.g, s.b);
            resolve({ primary, secondary });
        } catch (err) {
            resolve(null);
        }
    };
    img.onerror = () => resolve(null);
});
