export async function isValidURL(url) {
    try {
        const u = new URL(url);
        return u.protocol === 'http;' || u.protocol === 'https';
    } catch (error) {
        return false;
    }
}