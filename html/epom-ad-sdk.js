(function () {
    // Configuration
    const API_URL = 'https://aj2715.bid/ads-api-native?key=2935b1bb8ddce9461ebb05f9814f8cad&native_bs=1';
    const COOKIE = 'UUID=7d8dd50f-df14-5bb7-a076-427644cd424b; ubvc=MTl8M3xCRHx8fHx8Z3Y5emR1NDZmdjR5fDdkOGRkNTBmLWRmMTQtNWJiNy1hMDc2LTQyNzY0NGNkNDI0Ynx8fDE-1748414965191--';
    const LIB_VERSION = '2.2.8';

    // Utility to make API call
    async function fetchAdData() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Cookie': COOKIE
                }
            });
            if (!response.ok) throw new Error('API request failed');
            return await response.json();
        } catch (error) {
            console.error('[KahfAds] Failed to fetch ad:', error);
            return null;
        }
    }

    // Fire impression beacons
    function trackImpressions(beacons) {
        if (!beacons || !Array.isArray(beacons)) return;
        beacons.forEach(beacon => {
            if (beacon.type === 'impression' && beacon.url) {
                fetch(beacon.url, { method: 'GET', mode: 'no-cors' })
                    .catch(error => console.error('[KahfAds] Beacon failed:', error));
            }
        });
    }

    // Render ad HTML
    function renderAd(insElement, adData) {
        if (!adData || adData.type !== 'native') {
            insElement.innerHTML = '<div style="color:red;">Ad failed to load</div>';
            return;
        }

        const icon = adData.icons && adData.icons[0] ? adData.icons[0] : null;
        const image = adData.images && adData.images[0] ? adData.images[0] : null;
        const clickUrl = adData.clickUrl || '#';
        const title = adData.title || '';
        const description = adData.description || '';
        const ctaText = adData.ctaText || 'Learn More';

        // Generate HTML
        const adHtml = `
            <div style="font-family:Arial,sans-serif;padding:10px;border:1px solid #ddd;border-radius:8px;background:#fff;">
                <div style="display:flex;align-items:center;margin-bottom:10px;">
                    ${icon ? `<img src="${icon.url}" style="width:48px;height:48px;margin-right:10px;border-radius:4px;" alt="Icon">` : ''}
                    <div style="font-size:16px;font-weight:bold;color:#333;">${title}</div>
                </div>
                ${image ? `<a href="${clickUrl}" target="_blank"><img src="${image.url}" style="width:100%;height:auto;border-radius:4px;margin-bottom:10px;" alt="Ad"></a>` : ''}
                <div style="font-size:14px;color:#666;margin-bottom:10px;">${description}</div>
                <a href="${clickUrl}" target="_blank" style="display:inline-block;padding:8px 16px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;">${ctaText}</a>
            </div>
        `;

        insElement.innerHTML = adHtml;
        insElement.style.display = 'block';

        // Track impressions
        trackImpressions(adData.beacons);
    }

    // Initialize ads
    function initAds() {
        const insElements = document.querySelectorAll('ins.kahf-ad');
        if (!insElements.length) {
            console.warn('[KahfAds] No <ins> elements with class "kahf-ad" found');
            return;
        }

        insElements.forEach(async (insElement) => {
            const key = insElement.getAttribute('data-key');
            if (!key) {
                insElement.innerHTML = '<div style="color:red;">Missing data-key</div>';
                return;
            }

            const adData = await fetchAdData();
            renderAd(insElement, adData);
        });
    }

    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAds);
    } else {
        initAds();
    }

    // Expose public API (optional)
    window.KahfAds = {
        version: LIB_VERSION,
        loadAd: async function (elementId) {
            const insElement = document.getElementById(elementId);
            if (!insElement || !insElement.classList.contains('kahf-ad')) {
                console.error('[KahfAds] Invalid element for loadAd');
                return;
            }
            const adData = await fetchAdData();
            renderAd(insElement, adData);
        }
    };
})();