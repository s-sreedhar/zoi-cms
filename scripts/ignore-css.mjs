
export async function load(url, context, nextLoad) {
    // console.log('Loading:', url); // Uncomment if needed for debugging
    if (url.includes('.css')) {
        return {
            format: 'module',
            shortCircuit: true,
            source: 'export default {}',
        };
    }
    return nextLoad(url, context);
}
