# WineVend Pro v2.0 — Analiză tehnică, echipă de experți și documentație CNC

Proiect analizat: fișierele din `WineVendPro/` (index.html, specificatie.html, productie.html, model 3D). Automat de dozare vin vrac din Bag-in-Box 25L, brand **Aproape Wine**, confecționat la depozitul din **Suceava** (unde ai deja utilajele de prelucrare metal, conform planului de business).

Metodă: am citit integral cele 3 pagini de documentație (specificații, subsisteme, BOM, desene de producție cu cote exacte) și am generat 15 fișiere DXF pentru CNC direct din cotele explicite ale desenelor tale — nu am inventat dimensiuni. Unde o poziție nu avea o cotă explicită în sursă, am marcat clar "aproximativ" și am recomandat verificare înainte de tăiere.

## Echipa de experți tehnici — constatări pe domenii

### 1. Inginer mecanic / proiectare tablă (structură, ușă, sertar)

**Constatare critică — structură fără schelet de rezistență.** Cabinetul e proiectat ca 5 panouri de tablă AISI 304 de 1.5mm (spate, stânga, dreapta, plafon) plus baza de 2mm, fără niciun cadru interior de rigidizare (profil/țeavă) menționat în BOM sau desene. La 1800mm înălțime, cu 15 BIB × 25L = **375 litri de lichid (≈375 kg) plus ambalajele**, distribuite pe 5 rafturi glisante, tabla de 1.5mm susținută doar pe muchii îndoite la 10mm va vibra, se va bombarda ("oil-canning") și riscă deformare permanentă în timp, mai ales la manevrarea rafturilor telescopice.
**Recomandare:** adaugă un schelet intern sudat din profil/țeavă pătrată 25×25×1.5mm (sau cornier 25×25×3mm) pe cele 4 colțuri verticale + 2 rame orizontale (una la nivelul rafturilor, una sus), iar tabla rămâne doar placare/înveliș exterior. Cost suplimentar estimat: 80-150 EUR în material + manoperă sudură, dar elimină riscul de deformare și extinde durata de viață.

**Constatare — picioarele reglabile, subdimensionate probabil.** Baza are 4 găuri ⌀10mm pentru picioare M10 (interax 720×570mm, confirmat din cotele desenului). Greutate totală în funcțiune: ~210kg (gol) + ~375kg lichid + ambalaje BIB ≈ **peste 600 kg pe 4 puncte de sprijin** = ~150kg/picior. Multe picioare reglabile M10 standard sunt rating-uite sub acest prag (depinde de model — de verificat fișa tehnică a piciorului ales).
**Recomandare:** cere de la furnizor fișa tehnică cu sarcina maximă/picior înainte de a cumpăra, sau treci la 6 picioare / M12 cu talpă mai mare.

**Constatare — ușa are balamale doar pe o singură axă orizontală.** Din cele 5 piese ale ușii (U1-sus, U2-jos, U3-stânga, U4-dreapta, sertar între ele), doar panoul U1 (banda de sus, 215mm înălțime) are 2 găuri de balama ⌀8mm, la aceeași înălțime. Ansamblul ușii complet (U1+U2, ~1000mm înălțime totală) nu are nicio balama marcată pe U2 (panoul de jos). O ușă metalică de această înălțime, agățată doar pe o singură axă de balama, se va deforma/răsuci ("racking") în timp și va solicita excesiv acea unică pereche de balamale.
**Recomandare:** adaugă a doua pereche de balamale ⌀8mm pe U2 (panoul de jos), la o distanță de minim 700-800mm de prima pereche, sau folosește o balama de tip pian (piano hinge) pe toată înălțimea. Am marcat deja acest lucru direct pe fișierele DXF U1 și U2 ca notă.

**Constatare — ușă din 4 piese sudate = mai multe suduri vizibile pe o suprafață estetică.** Design-ul actual taie ușa în 4 bucăți separate (sus/jos/stânga/dreapta) sudate în jurul decupajului pentru sertar, ceea ce înseamnă cusături de sudură pe fața vizibilă a aparatului (care necesită șlefuire + pasivare ulterioară pentru aspect uniform pe inox).
**Recomandare (opțională, cost vs. estetică):** dacă bugetul permite, o singură placă de 1.5mm cu decupaj central tăiat direct (laser/waterjet) pentru fereastra sertarului elimină 2 din cele 4 suduri vizibile — mai scump la tăiere, mai ieftin la finisare/lustruire.

### 2. Inginer frigotehnist

**Constatare critică — izolație termică pe o singură parte.** Din secțiunea laterală a desenului (specificatie.html), izolația PU de 40mm apare **doar pe peretele din spate**, nu pe pereții laterali, ușă sau plafon. Pentru o zonă răcită la 4-8°C, izolarea a doar 1 din 6 suprafețe înseamnă pierderi termice mari prin restul carcasei — compresorul va funcționa mult mai mult decât cei 250-350W estimați în BOM, mai ales vara, în condiții din România/Moldova.
**Recomandare:** izolează toate cele 4 laturi + ușa + plafonul zonei de stocare BIB (nu și zona tehnică de jos, care are nevoie de aer liber, nu de izolație). Cost suplimentar: PU spray sau panouri de 40mm pe suprafața rămasă neizolată — de recalculat cu furnizorul, dar esențial pentru consumul energetic real.

**Constatare critică — ventilație probabil insuficientă pentru compresor.** Desenul arată 5 fante de 120×6mm pe un singur perete lateral = **doar ~3600 mm² suprafață liberă totală**. Pentru un compresor ermetic de 250-350W plus condensator, aparatele comerciale similare au de regulă 10-15x mai multă suprafață de ventilație liberă. Zona tehnică pare izolată/închisă în partea de jos a cabinetului, ceea ce agravează problema.
**Recomandare:** mărește semnificativ fantele de ventilație (sau adaugă un ventilator de evacuare forțată) și adaugă o a doua zonă de ventilație (aspirație jos, evacuare sus, sau invers, în funcție de orientarea condensatorului). Am marcat poziția fantelor din DXF P3 ca fiind aproximativă tocmai pentru că poziția reală trebuie stabilită împreună cu poziția finală a compresorului — recomand să nu tai P3 înainte de a rezolva acest punct.

**Constatare — fără evacuare pentru lichidul din tava de colectare.** Sertarul are o tavă de colectare (S5) dar nu apare nicio conductă/robinet de scurgere spre exterior — doar golire manuală. Riscul: acumulare de lichid lângă zona tehnică (ESP32, sursă 24V, compresor) dacă tava nu e golită la timp.
**Recomandare:** adaugă un furtun de scurgere de la tavă către un recipient extern sau canalizare, cu robinet manual sau senzor de nivel care alertează operatorul.

### 3. Inginer electronic / automatizări

**Constatare importantă — o singură pompă pentru 2 tipuri de vin.** BOM-ul (specificatie.html) listează **1 singură pompă peristaltică** dar **2 dozatoare** (Alb + Roșu). Cu o singură pompă pentru 2 canale, fie vinurile se amestecă pe același traseu (risc de contaminare încrucișată gust/culoare între alb și roșu, inacceptabil pentru un produs alimentar), fie lipsește o pompă din listă.
**Recomandare — corecție necesară, nu opțională:** BOM trebuie să aibă **2 pompe peristaltice** (una per culoare), cu tubulatură complet separată de la BIB până la duză. Cost suplimentar: +80 EUR (o pompă în plus), care schimbă totalul BOM de la ~1.660 EUR la ~1.740 EUR.

**Constatare — telecomandă RF 433MHz fără cod rotativ (rolling code).** Un RF simplu ASK/OOK poate fi "capturat și redat" cu un dispozitiv ieftin (~10-30 USD), permițând cuiva să declanșeze dozarea fără operator. Cum aparatul e operat de vânzător (nu e self-service pentru public), riscul e mai degrabă legat de pierderi/fraudă internă decât de securitate publică.
**Recomandare:** dacă vrei trasabilitate/audit pe fiecare dozare (util fiscal și pentru control de gestiune), ia în calcul un tastatură/cititor de cod pentru operator conectat direct la ESP32, cu jurnal MQTT al fiecărei dozări (cantitate, oră, operator) — util și pentru raportare fiscală a vânzărilor de vin la pahar/litru.

### 4. Auditor siguranță alimentară / HACCP

**Constatare — materialele "FDA" nu sunt suficiente pentru piața UE.** BOM menționează "tub siliconic FDA" — FDA e un standard **american**, nu certificare validă pentru piața din România/UE/Moldova. Pentru părțile în contact cu vinul (tuburi, duze, dozatoare), ai nevoie de conformitate cu **Regulamentul (CE) 1935/2004** și **(UE) 10/2011** (materiale plastice/elastomeri în contact cu alimente) — verifică fișa tehnică/certificatul de la furnizor și cere explicit conformitate UE, nu doar FDA.

**Constatare — ciclul CIP la schimbarea BIB e rezonabil pentru vin (spre deosebire de lapte), dar planul HACCP trebuie validat oficial** înainte de comercializare, nu doar documentat intern. Recomand un audit HACCP de la un consultant/organism certificat din România sau Moldova înainte de lansare, mai ales dacă aparatul va fi folosit de mai mulți operatori/locații.

### 5. Consultant juridic & business

**Constatare importantă — terminologia de "mașină de vending" poate crea o presupunere legală greșită.** Documentul tău descrie corect fluxul: **vânzătorul** verifică vârsta și încasează plata, apoi declanșează dozarea prin telecomandă — deci NU e un automat self-service pentru publicul larg, ci o **stație de dozare asistată**. Recomand ca în toată documentația comercială/marketing să folosești explicit "stație de dozare asistată" sau "dispenser vin cu operator", nu "automat de vânzare" — unele reglementări privind vânzarea de alcool în vrac (verificare vârstă, accize, trasabilitate) tratează diferit un vending machine autonom față de un echipament operat de personal. **De verificat cu un avocat/consultant fiscal specializat în comerț cu alcool** înainte de comercializare în România/Moldova — inclusiv reguli privind accizele pentru vin vândut la pahar/litru din vrac (diferă de vinul îmbuteliat).

**Constatare — costurile din BOM sunt estimări proprii, nu oferte confirmate.** Totalul de ~1.660 EUR (respectiv ~1.740 EUR cu a doua pompă) nu are surse citate — sunt cifre estimative. Cea mai mare linie (cabinetul AISI 304, 450 EUR) probabil nu include manopera de sudură + șlefuire + pasivare pentru un finisaj alimentar, care poate fi o sumă semnificativă separat de cei 250 EUR de "Montaj + Asamblare".
**Recomandare:** cere oferte reale de la 2-3 ateliere de inox din Suceava/regiune înainte de a considera acest buget final — mai ales pentru manopera de sudură pe suprafețe vizibile (finisaj estetic).

## Sinteză — prioritizare acțiuni înainte de tăiere

1. **Blocant, de rezolvat înainte de tăiere P3:** stabiliți poziția reală a compresorului/condensatorului și dimensiunea corectă a ventilației — evită tăierea greșită a peretelui dreapta.
2. **Blocant, de rezolvat înainte de comandă componente:** corectați BOM-ul cu a 2-a pompă peristaltică (Alb separat de Roșu).
3. **Recomandat înainte de sudură:** adăugați scheletul intern de rigidizare și a 2-a pereche de balamale pe ușă (U2) — implică ajustări minore pe piesele deja generate, nu pe cotele exterioare.
4. **Recomandat înainte de comercializare:** izolație completă (nu doar peretele spate), certificare UE pentru materialele în contact cu vinul, audit HACCP oficial, verificare juridică asupra terminologiei "vending" și accizelor.
5. **De confirmat cu furnizorii înainte de a cumpăra:** sarcina reală a picioarelor reglabile, ofertă fermă pentru cabinet + manoperă sudură/pasivare.

## Fișiere livrate

- **15 fișiere DXF** (`WineVendPro_DXF_CNC.zip`), unul per piesă, gata pentru CNC — layere separate: `TAIERE`/`GAURI` (de tăiat), `INDOIRE` (referință îndoire, NU se taie), `COTE` (text informativ, nu se taie). Toate cotele exacte din desenele tale (poziții găuri confirmate din text: găuri picior, găuri dozatoare S4, gaură zăvor U4, decupaj LCD U5, fante grilă S6). Pozițiile fără cotă explicită în sursă (balamale U1, fante ventilare P3, LED-uri U5) sunt marcate clar "aproximativ" direct pe desen — verificați înainte de tăiere.
- **Acest raport** (PDF + Markdown).

Lista completă a celor 17 piese din BOM, cu material/grosime/cantitate, e în tabelul original din `productie.html` — DXF-urile acoperă cele 15 piese de tăiat din tablă (piciorele reglabile, poziția #17, se cumpără, nu se taie).
