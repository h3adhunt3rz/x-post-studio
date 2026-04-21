document.addEventListener('DOMContentLoaded', () => {
    // Check for file protocol
    if (window.location.protocol === 'file:') {
        alert("ATTENTION : Vous avez ouvert le fichier index.html directement. \n\nPour que l'application fonctionne, vous devez : \n1. Lancer le serveur (python server.py)\n2. Aller sur http://localhost:5000 dans votre navigateur.");
    }

    const btnFetch = document.getElementById('btn-fetch');
    const btnExport = document.getElementById('btn-export');
    const urlMain = document.getElementById('url-main');
    const urlReply = document.getElementById('url-reply');
    const captureContainer = document.getElementById('capture-container');
    const frameEl = document.getElementById('frame-el');
    const inputPadding = document.getElementById('input-padding');
    const bgPresets = document.querySelectorAll('.bg-preset');
    const formatBtns = document.querySelectorAll('.format-btn');

    // Manual inputs
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

    // Preview elements
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

    // State
    let isFetching = false;

    // Background Selection
    bgPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            bgPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            
            const bgClass = preset.dataset.bg;
            // Remove old gradient classes but keep others
            captureContainer.classList.remove('gradient-1', 'gradient-2', 'gradient-3', 'gradient-4', 'solid-dark');
            captureContainer.classList.add(bgClass);
        });
    });

    const watermarkEl = document.getElementById('watermark-logo');
    const logoSelector = document.getElementById('logo-selector');

    // Dynamic Logo Loading
    async function initLogos() {
        const logoList = [
            'digifoot_logo.png',
            'digigoal_logo.png',
            'digikits_logo.png',
            'digilegends_logo.png',
            'digiliink_logo.png'
        ];

        const logoSelector = document.getElementById('logo-selector');
        
        // Helper to add a logo to the UI
        const addLogoItem = (logo) => {
            const div = document.createElement('div');
            div.className = 'logo-item';
            div.dataset.src = `./logos/${logo}`;
            div.innerHTML = `<img src="./logos/${logo}" alt="logo" crossorigin="anonymous">`;
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.logo-item').forEach(l => l.classList.remove('active'));
                div.classList.add('active');
                watermarkEl.src = getProxiedUrl(`./logos/${logo}`);
                watermarkEl.classList.add('active');
                watermarkEl.style.display = 'block';
            });
            
            logoSelector.appendChild(div);
        };

        try {
            // Try to get dynamic list from server
            const resp = await fetch('/api/list-logos');
            if (resp.ok) {
                const dynamicLogos = await resp.json();
                if (dynamicLogos.length > 0) {
                    // Clear and use server list if available
                    logoSelector.innerHTML = '<div class="logo-item active" data-src="">None</div>';
                    dynamicLogos.forEach(addLogoItem);
                } else {
                    logoList.forEach(addLogoItem);
                }
            } else {
                logoList.forEach(addLogoItem);
            }
        } catch (e) {
            // Fallback to hardcoded list if server is down
            logoList.forEach(addLogoItem);
        }

        // Handle "None" item
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

    // Format selection
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const ratio = btn.dataset.ratio;
            // Remove old ratio classes
            captureContainer.classList.remove('ratio-auto', 'ratio-1-1', 'ratio-4-5', 'ratio-9-16', 'ratio-4-3');
            captureContainer.classList.add(`ratio-${ratio}`);
            
            // Re-calculate layout after animation
            setTimeout(updateLayout, 450);
        });
    });

    // Advanced Responsive Scaling Engine
    function updateLayout() {
        if (!frameEl) return;
        const ratioData = document.querySelector('.format-btn.active').dataset.ratio;
        
        // Target dimensions map
        const dims = {
            'auto': { w: 600, h: 'auto' },
            '1-1':  { w: 800, h: 800 },
            '4-5':  { w: 800, h: 1000 },
            '9-16': { w: 700, h: 1244 },
            '4-3':  { w: 1000, h: 750 }
        };

        const target = dims[ratioData] || dims['auto'];
        
        // Apply dimensions directly to container
        captureContainer.style.width = target.w + 'px';
        captureContainer.style.height = target.h === 'auto' ? 'auto' : (target.h + 'px');

        // Reset frame transform for measurement
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

    // Auto-update when content size changes (images loading, etc)
    const resizeObserver = new ResizeObserver(() => {
        updateLayout();
    });
    resizeObserver.observe(frameEl);

    // Padding Control
    inputPadding.addEventListener('input', (e) => {
        captureContainer.style.padding = `${e.target.value}px`;
    });

    const getProxiedUrl = (url) => {
        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url;
        if (!url.startsWith('http')) return url;
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    // Live sync manual inputs -> preview
    const syncManualToPreview = () => {
        // Post 1
        preview.name1.textContent = mInputs.name1.value || 'Antigravity';
        const h1 = mInputs.handle1.value || '@antigravity_ai';
        preview.handle1.textContent = h1;
        preview.content1.innerHTML = mInputs.text1.value.replace(/\n/g, '<br>') || 'Votre post ici...';
        
        const cleanH1 = h1.replace('@', '');
        // Use manual avatar URL if provided in data or fallback to unavatar
        const avatarUrl1 = mInputs.name1.dataset.avatar || `https://unavatar.io/twitter/${cleanH1}`;
        preview.avatar1.style.backgroundImage = `url('${getProxiedUrl(avatarUrl1)}')`;

        if (mInputs.img1.value) {
            const proxiedUrl = getProxiedUrl(mInputs.img1.value);
            preview.media1.innerHTML = `<img src="${proxiedUrl}" alt="media" crossorigin="anonymous">`;
            preview.media1.classList.add('active');
        } else {
            preview.media1.classList.remove('active');
            preview.media1.innerHTML = '';
        }

        // Post 2
        preview.name2.textContent = mInputs.name2.value || 'User Reply';
        const h2 = mInputs.handle2.value || '@reply_user';
        preview.handle2.textContent = h2;
        preview.content2.innerHTML = mInputs.text2.value.replace(/\n/g, '<br>') || 'Votre réponse ici...';
        
        const cleanH2 = h2.replace('@', '');
        const avatarUrl2 = mInputs.name2.dataset.avatar || `https://unavatar.io/twitter/${cleanH2}`;
        preview.avatar2.style.backgroundImage = `url('${getProxiedUrl(avatarUrl2)}')`;

        if (mInputs.img2.value) {
            const proxiedUrl = getProxiedUrl(mInputs.img2.value);
            preview.media2.innerHTML = `<img src="${proxiedUrl}" alt="media" crossorigin="anonymous">`;
            preview.media2.classList.add('active');
        } else {
            preview.media2.classList.remove('active');
            preview.media2.innerHTML = '';
        }

        // Apply scale after content update
        setTimeout(updateLayout, 50);
    };

    [...Object.values(mInputs)].forEach(input => {
        input.addEventListener('input', syncManualToPreview);
    });

    // Drag & Drop for images
    const setupDragAndDrop = (inputId, postIndex) => {
        const input = document.getElementById(inputId);
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            input.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        input.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    input.value = e.target.result; // Base64
                    syncManualToPreview();
                };
                reader.readAsDataURL(file);
            }
        }, false);
    };

    setupDragAndDrop('m-img-1', 1);
    setupDragAndDrop('m-img-2', 2);

    // Fetch Logic
    btnFetch.addEventListener('click', async () => {
        if (isFetching) return;
        
        const urls = [urlMain.value, urlReply.value].filter(u => u.trim() !== '');
        if (urls.length === 0) {
            alert('Veuillez entrer au moins un lien X.');
            return;
        }

        isFetching = true;
        btnFetch.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Récupération...';
        lucide.createIcons();

        try {
            // Fetch Main
            if (urlMain.value) {
                const data = await fetchTweet(urlMain.value);
                if (data.success) {
                    updateInputs(1, data);
                } else {
                    alert('Erreur Post 1 : ' + (data.message || 'Impossible de récupérer le post.'));
                }
            }
            // Fetch Reply
            if (urlReply.value) {
                const data = await fetchTweet(urlReply.value);
                if (data.success) {
                    updateInputs(2, data);
                } else {
                    alert('Erreur Post 2 : ' + (data.message || 'Impossible de récupérer le post.'));
                }
            }
            syncManualToPreview();
        } catch (err) {
            console.error(err);
        } finally {
            isFetching = false;
            btnFetch.innerHTML = '<i data-lucide="download"></i> Récupérer les posts';
            lucide.createIcons();
        }
    });

    async function fetchTweet(url) {
        try {
            // Add a timestamp to bypass local caching
            const res = await fetch(`/api/fetch-tweet?url=${encodeURIComponent(url)}&t=${Date.now()}`);
            return await res.json();
        } catch (e) {
            return { success: false };
        }
    }

    function updateInputs(index, data) {
        mInputs[`name${index}`].value = data.author_name;
        mInputs[`handle${index}`].value = '@' + data.author_handle;
        mInputs[`text${index}`].value = data.content;
        
        // Store avatar URL in dataset to use in sync
        mInputs[`name${index}`].dataset.avatar = data.avatar_url;
        
        // Handle media
        if (data.media_url) {
            mInputs[`img${index}`].value = data.media_url;
        }
    }

    // Export Logic
    btnExport.addEventListener('click', () => {
        const btn = btnExport;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Exportation...';
        lucide.createIcons();

        // Ensure layout is up to date
        updateLayout();

        const options = {
            quality: 1,
            pixelRatio: 2.5, // 2.5 is safer/lighter for high resolution capture
            cacheBust: true,
            // Skip problematic style rules that cause SecurityError
            filter: (node) => {
                const exclusionClasses = ['lucide', 'spin'];
                if (node.classList) {
                    return !exclusionClasses.some(cls => node.classList.contains(cls));
                }
                return true;
            }
        };

        // Delay to allow any pending DOM updates
        setTimeout(() => {
            htmlToImage.toPng(captureContainer, options)
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `x-post-studio-${Date.now()}.png`;
                    link.href = dataUrl;
                    link.click();
                    
                    btn.innerHTML = originalText;
                    lucide.createIcons();
                })
                .catch((error) => {
                    console.error('Export failed', error);
                    alert("L'exportation a rencontré un problème. Essayez un format plus simple.");
                    btn.innerHTML = originalText;
                    lucide.createIcons();
                });
    });
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker enregistré !'))
            .catch(err => console.log('Erreur SW:', err));
    });
}
