// ============================
// UI & THEME SETTINGS
// ============================
const toggleThemeBtn = document.getElementById('btnTheme');
toggleThemeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    toggleThemeBtn.textContent = current === 'dark' ? '🌞' : '🌙';
});

// Mobile Controls
const mobileMenuBtn = document.getElementById('btnMenu');
const controlsPanel = document.getElementById('controlsPanel');
mobileMenuBtn.addEventListener('click', () => {
    controlsPanel.classList.toggle('open');
});

// Mobile Specs Modal
const btnMobileSpecs = document.getElementById('btnMobileSpecs');
const mobileSpecsOverlay = document.getElementById('mobileSpecsOverlay');
const btnCloseMobileSpecs = document.getElementById('btnCloseMobileSpecs');

btnMobileSpecs.addEventListener('click', () => {
    const content = document.getElementById('desktopInfoPanel').cloneNode(true);
    content.style.display = 'block';

    // FIX v2.1: clonarea copia si id-urile (tab1/tab2/tab3), rezultand in
    // HTML invalid cu ID-uri duplicate in document. Le prefixam cu "m-"
    // in clona, astfel incat sa ramana unice global.
    content.removeAttribute('id');
    content.querySelectorAll('[id]').forEach(el => { el.id = 'm-' + el.id; });
    content.querySelectorAll('[data-target]').forEach(el => {
        el.setAttribute('data-target', 'm-' + el.getAttribute('data-target'));
    });

    // Inject and show
    const modalContent = document.getElementById('mobileModalContent');
    modalContent.innerHTML = '';
    modalContent.appendChild(content);
    modalContent.appendChild(btnCloseMobileSpecs);

    // Initialize tabs in mobile modal
    initTabs(modalContent);
    mobileSpecsOverlay.classList.add('view');
});

btnCloseMobileSpecs.addEventListener('click', () => {
    mobileSpecsOverlay.classList.remove('view');
});

// Tab Logic
function initTabs(container) {
    const tabs = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            container.querySelector('#' + tab.getAttribute('data-target')).classList.add('active');
        });
    });
}
initTabs(document); // Init desktop tabs

// ============================
// SCENE SETUP
// ============================
const canvas = document.getElementById('canvas3d');
const scene = new THREE.Scene();

// Camera setup (Top view position fixed)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 8;
controls.target.set(0, 0.9, 0);
camera.position.set(2.5, 1.5, 2.5);
camera.lookAt(0, 0.9, 0);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const mainLight = new THREE.DirectionalLight(0xfff8ee, 1.3);
mainLight.position.set(3, 4, 2);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
scene.add(mainLight);
const fillLight = new THREE.DirectionalLight(0x6688cc, 0.3);
fillLight.position.set(-2, 2, -1);
scene.add(fillLight);
const rimLight = new THREE.PointLight(0xc5737a, 0.4, 10);
rimLight.position.set(-1, 2, -2);
scene.add(rimLight);

const groupGround = new THREE.Group();
const groundMat = new THREE.MeshStandardMaterial({color: 0xe8e8e2, roughness: 0.9});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), groundMat);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
groupGround.add(ground);
const grid = new THREE.GridHelper(5, 20, 0xcccccc, 0xdddddd);
grid.position.y = 0.001; groupGround.add(grid);
scene.add(groupGround);

// ============================
// MODEL STRUCTURE
// ============================
const materials = {
    steel: new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.3, metalness: 0.8 }),
    steelDark: new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.4, metalness: 0.7 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2 }),
    screenGlow: new THREE.MeshStandardMaterial({ color: 0x112211, emissive: 0x22aa44, emissiveIntensity: 0.4 }),
    insulation: new THREE.MeshStandardMaterial({ color: 0xccbb66, roughness: 0.9, transparent: true, opacity: 0.6 }),
    wine1: new THREE.MeshStandardMaterial({ color: 0xf0e68c, roughness: 0.5, transparent: true, opacity: 0.7 }),
    wine3: new THREE.MeshStandardMaterial({ color: 0x8b2030, roughness: 0.5, transparent: true, opacity: 0.7 }),
    nozzle: new THREE.MeshStandardMaterial({ color: 0xaaaabb, roughness: 0.2, metalness: 0.9 }),
    pump: new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.6 }),
    compressor: new THREE.MeshStandardMaterial({ color: 0x222233 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x1a4a2a, emissive: 0x0a2a0a }),
    door: new THREE.MeshStandardMaterial({ color: 0x7a7a8a, roughness: 0.35, metalness: 0.75, side: THREE.DoubleSide })
};

const parts = {
    cabinet: new THREE.Group(), door: new THREE.Group(), screen: new THREE.Group(),
    nozzles: new THREE.Group(), bib: new THREE.Group(), pumps: new THREE.Group(),
    insulation: new THREE.Group(),
};
const allMeshes = [];

function addPart(group, geo, mat, pos, name, desc) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { name, desc, group: group.name, origMat: mat };
    group.add(mesh); allMeshes.push(mesh);
    return mesh;
}

const W = 0.9, H = 1.8, D = 0.75, STEEL_T = 0.0015, INSUL = 0.04;

function buildModel() {
    parts.cabinet.name = 'cabinet';
    addPart(parts.cabinet, new THREE.BoxGeometry(W, H, STEEL_T), materials.steel, [0, H / 2, -D / 2], 'Perete spate', 'AISI 304');
    addPart(parts.cabinet, new THREE.BoxGeometry(STEEL_T, H, D), materials.steel, [-W / 2, H / 2, 0], 'Perete stanga', 'AISI 304');
    addPart(parts.cabinet, new THREE.BoxGeometry(STEEL_T, H, D), materials.steel, [W / 2, H / 2, 0], 'Perete dreapta', 'AISI 304');
    addPart(parts.cabinet, new THREE.BoxGeometry(W, STEEL_T, D), materials.steel, [0, H, 0], 'Plafon', 'AISI 304');
    
    parts.door.name = 'door';
    // Ușă formată din 4 piese pentru a lăsa gaura sertarului
    // Top
    addPart(parts.door, new THREE.BoxGeometry(W-0.06, 0.215, 0.005), materials.door, [0, 1.2325, D/2], 'Usa service principală', 'Acces intern general');
    // Bottom
    addPart(parts.door, new THREE.BoxGeometry(W-0.06, 0.335, 0.005), materials.door, [0, 0.5075, D/2], 'Usa service principală', 'Acces intern general');
    // Left
    addPart(parts.door, new THREE.BoxGeometry(0.245, 0.45, 0.005), materials.door, [-0.2975, 0.9, D/2], 'Usa service principală', 'Acces intern general');
    // Right
    addPart(parts.door, new THREE.BoxGeometry(0.245, 0.45, 0.005), materials.door, [0.2975, 0.9, D/2], 'Usa service principală', 'Acces intern general');

    parts.screen.name = 'screen';
    addPart(parts.screen, new THREE.BoxGeometry(0.1, 0.04, 0.012), materials.screen, [-0.15, H-0.12, D/2+0.006], 'LCD', 'Display');
    
    parts.insulation.name = 'insulation';
    addPart(parts.insulation, new THREE.BoxGeometry(W-0.01, H-0.01, INSUL), materials.insulation, [0, H/2, -D/2+0.02], 'Izolație PU', '40mm densitate');

    parts.nozzles.name = 'nozzles';
    // Sertar format din 5 piese (o cutie deschisă, prelungită in jos pentru tava)
    // Înălțimea pereților a crescut la 0.52 (cu 7cm mai jos pentru tava)
    addPart(parts.nozzles, new THREE.BoxGeometry(0.35, 0.52, 0.005), materials.steelDark, [0, 0.865, D/2-0.1475], 'Sertar Spate', 'Dozare');
    addPart(parts.nozzles, new THREE.BoxGeometry(0.35, 0.005, 0.15), materials.steelDark, [0, 1.1225, D/2-0.075], 'Sertar Sus', 'Dozare');
    addPart(parts.nozzles, new THREE.BoxGeometry(0.005, 0.52, 0.15), materials.steelDark, [-0.1725, 0.865, D/2-0.075], 'Sertar Stanga', 'Dozare');
    addPart(parts.nozzles, new THREE.BoxGeometry(0.005, 0.52, 0.15), materials.steelDark, [0.1725, 0.865, D/2-0.075], 'Sertar Dreapta', 'Dozare');
    
    // Recipient acumulare (Tava din plastic/metal închis plasată la bază)
    addPart(parts.nozzles, new THREE.BoxGeometry(0.34, 0.05, 0.14), materials.pump, [0, 0.63, D/2-0.075], 'Tavă Colectare', 'Recipient acumulare lichid');

    // Grila de scurgere (formată din benzi longitudinale pentru a lăsa lichidul să treacă)
    for(let i=0; i<=6; i++) {
        let zPos = (D/2 - 0.135) + i * 0.02;
        addPart(parts.nozzles, new THREE.BoxGeometry(0.35, 0.005, 0.008), materials.steel, [0, 0.675, zPos], 'Grila', 'Scurgere picături');
    }

    const dozAlb = addPart(parts.nozzles, new THREE.CylinderGeometry(0.005, 0.008, 0.035, 8), materials.nozzle, [-0.1, 1.05, D/2 - 0.08], 'Dozator', 'Alb');
    const dozRosu = addPart(parts.nozzles, new THREE.CylinderGeometry(0.005, 0.008, 0.035, 8), materials.nozzle, [0.1, 1.05, D/2 - 0.08], 'Dozator', 'Rosu');

    parts.bib.name = 'bib';
    for(let r=0; r<5; r++) {
        for(let c=-1; c<=1; c++) {
            const mat = r < 3 ? materials.wine1 : materials.wine3;
            addPart(parts.bib, new THREE.BoxGeometry(0.26, 0.16, 0.3), mat, [c*0.27, 0.5+r*0.25, -0.05], 'BIB Win', '25L Cutie');
        }
    }

    parts.pumps.name = 'pumps';
    addPart(parts.pumps, new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16), materials.compressor, [-0.2, 0.08, -0.1], 'Compresor', 'R600a');
    // FIX v2.1: 2 pompe separate (una per canal Alb/Rosu) — o singura pompa ar amesteca cele 2 vinuri
    addPart(parts.pumps, new THREE.CylinderGeometry(0.022, 0.022, 0.045, 12), materials.pump, [-0.03, 0.1, -0.18], 'Pompa Peristaltica', 'Canal Alb');
    addPart(parts.pumps, new THREE.CylinderGeometry(0.022, 0.022, 0.045, 12), materials.pump, [0.03, 0.1, -0.18], 'Pompa Peristaltica', 'Canal Roșu');

    Object.values(parts).forEach(g => scene.add(g));
}
buildModel();

// ============================
// INTRO ANIMATION
// ============================
function runIntroAnimation() {
    controls.enabled = false;
    document.getElementById('loader').classList.add('hidden');
    
    // Start exploded
    Object.values(parts).forEach(p => p.position.y += 2);
    
    let t = 0;
    function introStep() {
        t += 0.015; if(t > 1) t = 1;
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        
        // Assemble
        Object.values(parts).forEach(p => p.position.y = (1-ease)*2);
        
        // Rotate camera 360
        const angle = (1-ease) * Math.PI * 2;
        camera.position.set(2.5 * Math.cos(angle), 1.5, 2.5 * Math.sin(angle));
        camera.lookAt(0, 0.9, 0);
        
        if(t < 1) {
            requestAnimationFrame(introStep);
        } else {
            controls.enabled = true;
            camera.position.set(2.5, 1.5, 2.5);
            saveStateToURL();
        }
    }
    requestAnimationFrame(introStep);
}

// ============================
// STATE URL HASING
// ============================
let appState = {
    view: 'iso', mode: 'solid', rotate: false, explode: false,
    visible: { cabinet: true, door: true, screen: true, nozzles: true, bib: true, pumps: true, insulation: true }
};

function saveStateToURL() {
    const hash = btoa(JSON.stringify(appState));
    window.history.replaceState(null, '', '#' + hash);
}

function loadStateFromURL() {
    if(window.location.hash.length > 1) {
        try {
            const data = JSON.parse(atob(window.location.hash.slice(1)));
            appState = {...appState, ...data};
            applyState(false);
            document.getElementById('loader').classList.add('hidden');
        } catch(e) { runIntroAnimation(); }
    } else {
        runIntroAnimation();
    }
}

// ============================
// INTERACTION & RAYCASTING (Touch & Mouse)
// ============================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');
let hoveredMesh = null;

function handleInteraction(event) {
    let clientX = event.clientX, clientY = event.clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX; clientY = event.touches[0].clientY;
    }
    
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(allMeshes).filter(obj => obj.object.parent.visible);

    if (intersects.length > 0 && currentMode !== 'wireframe') {
        const obj = intersects[0].object;
        if (obj.userData.name) {
            tooltip.querySelector('h4').textContent = obj.userData.name;
            tooltip.querySelector('p').textContent = obj.userData.desc || '';
            
            // Limit tooltip inside screen
            let ttX = clientX + 15, ttY = clientY + 15;
            if (ttX > window.innerWidth - 200) ttX = clientX - 215;
            
            tooltip.style.left = ttX + 'px';
            tooltip.style.top = ttY + 'px';
            tooltip.classList.add('show');
            
            if (hoveredMesh !== obj) {
                if (hoveredMesh && hoveredMesh.userData.origMat) {
                    hoveredMesh.material = hoveredMesh.userData.origMat;
                }
                hoveredMesh = obj;
                obj.material = obj.material.clone();
                obj.material.emissive = new THREE.Color(0xd88b93); // Pinkish red glow
                obj.material.emissiveIntensity = 0.5;
            }
        }
    } else {
        tooltip.classList.remove('show');
        if (hoveredMesh && hoveredMesh.userData.origMat) {
            hoveredMesh.material = hoveredMesh.userData.origMat;
            hoveredMesh = null;
        }
    }
}

canvas.addEventListener('mousemove', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction, {passive: true});
canvas.addEventListener('touchmove', handleInteraction, {passive: true});

// ============================
// CONTROLS LOGIC
// ============================
let currentMode = 'solid';

function animateCamera(pos, tgt) {
    const sP = camera.position.clone(), sT = controls.target.clone();
    const eP = new THREE.Vector3(...pos), eT = new THREE.Vector3(...tgt);
    let t = 0;
    function step() {
        t += 0.04; if(t>1) t = 1;
        const e = t*t*(3-2*t);
        camera.position.lerpVectors(sP, eP, e);
        controls.target.lerpVectors(sT, eT, e);
        controls.update();
        if(t<1) requestAnimationFrame(step);
    }
    step();
}

function setView(vId) {
    appState.view = vId; saveStateToURL();
    const t = {
        front: [[0, 1, 3], [0, 0.9, 0]],
        back:  [[0, 1, -3], [0, 0.9, 0]],
        side:  [[3, 1, 0], [0, 0.9, 0]],
        // Fixing top view bounding cutoff by shifting Z and increasing Y
        top:   [[0, 4.5, 0.3], [0, 0.9, 0]], 
        iso:   [[2.5, 1.5, 2.5], [0, 0.9, 0]]
    };
    animateCamera(t[vId][0], t[vId][1]);
}

document.querySelectorAll('#viewBtns button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#viewBtns button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        setView(e.target.dataset.view);
    });
});

// FIX v2.1: 'tog' + capitalizare-prima-litera nu corespundea cu id-ul real
// din HTML pentru cheia "bib" (id="togBIB", nu "togBib"). getElementById()
// returna null pentru acest caz, iar applyState() arunca o exceptie la
// citirea lui .checked pe null — ceea ce facea ca RESTAURAREA STARII DIN URL
// (link-uri partajate cu #hash) sa esueze silentios si sa cada mereu pe
// runIntroAnimation() in loc de starea salvata. Mapam explicit exceptiile.
const TOGGLE_ID_OVERRIDES = { bib: 'togBIB' };
function toggleIdFor(key) {
    return TOGGLE_ID_OVERRIDES[key] || ('tog' + key.charAt(0).toUpperCase() + key.slice(1));
}

Object.keys(parts).forEach(key => {
    const el = document.getElementById(toggleIdFor(key));
    if(el) {
        el.addEventListener('change', () => {
            parts[key].visible = el.checked;
            appState.visible[key] = el.checked;
            saveStateToURL();
        });
    }
});

function applyMode() {
    allMeshes.forEach(m => {
        if(currentMode === 'wireframe') {
            m.material = m.userData.origMat.clone();
            m.material.wireframe = true; m.material.transparent = true; m.material.opacity = 0.6;
        } else if(currentMode === 'xray') {
            m.material = m.userData.origMat.clone();
            m.material.transparent = true; m.material.opacity = 0.25; m.material.wireframe = false;
        } else {
            m.material = m.userData.origMat;
        }
    });
}
document.querySelectorAll('#modeBtns button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#modeBtns button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
        appState.mode = currentMode; saveStateToURL();
        applyMode();
    });
});

const togRotate = document.getElementById('togRotate');
togRotate.addEventListener('change', () => {
    controls.autoRotate = togRotate.checked;
    controls.autoRotateSpeed = 1.5;
    appState.rotate = togRotate.checked; saveStateToURL();
});

const togExplode = document.getElementById('togExplode');
togExplode.addEventListener('change', () => {
    appState.explode = togExplode.checked; saveStateToURL();
    doExplode(togExplode.checked ? 1 : 0);
});

function doExplode(f) {
    function ext(g, t) {
        const start = g.position.clone(), end = new THREE.Vector3(...t);
        let time = 0;
        function s() {
            time += 0.05; if(time>1) time=1;
            g.position.lerpVectors(start, end, time*time*(3-2*time));
            if(time<1) requestAnimationFrame(s);
        }
        s();
    }
    ext(parts.door, [0, 0, f*0.4]);
    ext(parts.screen, [0, f*0.3, f*0.3]);
    ext(parts.nozzles, [0, f*0.15, f*0.4]);
    ext(parts.bib, [0, -f*0.1, 0]);
    ext(parts.pumps, [0, -f*0.3, 0]);
    ext(parts.insulation, [f*0.15, 0, 0]);
}

function applyState(anim=true) {
    // FIX v2.1 (bug critic): "set(...[[2.5, 1.5, 2.5]])" desface array-ul
    // extern si paseaza array-ul INTERN ca prim argument lui Vector3.set(x,y,z)
    // -> x devine un array, y si z raman undefined -> camera.position ajunge
    // NaN si RAMANE NaN definitiv (lerp cu un capat NaN e tot NaN, indiferent
    // de progres). Efect real: orice link partajat cu #hash (generat automat
    // de saveStateToURL la fiecare actiune) incarca vizualizarea 3D complet
    // goala/nefunctionala, fara nicio eroare vizibila si fara recuperare
    // posibila din UI. Corectat la apelul simplu, cu 3 argumente numerice.
    if(!anim) { camera.position.set(2.5, 1.5, 2.5); controls.target.set(0, 0.9, 0); }
    Object.keys(parts).forEach(k => { parts[k].visible = appState.visible[k]; document.getElementById(toggleIdFor(k)).checked = appState.visible[k]; });
    currentMode = appState.mode; applyMode();
    document.querySelectorAll('#modeBtns button').forEach(b => b.classList.toggle('active', b.dataset.mode === appState.mode));
    togRotate.checked = appState.rotate; controls.autoRotate = appState.rotate;
    togExplode.checked = appState.explode; doExplode(appState.explode ? 1 : 0);
    document.querySelectorAll('#viewBtns button').forEach(b => b.classList.toggle('active', b.dataset.view === appState.view));
    if(!anim) setView(appState.view);
}

// ============================
// EXPORTS
// ============================
function downloadURI(uri, name) {
    const link = document.createElement("a");
    link.download = name; link.href = uri; link.click();
}

document.getElementById('btnExportPNG').addEventListener('click', () => {
    try {
        renderer.render(scene, camera);
        downloadURI(canvas.toDataURL("image/png"), `WineVend_${Date.now()}.png`);
    } catch (err) {
        // FIX v2.1: fara try/catch, orice eroare (ex. canvas "tainted" sau
        // renderer indisponibil) opreste scriptul silentios, fara mesaj.
        console.error('Export PNG a eșuat:', err);
        alert('Exportul PNG a eșuat. Reîncarcă pagina și încearcă din nou. Detalii în consolă.');
    }
});

document.getElementById('btnExportPlans').addEventListener('click', async () => {
    const pOrig = appState.view;
    try {
        alert("Procesează planșe multiple (Fata, Spate, Isometric)... Vor fi descărcate secvențial.");
        const views = ['front', 'back', 'iso'];
        for (const v of views) {
            setView(v);
            await new Promise(r => setTimeout(r, 800));
            renderer.render(scene, camera);
            downloadURI(canvas.toDataURL("image/png"), `WineVend_Plan_${v}.png`);
        }
    } catch (err) {
        console.error('Export planșe a eșuat:', err);
        alert('Exportul planșelor a eșuat la un pas intermediar. Detalii în consolă.');
    } finally {
        setView(pOrig);
    }
});

// GLTF Export Feature
document.getElementById('btnExportGLTF').addEventListener('click', () => {
    try {
        if (typeof THREE.GLTFExporter !== 'function') {
            throw new Error('THREE.GLTFExporter nu s-a încărcat (verifică rețeaua / CDN-ul).');
        }
        alert('Generare fisier GLTF...');
        const exporter = new THREE.GLTFExporter();
        exporter.parse(scene, function (gltf) {
            const output = JSON.stringify(gltf, null, 2);
            const blob = new Blob([output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            downloadURI(url, 'winevend.gltf');
        }, function (err) {
            console.error('GLTFExporter a raportat o eroare:', err);
            alert('Exportul GLTF a eșuat în timpul procesării scenei. Detalii în consolă.');
        }, { trs: false, onlyVisible: true, binary: false });
    } catch (err) {
        console.error('Export GLTF a eșuat:', err);
        alert('Exportul GLTF a eșuat: ' + err.message);
    }
});

// ============================
// MAIN LOOP
// ============================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start App
loadStateFromURL();

// ============================
// COMPONENT DETAIL / ISOLATION
// ============================
const componentSpecs = {
    cabinet: {
        icon: '🏗️', title: 'Cabinet Exterior AISI 304',
        specs: [
            ['Material', 'Inox AISI 304, 1.5mm'],
            ['Dimensiuni', '1800 × 900 × 750 mm'],
            ['Pereți', '3 (Spate + Stânga + Dreapta)'],
            ['Plafon', 'AISI 304, sudat continuu'],
            ['Finisaj', 'Satinat / Lustruit'],
            ['Greutate', '~85 kg']
        ],
        camera: [2.5, 1.5, 2.5], target: [0, 0.9, 0]
    },
    door: {
        icon: '🚪', title: 'Ușă Service (4 panouri)',
        specs: [
            ['Construcție', '4 panouri cu decupaj sertar'],
            ['Material', 'AISI 304, grosime 1.5mm'],
            ['Panou SUS', '840 × 215 mm'],
            ['Panou JOS', '840 × 335 mm'],
            ['Panouri laterale', '2× (245 × 450 mm)'],
            ['Închidere', 'Zăvor + mâner lateral']
        ],
        camera: [0, 0.9, 2], target: [0, 0.9, 0.375]
    },
    screen: {
        icon: '🖥️', title: 'LCD + Modul ESP32',
        specs: [
            ['Display', 'LCD 20×4 caractere I2C'],
            ['Backlight', 'Verde, ajustabil'],
            ['MCU', 'ESP32-WROOM-32'],
            ['Comunicație', 'WiFi + BLE + RF 433MHz'],
            ['Dimensiuni LCD', '100 × 40 × 12 mm'],
            ['Poziție', 'Panou frontal superior']
        ],
        camera: [-0.3, 1.75, 1], target: [-0.15, 1.76, 0.38]
    },
    nozzles: {
        icon: '🍷', title: 'Sertar Dozare',
        specs: [
            ['Componente', '5 pereți + tavă + grilă'],
            ['Dozatoare', '2× cilindrice (Alb + Roșu)'],
            ['Dimensiuni', '350 × 520 × 150 mm'],
            ['Grilă scurgere', '7 bare AISI 304'],
            ['Tavă colectare', '340 × 50 × 140 mm'],
            ['Material', 'AISI 316L (contact alim.)']
        ],
        camera: [0, 0.9, 1.5], target: [0, 0.87, 0.3]
    },
    bib: {
        icon: '📦', title: 'Bag-in-Box (Stocare)',
        specs: [
            ['Configurație', '5 rânduri × 3 coloane'],
            ['Total', '15× BIB × 25L = 375L'],
            ['Vin Alb', '9 BIB (rânduri 1-3)'],
            ['Vin Roșu', '6 BIB (rânduri 4-5)'],
            ['Conectori', 'Cam-lock 1/2" alimentar'],
            ['Dimensiuni BIB', '260 × 160 × 300 mm']
        ],
        camera: [1.5, 1.2, 1], target: [0, 0.9, -0.05]
    },
    pumps: {
        icon: '⚙️', title: 'Pompe + Zona Tehnică',
        specs: [
            ['Compresor', 'Hermetic R600a, 250-350W'],
            ['Pompe', '2× Peristaltice BLDC 24V (1/canal)'],
            ['PSU', 'Mean Well 240W 24V DIN'],
            ['Refrigerant', 'R600a (ecologic)'],
            ['Temperatură', '4-8°C zonă unică'],
            ['Poziție', 'Baza cabinetului']
        ],
        camera: [1.5, 0.3, 1], target: [0, 0.1, -0.1]
    },
    insulation: {
        icon: '🧱', title: 'Izolație Poliuretan',
        specs: [
            ['Material', 'PU expandat 40mm'],
            ['Densitate', '40 kg/m³'],
            ['Poziție', 'Perete spate interior'],
            ['Acoperire', 'Lățime × Înălțime cabinet'],
            ['Funcție', 'Barieră termică R600a'],
            ['Grosime', '40 mm']
        ],
        camera: [0, 0.9, -1.5], target: [0, 0.9, -0.35]
    }
};

let isolatedPart = null;
const compCard = document.getElementById('componentCard');
const compIcon = document.getElementById('compIcon');
const compTitle = document.getElementById('compTitle');
const compBody = document.getElementById('compBody');
const resetBtn = document.getElementById('btnResetDetail');

function isolateComponent(partKey) {
    const spec = componentSpecs[partKey];
    if (!spec) return;
    
    isolatedPart = partKey;
    
    // Hide all other parts
    Object.keys(parts).forEach(k => {
        parts[k].visible = (k === partKey);
    });
    
    // Animate camera
    animateCamera(spec.camera, spec.target);
    
    // Enable slow auto-rotate for inspection
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    
    // Update detail buttons
    document.querySelectorAll('.detail-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.part === partKey);
    });
    
    // Show component info card
    compIcon.textContent = spec.icon;
    compTitle.textContent = spec.title;
    compBody.innerHTML = spec.specs.map(([l, v]) => 
        `<div class="info-row"><span>${l}</span><span>${v}</span></div>`
    ).join('');
    compCard.classList.add('visible');
    
    // Show reset button
    resetBtn.style.display = 'block';
    
    // Update toggles
    Object.keys(parts).forEach(k => {
        const el = document.getElementById(toggleIdFor(k));
        if(el) el.checked = (k === partKey);
    });
}

function resetIsolation() {
    isolatedPart = null;
    
    // Show all parts
    Object.keys(parts).forEach(k => {
        parts[k].visible = true;
        const el = document.getElementById(toggleIdFor(k));
        if(el) el.checked = true;
    });
    
    // Reset camera
    animateCamera([2.5, 1.5, 2.5], [0, 0.9, 0]);
    
    // Stop auto-rotate
    controls.autoRotate = false;
    togRotate.checked = false;
    
    // Hide UI
    compCard.classList.remove('visible');
    resetBtn.style.display = 'none';
    document.querySelectorAll('.detail-btn').forEach(b => b.classList.remove('active'));
}

// Bind detail buttons
document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const part = btn.dataset.part;
        if (isolatedPart === part) {
            resetIsolation();
        } else {
            isolateComponent(part);
        }
    });
});

// Bind reset button
resetBtn.addEventListener('click', resetIsolation);
