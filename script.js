document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const btnFetch = document.getElementById('btn-fetch');
    const btnExport = document.getElementById('btn-export');
    const urlMain = document.getElementById('url-main');
    const urlReply = document.getElementById('url-reply');
    const captureContainer = document.getElementById('capture-container');
    const frameEl = document.getElementById('frame-el');
    const inputPadding = document.getElementById('input-padding');
    const bgPresets = document.querySelectorAll('.bg-preset');
    const formatBtns = document.querySelectorAll('.format-btn');
    const watermarkEl = document.getElementById('watermark-logo');
    const logoSelector = document.getElementById('logo-selector');

    // Manual inputs mapping
    const mInputs = {
        name1: document.getElementById('m-name-1'),
        handle1: document.getElementById('m-handle-1'),
        text1: document.getElementById('m-text-1'),
        name2: document.getElementById('m-name-2'),
        handle2: document.getElementById('m-handle-2'),
        text2: document.getElementById('m-text-2'),
        img1: document.getElementById('m-img-1'),
        img2: document.getElementById('m-img-2'),
    };

    // Preview elements mapping
    const preview = {
        name1: document.getElementById('name-1'),
        handle1: document.getElementById('handle-1'),
        content1: document.getElementById('content-1'),
        avatar1: document.getElementById('avatar-1'),
        media1: document.getElementById('media-1'),
        name2: document.getElementById('name-2'),
        handle2: document.getElementById('handle-2'),
        content2: document.getElementById('content-2'),
        avatar2: document.getElementById('avatar-2'),
        media2: document.getElementById('media-2'),
    };

    let isFetching = false;

    // Background Selection
    bgPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            bgPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            const bgClass = preset.dataset.bg;
            captureContainer.classList.remove('gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'solid-dark');
            captureContainer.classList.add(bgClass);
        });
    });

    // Helper: Add logo to UI
    function addLogoItem(logo) {
        const div = document.createElement('div');
        div.className = 'logo-item';
        div.dataset.src = `/logos/${logo}`;
        div.innerHTML = `<img src="/logos/${logo}" alt="logo" crossorigin="anonymous">`;
        
        div.addEventListener('click', () => {
            document.querySelectorAll('.logo-item').forEach(l => l.classList.remove('active'));
            div.classList.add('active');
            watermarkEl.src = getProxiedUrl(`/logos/${logo}`);
            watermarkEl.classList.add('active');
            watermarkEl.style.display = 'block';
        });
        logoSelector.appendChild(div);
    }

    // Initialize Logos
    async function initLogos() {
        const logoList = ['digifoot_logo.png','digigoal_logo.png','digikits_logo.png','digilegends_logo.png','digiliink_logo.png'];
        try {
            const resp = await fetch('/api/list-logos');
            if (resp.ok) {
                const dynamicLogos = await resp.json();
                if (dynamicLogos.length > 0) {
                    logoSelector.innerHTML = '<div class="logo-item active" data-src="">None</div>';
                    dynamicLogos.forEach(addLogoItem);
                } else {
                    logoList.forEach(addLogoItem);
                }
            } else {
                logoList.forEach(addLogoItem);
            }
        } catch (e) {
            logoList.forEach(addLogoItem);
        }

        const noneItem = logoSelector.querySelector('.logo-item[data-src=""]');
        if (noneItem) {
            noneItem.addEventListener('click', () => {
                document.querySelectorAll('.logo-item').forEach(l => l.classList.remove('active'));
                noneItem.classList.add('active');
                watermarkEl.src = '';
                watermarkEl.classList.remove('active');
                watermarkEl.style.display = 'none';
            });
        }
    }
    initLogos();

    // Scaling Logic
    function updateLayout() {
        if (!frameEl || !captureContainer) return;
        const activeBtn = document.querySelector('.format-btn.active');
        const ratioData = activeBtn ? activeBtn.dataset.ratio : 'auto';
        
        const dims = {
            'auto': { w: 600, h: 'auto' },
            '1-1':  { w: 800, h: 800 },
            '4-5':  { w: 800, h: 1000 },
            '9-16': { w: 700, h: 1244 },
            '4-3':  { w: 1000, h: 750 }
        };

        const target = dims[ratioData] || dims['auto'];
        
        // 1. Set real size
        captureContainer.style.width = target.w + 'px';
        captureContainer.style.height = target.h === 'auto' ? 'auto' : (target.h + 'px');

        // 2. Visual Scale for Preview
        const previewArea = document.querySelector('.preview-area');
        if (previewArea) {
            const availW = previewArea.clientWidth - 40;
            const availH = previewArea.clientHeight - 40;
            let vScale = 1;

            if (target.w > availW) vScale = availW / target.w;
            const currentH = captureContainer.offsetHeight;
            if ((currentH * vScale) > availH) vScale = availH / currentH;

            captureContainer.style.transform = `scale(${vScale})`;
            captureContainer.style.transformOrigin = 'center center';
        }

        // 3. Frame scaling (internal)
        frameEl.style.transform = 'translate(-50%, -50%) scale(1)';
        frameEl.style.width = '850px'; 

        if (ratioData === 'auto') return;

        const margin = 80;
        const availableW = captureContainer.clientWidth - margin;
        const availableH = captureContainer.clientHeight - margin;
        
        let frameW = frameEl.offsetWidth;
        let frameH = frameEl.offsetHeight;
        let scaleW = availableW / frameW;
        let scaleH = availableH / frameH;
        
        if (scaleH < scaleW) {
            const optimalWidth = Math.min(availableW / scaleH, 1200); 
            frameEl.style.width = `${optimalWidth}px`;
            frameH = frameEl.offsetHeight;
            const finalScale = availableH / frameH;
            frameEl.style.transform = `translate(-50%, -50%) scale(${finalScale})`;
        } else {
            frameEl.style.transform = `translate(-50%, -50%) scale(${scaleW})`;
        }
    }

    // Format selection
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const ratio = btn.dataset.ratio;
            captureContainer.classList.remove('ratio-auto', 'ratio-1-1', 'ratio-4-5', 'ratio-9-16', 'ratio-4-3');
            captureContainer.classList.add(`ratio-${ratio}`);
            setTimeout(updateLayout, 100);
        });
    });

    const resizeObserver = new ResizeObserver(() => updateLayout());
    resizeObserver.observe(frameEl);

    inputPadding.addEventListener('input', (e) => {
        captureContainer.style.padding = `${e.target.value}px`;
    });

    const getProxiedUrl = (url) => {
        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url;
        if (!url.startsWith('http')) return url;
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    const syncManualToPreview = () => {
        preview.name1.textContent = mInputs.name1.value || 'Antigravity';
        preview.handle1.textContent = mInputs.handle1.value || '@antigravity_ai';
        preview.content1.innerHTML = mInputs.text1.value.replace(/\n/g, '<br>') || 'Texte...';
        
        const avatarUrl1 = mInputs.name1.dataset.avatar || `https://unavatar.io/twitter/${mInputs.handle1.value.replace('@','')}`;
        preview.avatar1.style.backgroundImage = `url('${getProxiedUrl(avatarUrl1)}')`;

        if (mInputs.img1.value) {
            preview.media1.innerHTML = `<img src="${getProxiedUrl(mInputs.img1.value)}" alt="media" crossorigin="anonymous">`;
            preview.media1.classList.add('active');
        } else {
            preview.media1.classList.remove('active');
        }

        preview.name2.textContent = mInputs.name2.value || 'User';
        preview.handle2.textContent = mInputs.handle2.value || '@reply';
        preview.content2.innerHTML = mInputs.text2.value.replace(/\n/g, '<br>') || 'Reponse...';
        
        const avatarUrl2 = mInputs.name2.dataset.avatar || `https://unavatar.io/twitter/${mInputs.handle2.value.replace('@','')}`;
        preview.avatar2.style.backgroundImage = `url('${getProxiedUrl(avatarUrl2)}')`;

        if (mInputs.img2.value) {
            preview.media2.innerHTML = `<img src="${getProxiedUrl(mInputs.img2.value)}" alt="media" crossorigin="anonymous">`;
            preview.media2.classList.add('active');
        } else {
            preview.media2.classList.remove('active');
        }

        setTimeout(updateLayout, 50);
    };

    [...Object.values(mInputs)].forEach(input => input.addEventListener('input', syncManualToPreview));

    // Fetch Logic
    btnFetch.addEventListener('click', async () => {
        if (isFetching) return;
        const urls = [urlMain.value, urlReply.value].filter(u => u.trim() !== '');
        if (urls.length === 0) return alert('Lien requis.');

        isFetching = true;
        btnFetch.innerHTML = 'Chargement...';
        try {
            if (urlMain.value) {
                const resp = await fetch(`/api/fetch-tweet?url=${encodeURIComponent(urlMain.value)}`);
                const data = await resp.json();
                if (data.success) {
                    mInputs.name1.value = data.author_name;
                    mInputs.handle1.value = '@' + data.author_handle;
                    mInputs.text1.value = data.content;
                    mInputs.name1.dataset.avatar = data.avatar_url;
                    if (data.media_url) mInputs.img1.value = data.media_url;
                }
            }
            if (urlReply.value) {
                const resp = await fetch(`/api/fetch-tweet?url=${encodeURIComponent(urlReply.value)}`);
                const data = await resp.json();
                if (data.success) {
                    mInputs.name2.value = data.author_name;
                    mInputs.handle2.value = '@' + data.author_handle;
                    mInputs.text2.value = data.content;
                    mInputs.name2.dataset.avatar = data.avatar_url;
                    if (data.media_url) mInputs.img2.value = data.media_url;
                }
            }
            syncManualToPreview();
        } catch (e) { console.error(e); }
        finally {
             isFetching = false;
             btnFetch.innerHTML = 'Récupérer les posts';
        }
    });

    // Export Logic
    btnExport.addEventListener('click', () => {
        btnExport.innerHTML = 'Exportation...';
        updateLayout();
        setTimeout(() => {
            htmlToImage.toPng(captureContainer, { quality:1, pixelRatio:2.5, cacheBust:true })
                .then(dataUrl => {
                    const link = document.createElement('a');
                    link.download = `x-post-${Date.now()}.png`;
                    link.href = dataUrl;
                    link.click();
                    btnExport.innerHTML = 'Exporter en Image';
                })
                .catch(err => {
                    console.error(err);
                    btnExport.innerHTML = 'Exporter en Image';
                });
        }, 500);
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(e => console.error(e));
    });
}
