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
        inputTextColor: document.getElementById('input-text-color'),
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
        inputLogoZoom1: document.getElementById('input-logo-zoom-1'),
        inputLogoZoom2: document.getElementById('input-logo-zoom-2'),
        inputLogoTrademarkZoom: document.getElementById('input-logo-trademark-zoom'),
        inputLogoTrademarkOpacity: document.getElementById('input-logo-trademark-opacity'),
        inputLogoOpacity: document.getElementById('input-logo-opacity'),
        inputCustomLogo: document.getElementById('input-custom-logo'),
        checkLogo1: document.getElementById('check-logo-1'),
        checkLogo2: document.getElementById('check-logo-2'),
        checkTrademark: document.getElementById('check-logo-trademark'),
        watermarkTrademark: document.getElementById('watermark-trademark'),
        replyContainer: document.getElementById('reply-container')
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

    let selectedLogoSrc = "";

    function hexToRgba(hex, opacity) {
        let r=0, g=0, b=0;
        if (hex.length == 4) { r = parseInt(hex[1]+hex[1], 16); g = parseInt(hex[2]+hex[2], 16); b = parseInt(hex[3]+hex[3], 16); }
        else { r = parseInt(hex.substring(1,3), 16); g = parseInt(hex.substring(3,5), 16); b = parseInt(hex.substring(5,7), 16); }
        return `rgba(${r},${g},${b},${opacity})`;
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
            ui.captureContainer.style.background = hexToRgba(ui.inputBgColor.value, bgOpac);
            ui.captureContainer.style.color = ui.inputTextColor.value;
        }
        if(ui.bgOverlay) {
            const sh = ui.inputBgShadow.value / 100;
            ui.bgOverlay.style.background = `radial-gradient(circle, transparent 30%, rgba(0,0,0,${sh}) 100%)`;
        }
        const lineH = ui.inputLineHeight.value / 100;
        const splitPos = ui.inputSplitPos.value;
        const logoOpac = ui.inputLogoOpacity.value / 100;

        if(preview.content1) { preview.content1.style.fontSize = `${ui.inputTextZoom1.value}px`; preview.content1.style.lineHeight = `${lineH}`; }
        if(preview.content2) { preview.content2.style.fontSize = `${ui.inputTextZoom2.value}px`; preview.content2.style.lineHeight = `${lineH}`; }

        const avSize = ui.inputAvatarZoom.value;
        [preview.avatar1, preview.avatar2].forEach(a => { if(a) { a.style.width = `${avSize}px`; a.style.height = `${avSize}px`; } });
        
        if(ui.mainCard) {
            const hasReply = ui.replyContainer.style.display !== 'none';
            ui.mainCard.style.gridTemplateRows = hasReply ? `${splitPos}% auto 1fr` : `1fr 0 0`;
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

        const showC1 = ui.checkLogo1.checked && selectedLogoSrc !== "";
        const showC2 = ui.checkLogo2.checked && selectedLogoSrc !== "";
        const showTM = ui.checkTrademark.checked && selectedLogoSrc !== "";

        if(preview.watermark1) {
            preview.watermark1.src = selectedLogoSrc;
            preview.watermark1.style.width = `${ui.inputLogoZoom1.value}%`;
            preview.watermark1.style.opacity = logoOpac;
            preview.watermark1.style.display = (showC1 && mInputs.img1.value) ? 'block' : 'none';
        }
        if(preview.watermark2) {
            preview.watermark2.src = selectedLogoSrc;
            preview.watermark2.style.width = `${ui.inputLogoZoom2.value}%`;
            preview.watermark2.style.opacity = logoOpac;
            preview.watermark2.style.display = (showC2 && mInputs.img2.value) ? 'block' : 'none';
        }
        if(ui.watermarkTrademark) {
            ui.watermarkTrademark.src = selectedLogoSrc;
            ui.watermarkTrademark.style.opacity = ui.inputLogoTrademarkOpacity.value / 100;
            ui.watermarkTrademark.style.width = `${ui.inputLogoTrademarkZoom.value}%`;
            ui.watermarkTrademark.style.display = showTM ? 'block' : 'none';
        }
        updateLayout();
    };

    const ctrls = [
        ui.inputBgColor, ui.inputTextColor, ui.inputBgOpacity, ui.inputBgShadow,
        ui.inputTextZoom1, ui.inputTextZoom2, ui.inputAvatarZoom, 
        ui.inputMediaZoom1, ui.inputMediaZoom2, ui.inputLineHeight, ui.inputSplitPos, 
        ui.inputLogoZoom1, ui.inputLogoZoom2, ui.inputLogoTrademarkZoom, ui.inputLogoTrademarkOpacity, ui.inputLogoOpacity, 
        ui.checkLogo1, ui.checkLogo2, ui.checkTrademark
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

    function updateLayout() {
        const pArea = document.querySelector('.preview-area');
        if(!pArea || !ui.captureContainer) return;
        const vScale = Math.min((pArea.clientWidth - 20) / 800, (pArea.clientHeight - 20) / (ui.captureContainer.offsetHeight || 1000), 1);
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
                    el.style.borderRadius = '0';
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
