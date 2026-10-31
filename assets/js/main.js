/* SucréBio · script commun à toutes les pages
   Dépend de : assets/js/donnees.js (window.SB_DATA) et assets/js/i18n-en.js (window.SB_EN),
   chargés juste avant ce fichier. */
(() => {
  const D = window.SB_DATA || {};
  const EN = window.SB_EN || {};
  const ENT = D.entreprise || {};
  const WA_NUMBER = ENT.whatsapp || '221761425530';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get(k){ try { return localStorage.getItem(k); } catch { return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch {} } };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  /* ---------- i18n ----------
     Le français est lu dans le HTML de la page ; l'anglais vient de SB_EN. */
  const FR = {};
  $$('[data-i18n]').forEach(el => { FR[el.dataset.i18n] ??= el.textContent; });
  $$('[data-i18n-html]').forEach(el => { FR[el.dataset.i18nHtml] ??= el.innerHTML; });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => { const [a,k] = p.split(':'); FR[k] ??= el.getAttribute(a); }));

  /* Textes utilisés seulement par le JavaScript (rendus dynamiques, messages) */
  const UI = {
    fr:{ theme:'Mode sombre', themeL:'Mode clair', sample:"Exemple d'avis", stars:'5 sur 5',
         err:{ req:'Ce champ est obligatoire.', name:'Indiquez votre nom (2 caractères minimum).', phone:'Numéro invalide (8 chiffres minimum).', mail:'Adresse e-mail invalide.', msg:'Votre message est trop court (10 caractères minimum).' },
         sent:'WhatsApp s’ouvre avec votre message.', check:'Merci de corriger les champs en rouge.', waMsg:'Bonjour, je souhaite en savoir plus sur SucréBio', formIntro:'Nouveau message depuis le site SucréBio',
         status:{ disponible:'Disponible', bientot:'Bientôt', prochaine_etape:'Prochaine étape' },
         prod:{ format:'Format', ingredients:'Ingrédients', conservation:'Conservation', origine:'Origine', prix:'Prix', surDemande:'Sur demande, par WhatsApp' },
         ent:{ rs:'Raison sociale', marque:'Marque', fondateur:'Fondateur', adresse:'Siège', tel:'Téléphone / WhatsApp', email:'E-mail', emailCom:'E-mail commercial', rccm:'RCCM', ninea:'NINEA', todo:'à compléter' },
         rsEmpty:'La liste détaillée de nos revendeurs arrive bientôt. En attendant, demandez-nous le point de vente le plus proche de chez vous.', rsAsk:'Demander sur WhatsApp', rsJoin:'Devenir distributeur', formIntroDist:'Demande de distribution depuis le site SucréBio',
         pub:{ blog:'Blog', actualite:'Actualité', exemple:'Exemple', read:'Lire la suite →', empty:'Aucune publication pour le moment.', back:'← Toutes les publications', backBlog:'← Retour au blog', backNews:'← Retour aux actualités', missing:'Cette publication est introuvable.', others:'À lire aussi', home:'Accueil', pubs:'Publications' },
         band:{ label:'Galerie SucréBio', pause:'Mettre en pause le défilement', play:'Relancer le défilement' },
         vid:{ soon:'Vidéo à venir', play:'Lire la vidéo', list:'Choisir une vidéo', yt:'Ouvrir sur YouTube', cat:{ produit:'Produit', 'autre-produit':'Autre produit', evenement:'Événement' } } },
    en:{ theme:'Dark mode', themeL:'Light mode', sample:'Sample review', stars:'5 out of 5',
         err:{ req:'This field is required.', name:'Please enter your name (at least 2 characters).', phone:'Invalid number (at least 8 digits).', mail:'Invalid email address.', msg:'Your message is too short (at least 10 characters).' },
         sent:'WhatsApp is opening with your message.', check:'Please fix the fields in red.', waMsg:'Hello, I would like to know more about SucréBio', formIntro:'New message from the SucréBio website',
         status:{ disponible:'Available', bientot:'Coming soon', prochaine_etape:'Next step' },
         prod:{ format:'Format', ingredients:'Ingredients', conservation:'Storage', origine:'Origin', prix:'Price', surDemande:'On request, via WhatsApp' },
         ent:{ rs:'Company name', marque:'Brand', fondateur:'Founder', adresse:'Head office', tel:'Phone / WhatsApp', email:'Email', emailCom:'Sales email', rccm:'RCCM', ninea:'NINEA', todo:'to be completed' },
         rsEmpty:'Our detailed list of resellers is coming soon. In the meantime, ask us for the nearest point of sale.', rsAsk:'Ask on WhatsApp', rsJoin:'Become a distributor', formIntroDist:'Distributor application from the SucréBio website',
         pub:{ blog:'Blog', actualite:'News', exemple:'Example', read:'Read more →', empty:'No publications yet.', back:'← All publications', backBlog:'← Back to the blog', backNews:'← Back to the news', missing:'This publication could not be found.', others:'Read also', home:'Home', pubs:'Publications' },
         band:{ label:'SucréBio gallery', pause:'Pause the scrolling', play:'Resume the scrolling' },
         vid:{ soon:'Video coming soon', play:'Play the video', list:'Choose a video', yt:'Open on YouTube', cat:{ produit:'Product', 'autre-produit':'Other product', evenement:'Event' } } }
  };

  let lang = store.get('sb-lang') === 'en' ? 'en' : 'fr';
  const t = k => (lang === 'en' ? EN : FR)[k] ?? FR[k] ?? k;
  const L = obj => (obj && typeof obj === 'object' && !Array.isArray(obj)) ? (obj[lang] ?? obj.fr ?? '') : (obj ?? '');
  const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg ?? UI[lang].waMsg)}`;
  const wireWa = (root = document) => {
    $$('[data-wa]', root).forEach(a => { a.href = waLink(); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-wa-chat]', root).forEach(a => { a.href = waLink(); a.target = '_blank'; a.rel = 'noopener'; });
  };

  /* ---------- Rendus à partir de la base de données ---------- */
  const RENDER = {
    temoignages(el){
      el.innerHTML = (D.temoignages || []).map(r => `
        <figure class="review">
          ${r.exemple ? `<span class="tag-sample">${UI[lang].sample}</span>` : ''}
          <div class="stars" aria-label="${UI[lang].stars.replace('5', r.note ?? 5)}">${'★'.repeat(r.note ?? 5)}</div>
          <blockquote>${esc(L(r.texte))}</blockquote>
          <figcaption class="who"><span class="avatar" style="background:${esc(r.couleur || 'var(--green-700)')}">${esc((r.nom || '?')[0])}</span><div><strong>${esc(r.nom)}</strong><small>${esc(L(r.lieu))}</small></div></figcaption>
        </figure>`).join('');
    },
    faq(el){
      el.innerHTML = (D.faq || []).map((q, i) => `
        <details name="faq" id="q-${esc(q.id)}"${i === 0 ? ' open' : ''}><summary>${esc(L(q.question))}</summary><div class="ans"><p>${L(q.reponse)}</p></div></details>`).join('');
      if (location.hash.startsWith('#q-')) { const d = $(location.hash); if (d) { d.open = true; d.scrollIntoView(); } }
    },
    villes(el){
      const cls = { disponible:'on', bientot:'next' };
      el.innerHTML = ((D.points_de_vente || {}).villes || []).map(v =>
        `<li class="${cls[v.statut] || ''}"><div><strong>${esc(L(v.nom))}</strong><small>${UI[lang].status[v.statut] || ''}</small></div></li>`).join('');
    },
    revendeurs(el){
      const list = (D.points_de_vente || {}).revendeurs || [];
      if (!list.length) {
        el.innerHTML = `<div class="empty"><p>${UI[lang].rsEmpty}</p>
          <div class="hero__cta" style="justify-content:center;margin:0"><a class="btn" data-wa href="#"><svg aria-hidden="true"><use href="#i-wa"/></svg><span>${UI[lang].rsAsk}</span></a>
          <a class="btn btn--ghost" href="devenir-distributeur.html">${UI[lang].rsJoin}</a></div></div>`;
        return;
      }
      el.innerHTML = `<div class="stockists">${list.map(r => `
        <article class="card"><div class="ico"><svg aria-hidden="true"><use href="#i-pin"/></svg></div>
          <h3>${esc(r.nom)}</h3><p>${esc(L(r.adresse))}</p><small>${esc(r.ville)}${r.type ? ' · ' + esc(L(r.type)) : ''}${r.telephone ? ' · ' + esc(r.telephone) : ''}</small></article>`).join('')}</div>`;
    },
    produit(el){
      const p = (D.produits || [])[0]; if (!p) return;
      const P = UI[lang].prod;
      const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
      el.innerHTML = row(P.format, esc(L(p.format)))
        + row(P.ingredients, (p.ingredients || []).map(i => esc(L(i))).join('<br>'))
        + row(P.conservation, esc(L(p.conservation)))
        + row(P.origine, esc(L(p.origine)))
        + row(P.prix, p.prix_xof ? `${Number(p.prix_xof).toLocaleString(lang === 'en' ? 'en' : 'fr')} F CFA` : `<a data-wa href="#">${P.surDemande}</a>`);
    },
    publications(el){
      const P = UI[lang].pub, type = el.dataset.type, limit = +el.dataset.limit || Infinity;
      const list = pubsSorted().filter(p => !type || p.type === type).slice(0, limit);
      el.innerHTML = list.length ? list.map(postCard).join('') : `<div class="empty" style="grid-column:1/-1"><p>${P.empty}</p></div>`;
    },
    article(el){
      const P = UI[lang].pub, id = new URLSearchParams(location.search).get('id');
      const a = (D.publications || []).find(p => p.id === id);
      if (!a) {
        el.innerHTML = `<section class="section"><div class="wrap center"><p class="lead" style="margin-inline:auto">${P.missing}</p>
          <p><a class="btn" href="blog.html">${P.blog}</a> <a class="btn btn--ghost" href="actualites.html">${P.actualite}</a></p></div></section>`;
        return;
      }
      const parent = a.type === 'blog' ? 'blog.html' : 'actualites.html';
      $$(`.nav a[href="${parent}"], #drawer a[href="${parent}"], .footer a[href="${parent}"]`).forEach(x => x.setAttribute('aria-current', 'page'));
      document.title = `${L(a.titre)} | SucréBio`;
      const others = pubsSorted().filter(p => p.id !== a.id).slice(0, 3);
      el.innerHTML = `
        <section class="page-hero"><div class="wrap">
          <ol class="crumbs" aria-label="${lang === 'en' ? 'Breadcrumb' : "Fil d'Ariane"}"><li><a href="index.html">${P.home}</a></li><li>${P.pubs}</li><li><a href="${parent}">${P[a.type]}</a></li></ol>
          <p class="eyebrow">${P[a.type]} · ${fmtDate(a.date)}</p>
          <h1>${esc(L(a.titre))}</h1>
          <p class="lead">${esc(L(a.resume))}</p>
          ${a.exemple ? `<p style="margin-top:1rem"><span class="tag-sample">${P.exemple}</span></p>` : ''}
        </div></section>
        <section class="section section--tight"><div class="wrap">
          <article class="prose article">
            ${a.image ? `<img class="article__cover" src="${esc(a.image)}" alt="" loading="lazy">` : ''}
            ${L(a.contenu)}
            <p style="margin-top:2.5rem"><a href="${parent}">${a.type === 'blog' ? P.backBlog : P.backNews}</a></p>
          </article>
        </div></section>
        ${others.length ? `<section class="section section--tight band"><div class="wrap"><h2 style="font-size:var(--fs-h3)">${P.others}</h2><div class="posts" style="margin-top:1.5rem">${others.map(postCard).join('')}</div></div></section>` : ''}`;
    },
    /* Bande de photos qui défile en haut de page (base-de-donnees/galerie.json : une liste d'images par page).
       data-galerie : liste à utiliser ; data-depart : image de départ ; data-sens="inverse" : défile vers la droite. */
    bandeau(el){
      const G = (D.galerie || {})[el.dataset.galerie] || [], B = UI[lang].band;
      if (!G.length) { el.hidden = true; return; }
      const k = (+el.dataset.depart || 0) % G.length;
      let list = [...G.slice(k), ...G.slice(0, k)];
      while (list.length < 8) list = list.concat(list.slice(0, 8 - list.length)); /* assez d'images pour couvrir les grands écrans */
      const item = (g, dup) => `<li class="photo-band__item${g.badge ? ' is-badge' : ''}${g.format === 'portrait' ? ' is-portrait' : ''}"${dup ? ' aria-hidden="true"' : ''}><img src="${esc(g.image)}" alt="${dup ? '' : esc(L(g.alt))}" width="${g.badge ? 180 : 320}" height="240" loading="lazy" decoding="async"></li>`;
      const paused = el.classList.contains('is-paused');
      el.setAttribute('role', 'region'); el.setAttribute('aria-label', B.label);
      el.style.setProperty('--n', list.length);
      el.innerHTML = `<ul class="photo-band__track">${list.map((g, i) => item(g, i >= G.length)).join('')}${list.map(g => item(g, true)).join('')}</ul>
        <button class="photo-band__toggle" type="button" aria-pressed="${paused}" aria-label="${paused ? B.play : B.pause}"><svg aria-hidden="true"><use href="#i-${paused ? 'play' : 'pause'}"/></svg></button>`;
      $('.photo-band__toggle', el).addEventListener('click', () => { el.classList.toggle('is-paused'); RENDER.bandeau(el); $('.photo-band__toggle', el).focus(); });
    },
    /* Espace vidéo (base-de-donnees/videos.json). data-page : n'affiche que les vidéos prévues pour cette page. */
    videos(el){
      const V = UI[lang].vid, page = el.dataset.page;
      const list = (D.videos || []).filter(v => !page || !v.pages || v.pages.includes(page));
      const sec = el.closest('section');
      if (!list.length) { if (sec) sec.hidden = true; return; }
      const cur = Math.min(+el.dataset.cur || 0, list.length - 1), v = list[cur];
      const ytId = v.type === 'youtube' && v.source ? String(v.source).replace(/.*(?:youtu\.be\/|v=|embed\/|shorts\/)/, '').replace(/[?&#].*/, '') : '';
      const poster = v.affiche || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '');
      const cat = `<span class="vid__cat">${esc(V.cat[v.categorie] || '')}</span>`;
      let stage;
      if (!v.source) {
        stage = `<div class="vid__frame is-soon">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ''}<span class="vid__soon"><svg aria-hidden="true"><use href="#i-play"/></svg>${V.soon}</span></div>`;
      } else if (v.type === 'fichier') {
        stage = `<div class="vid__frame"><video controls preload="none" playsinline${poster ? ` poster="${esc(poster)}"` : ''}><source src="${esc(v.source)}"></video></div>`;
      } else {
        stage = `<div class="vid__frame"><button class="vid__play" type="button" aria-label="${V.play} : ${esc(L(v.titre))}">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ''}<span class="vid__btn"><svg aria-hidden="true"><use href="#i-play"/></svg></span></button></div>`;
      }
      el.innerHTML = `<div class="vid__main">${stage}
          <div class="vid__info">${cat}<h3>${esc(L(v.titre))}</h3><p>${esc(L(v.description))}</p>${ytId ? `<a class="vid__yt" href="https://www.youtube.com/watch?v=${esc(ytId)}" target="_blank" rel="noopener">${V.yt} ↗</a>` : ''}</div></div>
        ${list.length > 1 ? `<ul class="vid__list" aria-label="${V.list}">${list.map((x, i) => `<li><button type="button" data-i="${i}"${i === cur ? ' aria-current="true"' : ''}>
          <span class="vid__thumb">${x.affiche ? `<img src="${esc(x.affiche)}" alt="" loading="lazy" decoding="async">` : ''}<svg aria-hidden="true"><use href="#i-play"/></svg></span>
          <span><small>${esc(V.cat[x.categorie] || '')}${x.source ? '' : ` · ${V.soon}`}</small><strong>${esc(L(x.titre))}</strong></span></button></li>`).join('')}</ul>` : ''}`;
      $$('.vid__list button', el).forEach(b => b.addEventListener('click', () => { el.dataset.cur = b.dataset.i; RENDER.videos(el); $(`.vid__list button[data-i="${b.dataset.i}"]`, el)?.focus(); }));
      $('.vid__play', el)?.addEventListener('click', e => {
        e.currentTarget.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0" title="${esc(L(v.titre))}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      });
    },
    entreprise(el){
      const E = UI[lang].ent, todo = `<span class="todo">${E.todo}</span>`;
      const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
      el.innerHTML = row(E.rs, esc(ENT.raison_sociale)) + row(E.marque, esc(ENT.marque)) + row(E.fondateur, esc(ENT.fondateur))
        + row(E.adresse, esc(L(ENT.adresse)))
        + row(E.tel, `<a data-wa href="#">${esc(ENT.telephone_affiche)}</a>`)
        + row(E.email, `<a href="mailto:${esc(ENT.email)}">${esc(ENT.email)}</a>`)
        + (ENT.email_commercial ? row(E.emailCom, `<a href="mailto:${esc(ENT.email_commercial)}">${esc(ENT.email_commercial)}</a>`) : '')
        + row(E.rccm, ENT.rccm ? esc(ENT.rccm) : todo) + row(E.ninea, ENT.ninea ? esc(ENT.ninea) : todo);
    }
  };
  function pubsSorted(){ return [...(D.publications || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))); }
  function fmtDate(d){ try { return new Date(d + 'T12:00:00').toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day:'numeric', month:'long', year:'numeric' }); } catch { return d; } }
  function postCard(p){
    const P = UI[lang].pub;
    return `<a class="card post" href="article.html?id=${encodeURIComponent(p.id)}">
      ${p.image ? `<div class="post__img"><img src="${esc(p.image)}" alt="" loading="lazy"></div>` : ''}
      <div class="post__meta"><span class="post__type">${P[p.type] || ''}</span>${p.exemple ? `<span class="tag-sample">${P.exemple}</span>` : ''}<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time></div>
      <h3>${esc(L(p.titre))}</h3><p>${esc(L(p.resume))}</p><span class="go">${P.read}</span></a>`;
  }
  function renderAll(){
    $$('[data-render]').forEach(el => { const f = RENDER[el.dataset.render]; if (f) { try { f(el); } catch (e) { console.error('Rendu', el.dataset.render, e); } } });
    $$('[data-bind]').forEach(el => { const v = ENT[el.dataset.bind]; if (!v) return; el.textContent = L(v); const a = el.closest('a[href^="mailto:"]'); if (a && /^email/.test(el.dataset.bind)) a.href = 'mailto:' + v; });
  }

  function applyLang(l){
    lang = l; store.set('sb-lang', l);
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(p => { const [a,k] = p.split(':'); el.setAttribute(a, t(k)); }));
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    renderAll();
    wireWa();
    updateThemeLabel();
    if (chatStarted) resetChat();
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- Thème clair / sombre ---------- */
  const themeBtn = $('#themeBtn');
  const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  function updateThemeLabel(){ if (themeBtn) themeBtn.querySelector('span').textContent = isDark() ? UI[lang].themeL : UI[lang].theme; }
  themeBtn?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    const run = () => { document.documentElement.dataset.theme = next; store.set('sb-theme', next); updateThemeLabel(); };
    document.startViewTransition ? document.startViewTransition(run) : run();
  });

  /* ---------- En-tête, barre de progression, retour en haut ---------- */
  const header = $('.header'), toTop = $('#toTop'), progress = $('#progress');
  const noScrollTimeline = !CSS.supports('animation-timeline', 'scroll()');
  let ticking = false;
  function onScroll(){
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    toTop.classList.toggle('show', y > 600);
    if (noScrollTimeline) { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`; }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive:true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  /* Menus déroulants (Partenaires, Publications) */
  const dds = $$('.dd');
  const closeDd = (except) => dds.forEach(d => { if (d !== except) { d.classList.remove('open'); $('.dd__btn', d).setAttribute('aria-expanded', 'false'); } });
  dds.forEach(d => {
    const b = $('.dd__btn', d);
    b.addEventListener('click', () => { const open = !d.classList.contains('open'); closeDd(d); d.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape' && d.classList.contains('open')) { closeDd(); b.focus(); } });
    d.addEventListener('focusout', e => { if (!d.contains(e.relatedTarget)) closeDd(); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeDd(); });

  /* Menu mobile : se ferme quand on choisit un lien */
  const drawer = $('#drawer');
  $$('#drawer a').forEach(a => a.addEventListener('click', () => { try { drawer.hidePopover(); } catch {} }));
  if (!('popover' in HTMLElement.prototype)) {
    drawer.style.display = 'none';
    $$('[popovertarget="drawer"]').forEach(b => b.addEventListener('click', () => { drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none'; drawer.style.position='fixed'; drawer.style.translate='0 0'; drawer.style.zIndex=90; }));
  }

  /* Apparition au défilement (secours si les animations pilotées par le scroll ne sont pas prises en charge) */
  if (!CSS.supports('animation-timeline', 'view()') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin:'0px 0px -8% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- Toast ---------- */
  const toast = $('#toast'); let toastTimer;
  function showToast(msg){ toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3800); }

  /* ---------- Formulaires -> WhatsApp (contact.html, devenir-distributeur.html) ----------
     Pas de serveur : le message est préparé puis ouvert dans WhatsApp. */
  const labelOf = el => { const l = el.labels?.[0]?.cloneNode(true); if (!l) return el.name; $$('.opt', l).forEach(o => o.remove()); return l.textContent.trim(); };
  function validate(el){
    const E = UI[lang].err, v = el.value.trim(); let msg = '';
    if (el.required && !v) msg = E.req;
    else if (['name', 'business', 'city'].includes(el.name) && el.required && v.length < 2) msg = E.name;
    else if (el.name === 'phone' && v.replace(/\D/g,'').length < 8) msg = E.phone;
    else if (el.name === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = E.mail;
    else if (el.name === 'message' && el.required && v.length < 10) msg = E.msg;
    el.setCustomValidity(msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const err = el.parentElement.querySelector('.err'); if (err) err.textContent = msg;
    return !msg;
  }
  $$('#contactForm, [data-wa-form]').forEach(form => {
    const sujet = new URLSearchParams(location.search).get('sujet');
    const subj = $('select[name="subject"]', form);
    if (sujet && subj && $(`option[value="${CSS.escape(sujet)}"]`, subj)) subj.value = sujet;
    const fields = $$('input,select,textarea', form);
    fields.forEach(el => {
      el.addEventListener('blur', () => validate(el));
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = fields.map(validate).every(Boolean);
      if (!ok) { showToast(UI[lang].check); fields.find(f => f.getAttribute('aria-invalid') === 'true')?.focus(); return; }
      const lines = fields.filter(f => f.name !== 'message' && f.value.trim())
        .map(f => `${labelOf(f)} : ${f.tagName === 'SELECT' ? f.selectedOptions[0].textContent : f.value.trim()}`);
      const msg = $('[name="message"]', form)?.value.trim();
      const text = `${UI[lang][form.dataset.intro || 'formIntro']}\n\n${lines.join('\n')}${msg ? `\n\n${msg}` : ''}`;
      window.open(waLink(text), '_blank', 'noopener');
      showToast(UI[lang].sent);
      form.reset(); fields.forEach(f => { f.removeAttribute('aria-invalid'); f.setCustomValidity(''); const er = f.parentElement.querySelector('.err'); if (er) er.textContent = ''; });
    });
  });

  /* ---------- Assistant (chatbot à mots-clés, réponses dans base-de-donnees/chatbot.json) ---------- */
  const chat = $('#chat'), body = $('#chatBody'), quick = $('#quick'), input = $('#chatInput');
  let chatStarted = false;
  const KB = l => {
    const kb = (D.chatbot || {})[l] || { accueil:'', suggestions:[], repli:'', regles:[] };
    kb._re ??= kb.regles.map(r => [new RegExp(r.motifs, 'i'), r.reponse]);
    return kb;
  };
  function addMsg(html, who){
    const m = document.createElement('div'); m.className = 'msg msg--' + who;
    if (who === 'me') m.textContent = html; else m.innerHTML = html;
    wireWa(m);
    body.append(m); body.scrollTop = body.scrollHeight;
  }
  function botReply(text){
    const typing = document.createElement('div'); typing.className = 'msg msg--bot typing'; typing.innerHTML = '<i></i><i></i><i></i>'; typing.setAttribute('aria-label','…');
    body.append(typing); body.scrollTop = body.scrollHeight;
    const kb = KB(lang), hit = kb._re.find(([re]) => re.test(text));
    setTimeout(() => { typing.remove(); addMsg(hit ? hit[1] : kb.repli, 'bot'); }, 650 + Math.random() * 400);
  }
  function ask(text){ if (!text.trim()) return; addMsg(text, 'me'); botReply(text); }
  function resetChat(){
    body.innerHTML = ''; quick.innerHTML = '';
    addMsg(KB(lang).accueil, 'bot');
    KB(lang).suggestions.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', () => ask(c)); quick.append(b); });
  }
  function openChat(){ if (!chatStarted) { chatStarted = true; resetChat(); } chat.show(); input.focus(); }
  $('#chatBtn').addEventListener('click', () => chat.open ? chat.close() : openChat());
  $('#chatClose').addEventListener('click', () => chat.close());
  chat.addEventListener('keydown', e => { if (e.key === 'Escape') chat.close(); });
  chat.addEventListener('close', () => $('#chatBtn').focus());
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });

  $('#yr').textContent = new Date().getFullYear();
  applyLang(lang);
})();
