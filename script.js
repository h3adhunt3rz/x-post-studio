document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        btnFetch: document.getElementById('btn-fetch'),
        btnExport: document.getElementById('btn-export'),
        urlMain: document.getElementById('url-main'),
        urlReply: document.getElementById('url-reply'),
        captureContainer: document.getElementById('capture-container'),
        bgOverlay: document.getElementById('bg-overlay'),
        mainCard: document.getElementById('main-card'),
        inputBgColor: document.getElementById('input-bg-color'),
        inputBgOpacity: document.getElementById('input-bg-opacity'),
        inputBgShadow: document.getElementById('input-bg-shadow'),
        inputTextZoom1: document.getElementById('input-text-zoom-1'),
        inputTextZoom2: document.getElementById('input-text-zoom-2'),
        inputAvatarZoom: document.getElementById('input-avatar-zoom'),
        inputMediaZoom1: document.getElementById('input-media-zoom-1'),
        inputMediaZoom2: document.getElementById('input-media-zoom-2'),
        inputLineHeight: document.getElementById('input-line-height'),
        inputSplitPos: document.getElementById('input-split-pos'),
        horizontalDivider: document.getElementById('horizontal-divider'),
        inputLogoTrademarkZoom: document.getElementById('input-logo-trademark-zoom'),
        inputLogoTrademarkOpacity: document.getElementById('input-logo-trademark-opacity'),
        inputCustomLogo: document.getElementById('input-custom-logo'),
        checkTrademark: document.getElementById('check-logo-trademark'),
        inputMediaBlur: document.getElementById('input-media-blur'),
        btnMediaMirror: document.getElementById('btn-media-mirror'),
        checkMediaGrayscale: document.getElementById('check-media-grayscale'),
        watermarkTrademark: document.getElementById('watermark-trademark'),
        replyContainer: document.getElementById('reply-container'),
        btnProjectFoot: document.getElementById('btn-project-foot'),
        btnProjectPolitics: document.getElementById('btn-project-politics'),
        selectPoliticsBg: document.getElementById('select-politics-bg'),
        politicsBgSelector: document.getElementById('politics-bg-selector'),
        politicsBgImage: document.getElementById('politics-bg-image'),
        inputCardY: document.getElementById('input-card-y'),
        footTitleDisplay: document.getElementById('foot-title-display'),
        footCornerLogo: document.getElementById('foot-corner-logo'),
        politicsCornerLogo: document.querySelector('.politics-corner-logo'),
        inputFootBranding: document.getElementById('input-foot-branding'),
        // Nouveaux éléments Mode Solo
        btnModePosts: document.getElementById('btn-mode-posts'),
        btnModeImage: document.getElementById('btn-mode-image'),
        groupXSources: document.getElementById('group-x-sources'),
        groupImageSolo: document.getElementById('group-image-solo'),
        inputSoloImage: document.getElementById('input-solo-image'),
        inputSoloZoom: document.getElementById('input-solo-zoom'),
        inputSoloRadius: document.getElementById('input-solo-radius'),
        inputSoloY: document.getElementById('input-solo-y'),
        soloImageContainer: document.getElementById('solo-image-container'),
        soloImagePreview: document.getElementById('solo-image-preview'),
        mainProjectOverlay: document.getElementById('main-project-overlay')
    };

    const mInputs = {
        name1: document.getElementById('m-name-1'), handle1: document.getElementById('m-handle-1'), text1: document.getElementById('m-text-1'), img1: document.getElementById('m-img-1'),
        name2: document.getElementById('m-name-2'), handle2: document.getElementById('m-handle-2'), text2: document.getElementById('m-text-2'), img2: document.getElementById('m-img-2')
    };

    const preview = {
        name1: document.getElementById('name-1'), handle1: document.getElementById('handle-1'), content1: document.getElementById('content-1'), avatar1: document.getElementById('avatar-1'), 
        media1: document.getElementById('tweet-media-1'), watermark1: document.getElementById('media-watermark-1'),
        name2: document.getElementById('name-2'), handle2: document.getElementById('handle-2'), content2: document.getElementById('content-2'), avatar2: document.getElementById('avatar-2'),
        media2: document.getElementById('tweet-media-2'), watermark2: document.getElementById('media-watermark-2')
    };
    
    let currentProject = 'foot';
    let currentMode = 'posts'; // 'posts' ou 'image'
    let selectedLogoSrc = ""; 
    
    const updateActiveLogo = () => {
        // Le logo reste persistant
        refreshUI();
    };

    function hexToRgba(hex, opacity) {
        let r=0, g=0, b=0;
        if (hex.length == 4) { r = parseInt(hex[1]+hex[1], 16); g = parseInt(hex[2]+hex[2], 16); b = parseInt(hex[3]+hex[3], 16); }
        else { r = parseInt(hex.substring(1,3), 16); g = parseInt(hex.substring(3,5), 16); b = parseInt(hex.substring(5,7), 16); }
        return `rgba(${r},${g},${b},${opacity})`;
    }

    function darkenColor(hex, percent) {
        let r = parseInt(hex.substring(1,3), 16);
        let g = parseInt(hex.substring(3,5), 16);
        let b = parseInt(hex.substring(5,7), 16);
        r = Math.floor(r * (1 - percent / 100));
        g = Math.floor(g * (1 - percent / 100));
        b = Math.floor(b * (1 - percent / 100));
        return `rgb(${r},${g},${b})`;
    }

    function getContrastColor(hex) {
        const r = parseInt(hex.substring(1,3), 16);
        const g = parseInt(hex.substring(3,5), 16);
        const b = parseInt(hex.substring(5,7), 16);
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    const getProxiedUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('data:')) return url;
        // All external assets go through the local proxy
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    const refreshUI = () => {
        if(ui.captureContainer) {
            const bgOpac = ui.inputBgOpacity.value / 100;
            const bgColor = ui.inputBgColor.value;
            const textColor = getContrastColor(bgColor);
            ui.captureContainer.style.backgroundColor = hexToRgba(bgColor, bgOpac);
            ui.captureContainer.style.color = textColor;

            // Gestion de l'illustration de fond pour la politique (via IMG pour l'export)
            if (currentProject === 'politics' && ui.selectPoliticsBg.value && ui.politicsBgImage) {
                ui.politicsBgImage.src = ui.selectPoliticsBg.value;
                ui.captureContainer.style.backgroundImage = 'none';
            } else if (ui.politicsBgImage) {
                ui.politicsBgImage.src = "";
                ui.captureContainer.style.backgroundImage = 'none';
            }

            // Sync de l'overlay Football
            if (currentProject === 'foot') {
                if (ui.footTitleDisplay) {
                    let sig = ui.inputFootBranding.value.trim();
                    if (sig && !sig.startsWith('©')) sig = '© ' + sig;
                    ui.footTitleDisplay.innerText = sig || "© Mr DigiFoot";
                }
                if (ui.footCornerLogo) {
                    ui.footCornerLogo.src = selectedLogoSrc || '';
                    ui.footCornerLogo.style.display = (ui.checkTrademark.checked && selectedLogoSrc) ? 'block' : 'none';
                    
                    const zoom = ui.inputLogoTrademarkZoom.value;
                    const opacity = ui.inputLogoTrademarkOpacity.value / 100;
                    ui.footCornerLogo.style.width = `${zoom}px`;
                    ui.footCornerLogo.style.height = `${zoom}px`;
                    ui.footCornerLogo.style.opacity = opacity;
                }
                if (ui.watermarkTrademark) ui.watermarkTrademark.style.opacity = 0;
            } else if (currentProject === 'politics') {
                if (ui.politicsCornerLogo) {
                    const zoom = ui.inputLogoTrademarkZoom.value;
                    const opacity = ui.inputLogoTrademarkOpacity.value / 100;
                    ui.politicsCornerLogo.style.width = `${zoom}px`;
                    ui.politicsCornerLogo.style.height = `${zoom}px`;
                    ui.politicsCornerLogo.style.opacity = opacity;
                }
                if (ui.watermarkTrademark) ui.watermarkTrademark.style.opacity = 0;
            } else {
                if (ui.watermarkTrademark) {
                    ui.watermarkTrademark.style.opacity = ui.inputLogoTrademarkOpacity.value / 100;
                    ui.watermarkTrademark.style.width = `${ui.inputLogoTrademarkZoom.value}px`;
                }
            }

            // Gestion du mode Image Solo
            if (currentMode === 'image') {
                if (ui.soloImagePreview) {
                    const zoom = ui.inputSoloZoom.value / 100;
                    const radius = ui.inputSoloRadius.value;
                    const posY = ui.inputSoloY.value;
                    ui.soloImagePreview.style.transform = `scale(${zoom}) translateY(${posY}px)`;
                    ui.soloImagePreview.style.borderRadius = `${radius}px`;
                }
            }
        }
        if(ui.bgOverlay) {
            const sh = ui.inputBgShadow.value / 100;
            ui.bgOverlay.style.background = `radial-gradient(circle, transparent 30%, rgba(0,0,0,${sh}) 100%)`;
        }
        const lineH = ui.inputLineHeight.value / 100;
        const splitPos = ui.inputSplitPos.value;

        if(preview.content1) { preview.content1.style.fontSize = `${ui.inputTextZoom1.value}px`; preview.content1.style.lineHeight = `${lineH}`; }
        if(preview.content2) { preview.content2.style.fontSize = `${ui.inputTextZoom2.value}px`; preview.content2.style.lineHeight = `${lineH}`; }

        const avSize = ui.inputAvatarZoom.value;
        [preview.avatar1, preview.avatar2].forEach(a => { if(a) { a.style.width = `${avSize}px`; a.style.height = `${avSize}px`; } });
        
        if(ui.mainCard) {
            const hasReply = ui.replyContainer.style.display !== 'none';
            ui.mainCard.style.gridTemplateRows = hasReply ? `${splitPos}% auto 1fr` : `1fr 0 0`;
            
            // On applique la position verticale
            ui.mainCard.style.marginTop = `${ui.inputCardY.value}px`;
        }
        if (ui.horizontalDivider) {
            // Let the CSS themes handle the separator styling via classes
            // We just ensure it has a base visibility here if needed, 
            // but sync() handles the display property.
        }
        if (preview.media1) { 
            const h1 = `${ui.inputMediaZoom1.value}px`;
            preview.media1.style.maxHeight = h1;
            const img1 = preview.media1.querySelector('img'); 
            if (img1) img1.style.maxHeight = h1; 
        }
        if (preview.media2) { 
            const h2 = `${ui.inputMediaZoom2.value}px`;
            preview.media2.style.maxHeight = h2;
            const img2 = preview.media2.querySelector('img'); 
            if (img2) img2.style.maxHeight = h2; 
        }

        const showTM = ui.checkTrademark.checked && selectedLogoSrc !== "";

        if(ui.watermarkTrademark) {
            ui.watermarkTrademark.src = selectedLogoSrc;
            ui.watermarkTrademark.style.opacity = ui.inputLogoTrademarkOpacity.value / 100;
            ui.watermarkTrademark.style.width = `${ui.inputLogoTrademarkZoom.value}%`;
            ui.watermarkTrademark.style.display = showTM ? 'block' : 'none';
        }

        const blurVal = ui.inputMediaBlur.value;
        const isMirrored = ui.btnMediaMirror.classList.contains('active');
        const isGrayscale = ui.checkMediaGrayscale.checked;

        document.querySelectorAll('.tweet-media-wrapper').forEach(w => {
            const hasBlur = blurVal > 0;
            w.classList.toggle('blur-active', hasBlur);
            w.classList.toggle('mirrored', isMirrored);
            
            const img = w.querySelector('.tweet-media img');
            if (img) {
                // On passe la valeur au CSS via une variable pour que le clone la voit
                w.style.setProperty('--blur-intensity', `${blurVal}px`);
                
                let filters = [];
                // Pour html2canvas, on utilise parfois l'id SVG ou le filtre standard
                if (hasBlur) filters.push(`blur(${blurVal}px)`);
                if (isGrayscale) {
                    filters.push('grayscale(100%)');
                    filters.push('contrast(1.1)');
                }
                img.style.filter = filters.join(' ') || 'none';
                img.style.webkitFilter = filters.join(' ') || 'none'; // Pour compatibilité
            }
        });

        updateLayout();
    };

    const ctrls = [
        ui.inputBgColor, ui.inputBgOpacity, ui.inputBgShadow,
        ui.inputTextZoom1, ui.inputTextZoom2, ui.inputAvatarZoom, 
        ui.inputMediaZoom1, ui.inputMediaZoom2, ui.inputLineHeight, ui.inputSplitPos, 
        ui.inputLogoTrademarkZoom, ui.inputLogoTrademarkOpacity, 
        ui.checkTrademark, ui.inputMediaBlur, ui.checkMediaGrayscale,
        ui.inputCardY, ui.inputFootBranding,
        ui.inputSoloZoom, ui.inputSoloRadius, ui.inputSoloY
    ];
    ctrls.forEach(c => { if(c) c.oninput = refreshUI; });

    ui.inputCustomLogo.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (rev) => {
            selectedLogoSrc = rev.target.result;
            refreshUI();
        };
        reader.readAsDataURL(file);
    };

    ui.inputSoloImage.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (rev) => {
            ui.soloImagePreview.src = rev.target.result;
            refreshUI();
        };
        reader.readAsDataURL(file);
    };

    const switchMode = (mode) => {
        currentMode = mode;
        ui.btnModePosts.classList.toggle('active', mode === 'posts');
        ui.btnModeImage.classList.toggle('active', mode === 'image');

        ui.groupXSources.style.display = (mode === 'posts') ? 'flex' : 'none';
        ui.groupImageSolo.style.display = (mode === 'image') ? 'flex' : 'none';

        ui.mainCard.style.display = (mode === 'posts') ? 'grid' : 'none';
        ui.soloImageContainer.style.display = (mode === 'image') ? 'flex' : 'none';

        // En mode image, on cache la ligne de séparation si elle était là
        if (ui.horizontalDivider && mode === 'image') ui.horizontalDivider.style.display = 'none';
        else if (ui.horizontalDivider && mode === 'posts') sync();

        refreshUI();
        sync();
    };

    ui.btnModePosts.onclick = () => switchMode('posts');
    ui.btnModeImage.onclick = () => switchMode('image');
    
    ui.btnMediaMirror.onclick = () => {
        ui.btnMediaMirror.classList.toggle('active');
        refreshUI();
    };

    const switchProject = (project) => {
        currentProject = project;
        document.body.classList.remove('theme-foot', 'theme-politics');
        document.body.classList.add(`theme-${project}`);
        
        ui.btnProjectFoot.classList.toggle('active', project === 'foot');
        ui.btnProjectPolitics.classList.toggle('active', project === 'politics');

        // Afficher/Cacher le sélecteur d'illustration
        if (ui.politicsBgSelector) ui.politicsBgSelector.style.display = (project === 'politics') ? 'block' : 'none';
        
        // Afficher/Cacher la signature Football
        if (ui.inputFootBranding) {
            ui.inputFootBranding.parentElement.style.display = (project === 'foot') ? 'flex' : 'none';
        }
        
        // Gérer la visibilité des overlays via JS pour être sûr
        const politicsOverlay = document.getElementById('politics-overlay');
        const footOverlay = document.getElementById('foot-overlay');
        if (politicsOverlay) politicsOverlay.style.display = (project === 'politics') ? 'block' : 'none';
        if (footOverlay) footOverlay.style.display = (project === 'foot') ? 'flex' : 'none';

        // Chargement de l'overlay PNG physique
        if (ui.mainProjectOverlay) {
            const overlayPath = project === 'foot' ? 'overlay/overlay-foot.png' : 'overlay/overlay-politique.png';
            ui.mainProjectOverlay.src = overlayPath;
        }

        if (project === 'politics') {
            ui.inputBgColor.value = '#000000';
            ui.inputBgShadow.value = 60;
            ui.inputBgOpacity.value = 100;
            ui.inputTextZoom1.value = 22;
            ui.inputTextZoom2.value = 22;
            ui.inputCardY.value = 80; // Valeur par défaut plus haute pour la politique
            
            // On sélectionne le nouveau fondalgo par défaut
            ui.selectPoliticsBg.value = 'illustrations algodukaos/fondalgo.png';
            
            // Avatar par défaut Algo du Kaos
            if (!mInputs.name1.dataset.avatar) {
                mInputs.name1.dataset.avatar = 'illustrations algodukaos/algodukaos avatar.png';
            }
        }

        refreshUI();
        sync();
    };

    if (ui.selectPoliticsBg) ui.selectPoliticsBg.onchange = refreshUI;

    ui.btnProjectFoot.onclick = () => switchProject('foot');
    ui.btnProjectPolitics.onclick = () => switchProject('politics');

    function updateLayout() {
        const pArea = document.querySelector('.preview-area');
        if(!pArea || !ui.captureContainer) return;
        
        const pad = 30; // Marge de sécurité
        const availableW = pArea.clientWidth - pad;
        const availableH = pArea.clientHeight - pad;
        
        const scaleW = availableW / 800;
        const scaleH = availableH / 1000;
        
        const vScale = Math.min(scaleW, scaleH, 1);
        
        ui.captureContainer.style.transformOrigin = 'center center';
        ui.captureContainer.style.transform = `scale(${vScale})`;
    }

    const sync = () => {
        const hasReply = (mInputs.text2.value && mInputs.text2.value.trim() !== "") || (mInputs.name2.value && mInputs.name2.value.trim() !== "");
        ui.replyContainer.style.display = hasReply ? 'block' : 'none';
        if(ui.horizontalDivider) ui.horizontalDivider.style.display = hasReply ? 'block' : 'none';

        const uPost = (idx) => {
            preview[`name${idx}`].textContent = mInputs[`name${idx}`].value || 'Nom';
            preview[`handle${idx}`].textContent = mInputs[`handle${idx}`].value || '@handle';
            let cleanText = (mInputs[`text${idx}`].value || '').replace(/\n\s*\n/g, '\n');
            preview[`content${idx}`].innerHTML = cleanText.replace(/\n/g, '<br>');
            const avUrl = mInputs[`name${idx}`].dataset.avatar || `https://unavatar.io/twitter/${mInputs[`handle${idx}`].value.replace('@','')}`;
            const proxiedAv = getProxiedUrl(avUrl);
            preview[`avatar${idx}`].innerHTML = `<img src="${proxiedAv}" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;

            if (mInputs[`img${idx}`].value) {
                preview[`media${idx}`].innerHTML = `<img src="${getProxiedUrl(mInputs[`img${idx}`].value)}" crossorigin="anonymous">`;
                preview[`media${idx}`].classList.add('active');
            } else {
                preview[`media${idx}`].classList.remove('active');
                preview[`media${idx}`].innerHTML = '';
            }
        };
        uPost(1); if (hasReply) uPost(2);
        refreshUI();
    };

    Object.values(mInputs).forEach(i => { if(i) i.oninput = sync; });

    ui.btnFetch.onclick = async () => {
        ui.btnFetch.innerText = '⌛...';
        const fOne = async (url, idx) => {
            if (!url) return;
            try {
                const r = await fetch(`/api/fetch-tweet?url=${encodeURIComponent(url)}&t=${Date.now()}`);
                const d = await r.json();
                if (d.success) {
                    mInputs[`name${idx}`].value = d.author_name; mInputs[`handle${idx}`].value = '@' + d.author_handle;
                    mInputs[`text${idx}`].value = d.content; mInputs[`name${idx}`].dataset.avatar = d.avatar_url;
                    mInputs[`img${idx}`].value = d.media_url || "";
                }
            } catch(e) {
                console.error("Erreur lors de la récupération du tweet:", e);
            }
        };
        await Promise.all([fOne(ui.urlMain.value, 1), fOne(ui.urlReply.value, 2)]);
        sync();
        ui.btnFetch.innerText = 'Récupérer';
    };

    ui.btnExport.onclick = () => {
        const btn = ui.btnExport;
        btn.innerText = '📸 Génération PNG...';
        btn.disabled = true;

        const container = ui.captureContainer;
        
        // On mémorise l'état pour la restauration
        const oldTransform = container.style.transform;
        
        // Pour dom-to-image, on doit être en taille réelle sans transformation
        container.style.transform = 'none';

        const options = {
            width: 800,
            height: 1000,
            style: {
                transform: 'none',
                margin: '0',
                left: '0',
                top: '0',
                boxShadow: 'none'
            },
            copyDefaultStyles: true // Option spécifique pour dom-to-image-more
        };

        domtoimage.toPng(container, options)
        .then(dataUrl => {
            const link = document.createElement('a'); 
            link.download = `x-post-studio-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            // Restauration
            container.style.transform = oldTransform;
            btn.innerText = 'Exporter l\'image (PNG)';
            btn.disabled = false;
        })
        .catch(err => {
            console.error("Erreur d'exportation critique:", err);
            container.style.transform = oldTransform;
            btn.innerText = '⚠️ Erreur Export';
            btn.disabled = false;
            setTimeout(() => { btn.innerText = 'Exporter l\'image (PNG)'; }, 3000);
        });
    };

    window.onresize = updateLayout;
    
    // Initialisation forcée (déplacée à la fin pour éviter les erreurs d'initialisation)
    switchProject('foot');
    setTimeout(sync, 500);
});
