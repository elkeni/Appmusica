/**
 * Parses an LRC string into an array of lyric objects.
 * Format: [{ time: number, text: string }]
 * @param {string} lrcString 
 * @returns {Array<{time: number, text: string}>}
 */
export function parseLRC(lrcString) {
    if (!lrcString) return [];

    const lines = lrcString.split('\n');
    const lyrics = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10);

            // Convert to total seconds
            // If milliseconds is 2 digits, it's centiseconds (x10). If 3, it's milliseconds.
            const time = minutes * 60 + seconds + (milliseconds / (match[3].length === 2 ? 100 : 1000));

            const text = line.replace(timeRegex, '').trim();

            if (text) {
                lyrics.push({ time, text });
            }
        }
    }

    return lyrics;
}
