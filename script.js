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
        btnProjectPolitics: document.getElementById('btn-project-politics')
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
    let selectedLogoSrc = ""; // On revient à un seul logo global pour éviter les disparitions
    
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
            ui.captureContainer.style.background = hexToRgba(bgColor, bgOpac);
            ui.captureContainer.style.color = textColor;
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
        }
        if (ui.horizontalDivider) {
            if (currentProject === 'politics') {
                // Politique : Trait subtil mais plus visible (5px + transparence)
                const bgColor = ui.inputBgColor.value;
                const isDark = getContrastColor(bgColor) === '#ffffff';
                ui.horizontalDivider.style.background = isDark ? hexToRgba('#ffffff', 0.2) : darkenColor(bgColor, 40);
                ui.horizontalDivider.style.height = '5px';
                ui.horizontalDivider.style.opacity = 0.8;
            } else {
                // Football : Trait "normal" (5px)
                const textColor = getContrastColor(ui.inputBgColor.value);
                ui.horizontalDivider.style.background = textColor;
                ui.horizontalDivider.style.height = '5px';
                ui.horizontalDivider.style.opacity = 0.4;
            }
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
                let filters = [];
                if (hasBlur) filters.push(`blur(${blurVal}px)`);
                if (isGrayscale) {
                    filters.push('grayscale(100%)');
                    filters.push('contrast(1.1)');
                }
                img.style.filter = filters.join(' ') || 'none';
            }
        });

        updateLayout();
    };

    const ctrls = [
        ui.inputBgColor, ui.inputBgOpacity, ui.inputBgShadow,
        ui.inputTextZoom1, ui.inputTextZoom2, ui.inputAvatarZoom, 
        ui.inputMediaZoom1, ui.inputMediaZoom2, ui.inputLineHeight, ui.inputSplitPos, 
        ui.inputLogoTrademarkZoom, ui.inputLogoTrademarkOpacity, 
        ui.checkTrademark, ui.inputMediaBlur, ui.checkMediaGrayscale
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

        // On ne réinitialise plus les couleurs et tailles pour laisser le choix à l'utilisateur
        refreshUI();
    };

    ui.btnProjectFoot.onclick = () => switchProject('foot');
    ui.btnProjectPolitics.onclick = () => switchProject('politics');
    
    // Initialisation forcée
    switchProject('foot');

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
            } catch(e) {}
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
        
        console.log("Démarrage de l'export avec correction de décalage...");

        // On définit des options strictes pour éviter les décalages
        const options = {
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            scale: 2,
            width: 800,
            height: 1000,
            windowWidth: 1200, // On simule un écran large pour éviter les écrasements mobile
            windowHeight: 1200,
            x: 0,
            y: 0,
            scrollX: 0, 
            scrollY: 0,
            logging: false,
            onclone: (clonedDoc) => {
                const el = clonedDoc.getElementById('capture-container');
                if (el) {
                    // Force la réinitialisation complète dans le clone pour le rendu exact
                    el.style.transform = 'none';
                    el.style.boxShadow = 'none';
                    el.style.margin = '0';
                    el.style.position = 'fixed'; // Évite les problèmes de scroll
                    el.style.top = '0';
                    el.style.left = '0';
                    el.style.width = '800px';
                    el.style.height = '1000px';
                    el.style.display = 'flex';
                }
                // On s'assure que le body du clone ne contraint pas l'élément
                clonedDoc.body.style.width = '1200px';
                clonedDoc.body.style.height = '1200px';
            }
        };

        html2canvas(container, options)
        .then(canvas => {
            console.log("Canvas généré avec succès");
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a'); 
            link.download = `x-post-studio-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            btn.innerText = 'Exporter l\'image (PNG)';
            btn.disabled = false;
        })
        .catch(err => {
            console.error("Erreur d'exportation critique:", err);
            btn.innerText = '⚠️ Erreur Export';
            btn.disabled = false;
            setTimeout(() => { btn.innerText = 'Exporter l\'image (PNG)'; }, 3000);
        });
    };

    window.onresize = updateLayout;
    setTimeout(sync, 500);
});
