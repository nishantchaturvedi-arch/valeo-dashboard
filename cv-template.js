/* Valeo caregiver CV — five landscape pages (A4, 1123 × 794 px), used by the dashboard
 * (Caregiver Profiles) and profile.html.
 *   valeoCV.html(p)       → HTML of the CV pages
 *   valeoCV.fit(root)     → after the CV is in the page: shrinks text that would not fit
 *   valeoCV.download(p)   → builds the PDF in the browser and downloads it
 * p = {name, headline, nationality, gender, languages[], experience_years, location, photo,
 *      summary, skills[] ("Title: detail"), education[] (lines), training[] (lines),
 *      jobs:[{title, employer, location, dates, duties[]}], banner1, banner2, quote}
 * Older profile shapes (role / objective / education objects / experience) are mapped by norm(). */
(function(){
  var NAVY = '#0E3A5E', YELLOW = '#FFB900', CREAM = '#FFF4D6', W = 1123, H = 794;
  var LOGO = 'data:image/jpeg;base64,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';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function fonts(){
    if(document.getElementById('vcv-fonts')) return;
    var l = document.createElement('link'); l.id = 'vcv-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }
  function list(a){ return (Array.isArray(a) ? a : String(a || '').split(/\n|;/)).map(function(x){ return String(x == null ? '' : x).trim(); }).filter(Boolean); }
  // accept old and new profile shapes
  function norm(p){
    p = p || {};
    var edu = [], tr = list(p.training);
    if(Array.isArray(p.education)) p.education.forEach(function(e){
      var line = typeof e === 'string' ? e : [e.title, e.detail].filter(Boolean).join(', ');
      if(!line) return;
      if(typeof e !== 'string' && !p.training && /certif|course|training|support|aid|cpr|nc\s*ii/i.test(e.title || '')) tr.push(line); else edu.push(line);
    }); else edu = list(p.education);
    if(p.certified && !tr.length) tr = list(p.certified);
    var jobs = (Array.isArray(p.jobs) ? p.jobs : []).slice();
    if(!jobs.length && Array.isArray(p.experience)) jobs = p.experience.map(function(e){
      var t = String(e.title || ''), m = t.split(/\s+[–—|-]\s+/), sub = String(e.sub || ''), d = sub.match(/\(([^)]*\d{4}[^)]*)\)\s*$/);
      return {title:m[0] || t, employer:m.slice(1).join(' – '), location:d ? sub.replace(d[0], '').trim().replace(/,$/, '') : sub, dates:d ? d[1] : '', duties:e.bullets || []};
    });
    jobs = jobs.map(function(j){ return {title:j.title || '', employer:j.employer || '', location:j.location || '', dates:j.dates || '', duties:list(j.duties || j.bullets)}; })
      .filter(function(j){ return j.title || j.employer || j.duties.length; });
    var summary = String(p.summary || p.objective || p.bio || '').trim();
    return {
      name: String(p.display_name || p.name || 'Caregiver').trim(), headline: p.headline || p.role || 'Caregiver',
      nationality: p.nationality || '', gender: p.gender || '', languages: list(Array.isArray(p.languages) ? p.languages.join(';') : String(p.languages || '').replace(/,(?![^(]*\))/g, ';')),
      years: p.experience_years || '', location: p.location || p.city_label || '', photo: p.photo || '',
      summary: summary, skills: list(p.skills && p.skills.length ? p.skills : p.specialties), education: edu, training: tr, jobs: jobs,
      banner1: p.banner1 == null ? 'Dedicated. Nurturing. Trustworthy.' : p.banner1, banner2: p.banner2 == null ? 'Delivering loving care and a safe, healthy environment for every child.' : p.banner2,
      quote: p.quote || (summary.match(/^[^.!?]+[.!?]/) || [''])[0]
    };
  }
  // ── icons (line icons, drawn as images so the PDF renderer keeps them) ──
  var I = {
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', gender:'<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
    lang:'<path d="M4 5h9v7H8l-4 3zM13 9h7v7h-3l-4 3v-3"/>', star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    pin:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z"/>',
    cap:'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>', check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    plus:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>', award:'<circle cx="12" cy="9" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8"/>',
    bottle:'<path d="M9 3h6M10 3v3l-2 3v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9l-2-3V3M8 13h8"/>', moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    bath:'<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>', blocks:'<rect x="3" y="12" width="8" height="8" rx="1"/><rect x="13" y="12" width="8" height="8" rx="1"/><rect x="8" y="3" width="8" height="8" rx="1"/>',
    shield:'<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>', spoon:'<path d="M7 3c-2 0-3 2-3 4s1.5 3.5 3 3.5V21M17 3v18M14 3v5a3 3 0 0 0 6 0V3"/>',
    child:'<circle cx="12" cy="6" r="3"/><path d="M7 21v-6l-2-4 7-1 7 1-2 4v6M12 10v11"/>', hand:'<path d="M7 11V5a1.5 1.5 0 0 1 3 0v5M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v7M16 12V8a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-7 7c-3 0-4.5-1.5-6-4l-2-4a1.5 1.5 0 0 1 2.6-1.5L7 14"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>', chat:'<path d="M4 5h16v11H9l-5 4z"/>', quote:'<path d="M10 7H6a2 2 0 0 0-2 2v4h5v5H4M20 7h-4a2 2 0 0 0-2 2v4h5v5h-5"/>'
  };
  function ic(k, col, sz){ var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="' + (col || NAVY) + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (I[k] || I.star) + '</svg>';
    return '<img class="vcv-i" style="width:' + (sz || 22) + 'px;height:' + (sz || 22) + 'px" alt="" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '">'; }
  function skillIcon(t){ t = String(t).toLowerCase();
    return /newborn|bottle|feed|formula|burp/.test(t) ? 'bottle' : /sleep|night|nap|bedtime/.test(t) ? 'moon' : /hygien|bath|diaper|nappy|clean/.test(t) ? 'bath'
      : /play|develop|learn|activit|montessori|educat/.test(t) ? 'blocks' : /safe|first aid|cpr|emergenc/.test(t) ? 'shield' : /meal|cook|food|nutri/.test(t) ? 'spoon'
      : /toddler|child|kid|twin/.test(t) ? 'child' : /elder|senior|mobility/.test(t) ? 'hand' : /homework|tutor|read/.test(t) ? 'book' : /communicat|parent|report/.test(t) ? 'chat' : 'heart'; }
  function split(s){ var i = String(s).indexOf(':'); return i > 0 && i < 60 ? [s.slice(0, i).trim(), s.slice(i + 1).trim()] : [String(s).trim(), '']; }
  function first(n){ return String(n || '').trim().split(/\s+/)[0] || ''; }
  var CSS = ''
    + '.vcv{font-family:Poppins,Arial,sans-serif;color:' + NAVY + ';-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    + '.vcv *{box-sizing:border-box}'
    + '.vcv-page{position:relative;width:' + W + 'px;height:' + H + 'px;background:#fff;overflow:hidden;border:3px solid #FFE6A0;border-radius:26px;margin-bottom:18px;page-break-after:always;break-after:page;--k:1}'
    + '.vcv-page:last-child{page-break-after:auto;break-after:auto}'
    + '.vcv-blob{position:absolute;border-radius:50%;background:' + CREAM + ';z-index:0}'
    + '.vcv-z{position:relative;z-index:1}'
    + '.vcv-tab{position:absolute;top:-3px;left:50%;transform:translateX(-50%);background:' + NAVY + ';color:#fff;font-weight:700;font-size:30px;padding:8px 46px 12px;border-radius:0 0 18px 18px;white-space:nowrap;z-index:2}'
    + '.vcv-tab.left{left:30px;transform:none}'
    + '.vcv-tab b{color:' + YELLOW + '}'
    + '.vcv-num{position:absolute;left:26px;bottom:22px;background:' + NAVY + ';color:#fff;font-size:13px;font-weight:600;padding:5px 14px;border-radius:999px;z-index:3}'
    + '.vcv-logo{position:absolute;right:24px;bottom:16px;background:#fff;border-radius:14px;padding:4px 14px;box-shadow:0 2px 10px rgba(14,58,94,.14);z-index:3}'
    + '.vcv-logo img{height:44px;width:auto;display:block}'
    + '.vcv-body{position:absolute;left:58px;right:58px;top:96px;bottom:84px;z-index:1}'
    + '.vcv-i{display:block;flex-shrink:0}'
    + '.vcv-h{display:flex;align-items:center;gap:14px;margin:0 0 calc(12px * var(--k))}'
    + '.vcv-h .vcv-dot{width:46px;height:46px;border-radius:50%;background:' + NAVY + ';display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.vcv-h h4{margin:0;font-size:calc(22px * var(--k));font-weight:800;letter-spacing:.3px;text-transform:uppercase;color:' + NAVY + '}'
    + '.vcv-h h4 span{color:' + YELLOW + '}'
    + '.vcv-p{font-size:calc(17px * var(--k));line-height:1.6;margin:0}'
    + '.vcv-ul{list-style:none;margin:0;padding:0;font-size:calc(15.5px * var(--k));line-height:1.5}'
    + '.vcv-ul li{position:relative;padding-left:20px;margin-bottom:calc(6px * var(--k))}'
    + '.vcv-ul li:before{content:"";position:absolute;left:2px;top:.55em;width:8px;height:8px;border-radius:50%;background:' + YELLOW + '}'
    + '.vcv-checks{display:grid;grid-template-columns:1fr 1fr;gap:calc(6px * var(--k)) 18px;font-size:calc(15.5px * var(--k))}'
    + '.vcv-checks div{display:flex;gap:8px;align-items:center;line-height:1.3}'
    /* page 1 */
    + '.vcv-photo{position:absolute;left:44px;top:40px;width:420px;height:560px;border-radius:210px 210px 30px 30px;border:7px solid ' + NAVY + ';background:#EEF2F6 center/cover no-repeat;z-index:1;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}'
    + '.vcv-photo .ph-ini{font-size:120px;font-weight:800;color:' + NAVY + ';opacity:.25;margin-bottom:180px}'
    + '.vcv-ring{position:absolute;left:30px;top:26px;width:448px;height:588px;border-radius:224px 224px 36px 36px;border:2px solid ' + YELLOW + ';z-index:0}'
    + '.vcv-r{position:absolute;left:520px;right:50px;top:58px;z-index:1}'
    + '.vcv-hello{font-size:34px;font-weight:500;line-height:1}'
    + '.vcv-name{font-size:62px;font-weight:800;line-height:1.02;margin:6px 0 10px;text-transform:uppercase;color:' + NAVY + ';word-break:break-word}'
    + '.vcv-name.long{font-size:48px}'
    + '.vcv-head{font-size:25px;font-weight:600;line-height:1.25;color:' + NAVY + '}'
    + '.vcv-div{display:flex;align-items:center;gap:10px;margin:16px 0 14px}'
    + '.vcv-div i{flex:1;height:2px;background:' + YELLOW + '}'
    + '.vcv-facts{display:flex;flex-direction:column;gap:9px;font-size:18px}'
    + '.vcv-facts div{display:flex;gap:12px;align-items:flex-start;line-height:1.35}'
    + '.vcv-facts b{font-weight:700}'
    + '.vcv-banner{position:absolute;left:60px;width:720px;top:612px;min-height:96px;background:' + CREAM + ';border-radius:22px;display:flex;align-items:center;gap:18px;padding:14px 24px 14px 16px;z-index:2;box-shadow:0 4px 18px rgba(14,58,94,.08)}'
    + '.vcv-banner .bd{width:64px;height:64px;border-radius:50%;background:' + NAVY + ';display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.vcv-banner b{display:block;font-size:20px;font-weight:800;letter-spacing:.4px;text-transform:uppercase}'
    + '.vcv-banner span{font-size:16px;line-height:1.4}'
    /* page 3 */
    + '.vcv-spec{display:grid;grid-template-columns:repeat(4,1fr);row-gap:28px}'
    + '.vcv-spec div{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:6px 12px;border-right:1px solid #EFE6CC;font-weight:600;font-size:calc(16px * var(--k))}'
    + '.vcv-spec div:nth-child(4n){border-right:0}'
    + '.vcv-spec .sc{width:92px;height:92px;border-radius:50%;background:' + CREAM + ';border:2px solid ' + YELLOW + ';display:flex;align-items:center;justify-content:center}'
    /* page 4 */
    + '.vcv-job{display:flex;gap:18px;position:relative;padding-bottom:calc(18px * var(--k))}'
    + '.vcv-job .jl{display:flex;flex-direction:column;align-items:center;flex-shrink:0}'
    + '.vcv-job .jd{width:42px;height:42px;border-radius:50%;background:' + NAVY + ';display:flex;align-items:center;justify-content:center}'
    + '.vcv-job .jline{flex:1;width:2px;background:' + YELLOW + ';margin-top:4px}'
    + '.vcv-job:last-child .jline{display:none}'
    + '.vcv-job .jt{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}'
    + '.vcv-job .jt b{font-size:calc(17.5px * var(--k));font-weight:700;line-height:1.35}'
    + '.vcv-job .jt em{font-style:normal;background:' + CREAM + ';border-radius:999px;padding:3px 12px;font-size:calc(13px * var(--k));font-weight:600;white-space:nowrap}'
    + '.vcv-job .vcv-ul{margin-top:6px;font-size:calc(14.5px * var(--k))}'
    /* page 5 */
    + '.vcv-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}'
    + '.vcv-tiles div{border:2px solid #FFE6A0;border-radius:16px;padding:calc(14px * var(--k)) 12px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;background:#fff}'
    + '.vcv-tiles b{font-size:calc(15px * var(--k));font-weight:700;line-height:1.3}'
    + '.vcv-tiles span{font-size:calc(12.5px * var(--k));line-height:1.35;color:#4A6378}'
    + '.vcv-quote{margin:calc(22px * var(--k)) auto 0;max-width:820px;background:' + CREAM + ';border-radius:18px;padding:18px 26px;display:flex;gap:16px;align-items:center;font-size:calc(19px * var(--k));line-height:1.45;font-weight:500}';
  function shell(n, total, inner, tab, tabLeft){
    return '<div class="vcv-page vcv-p' + n + '"><div class="vcv-blob" style="width:520px;height:520px;right:-170px;bottom:-230px"></div><div class="vcv-blob" style="width:260px;height:260px;left:-120px;top:240px;opacity:.6"></div>'
      + (tab ? '<div class="vcv-tab' + (tabLeft ? ' left' : '') + '">' + tab + '</div>' : '') + inner
      + '<div class="vcv-num">Page ' + n + ' of ' + total + '</div><div class="vcv-logo"><img src="' + LOGO + '" alt="Valeo"></div></div>';
  }
  function tiles(p){
    var t = [], add = function(icon, title, sub){ if(title && t.length < 8) t.push({i:icon, t:title, s:sub || ''}); };
    var places = p.jobs.map(function(j){ return j.location; }).filter(Boolean).filter(function(x, i, a){ return a.indexOf(x) === i; });
    if(p.years) add('clock', p.years + '+ Years of Experience', places.length ? 'Worked with families in ' + places.join(', ') : '');
    p.training.forEach(function(x){ var m = x.match(/^(.*?)[,\s]+\(?((?:19|20)\d{2})\)?\s*$/); add(/aid|cpr|life support|safety/i.test(x) ? 'plus' : 'award', m ? m[1] : x, m ? m[2] : ''); });
    if(p.languages.length) add('chat', 'Speaks ' + p.languages.map(function(l){ return l.replace(/\s*\(.*\)/, ''); }).join(' & '), p.languages.join(', '));
    p.education.slice(0, 1).forEach(function(x){ var m = x.match(/^(.*?),\s*(.*)$/); add('cap', m ? m[1] : x, m ? m[2] : ''); });
    if(p.jobs[0]) add('brief', 'Most Recent Role', [p.jobs[0].title, p.jobs[0].employer].filter(Boolean).join(', ') + (p.jobs[0].dates ? ' (' + p.jobs[0].dates + ')' : ''));
    p.skills.forEach(function(s){ var x = split(s); add(skillIcon(x[0]), x[0], x[1]); });
    return t;
  }
  function html(p0){
    fonts();
    var p = norm(p0), pages = [], E = esc;
    var specs = p.skills.map(function(s){ return split(s)[0]; }).filter(Boolean).slice(0, 8);
    var hasAbout = p.summary || p.education.length || p.training.length || p.skills.length;
    var plan = [1].concat(hasAbout ? [2] : []).concat(specs.length ? [3] : []).concat(p.jobs.length ? [4] : []).concat([5]);
    var total = plan.length, n = 0;
    // 1 — cover
    var facts = [['flag','Nationality',p.nationality],['gender','Gender',p.gender],['lang','Languages',p.languages.join(', ')],['star','Experience',p.years ? p.years + ' years' : ''],['pin','Based in',p.location]]
      .filter(function(f){ return f[2]; });
    n++;
    pages.push(shell(n, total, '<div class="vcv-ring"></div><div class="vcv-photo"' + (p.photo ? ' style="background-image:url(\'' + E(p.photo) + '\')"' : '') + '>' + (p.photo ? '' : '<span class="ph-ini">' + E((p.name[0] || '?').toUpperCase()) + '</span>') + '</div>'
      + '<div class="vcv-r"><div class="vcv-hello">Hello, I’m</div><div class="vcv-name' + (p.name.length > 16 ? ' long' : '') + '">' + E(p.name) + '</div><div class="vcv-head">' + E(p.headline) + '</div>'
      + '<div class="vcv-div"><i></i>' + ic('heart', YELLOW, 20) + '<i></i></div>'
      + '<div class="vcv-facts">' + facts.map(function(f){ return '<div>' + ic(f[0], NAVY, 22) + '<span><b>' + f[1] + ':</b> ' + E(f[2]) + '</span></div>'; }).join('') + '</div></div>'
      + (p.banner1 || p.banner2 ? '<div class="vcv-banner"><div class="bd">' + ic('heart', YELLOW, 30) + '</div><div>' + (p.banner1 ? '<b>' + E(p.banner1) + '</b>' : '') + (p.banner2 ? '<span>' + E(p.banner2) + '</span>' : '') + '</div></div>' : '')));
    // 2 — about me
    if(hasAbout){ n++;
      var skillTitles = p.skills.map(function(s){ return split(s)[0]; });
      var eduAll = p.education.concat(p.training);
      pages.push(shell(n, total, '<div class="vcv-body">'
        + (p.summary ? '<div class="vcv-h"><div class="vcv-dot">' + ic('user', YELLOW, 24) + '</div><h4>Professional <span>summary</span></h4></div><p class="vcv-p" style="margin-bottom:calc(26px * var(--k))">' + E(p.summary) + '</p>' : '')
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">'
        + (eduAll.length ? '<div><div class="vcv-h"><div class="vcv-dot">' + ic('cap', YELLOW, 24) + '</div><h4>Education &amp; <span>certification</span></h4></div><ul class="vcv-ul">' + eduAll.map(function(x){ return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>' : '<div></div>')
        + (skillTitles.length ? '<div><div class="vcv-h"><div class="vcv-dot">' + ic('star', YELLOW, 24) + '</div><h4><span>Skills</span></h4></div><div class="vcv-checks">' + skillTitles.map(function(x){ return '<div>' + ic('check', YELLOW, 18) + '<span>' + E(x) + '</span></div>'; }).join('') + '</div></div>' : '')
        + '</div></div>', 'About <b>Me</b>'));
    }
    // 3 — specialisations
    if(specs.length){ n++;
      pages.push(shell(n, total, '<div class="vcv-body" style="top:120px"><div class="vcv-spec">' + specs.map(function(s){ return '<div><span class="sc">' + ic(skillIcon(s), NAVY, 44) + '</span>' + E(s) + '</div>'; }).join('') + '</div></div>', 'My <b>Specializations</b>'));
    }
    // 4 — work experience
    if(p.jobs.length){ n++;
      pages.push(shell(n, total, '<div class="vcv-body">' + p.jobs.map(function(j){
          var head = '<b>' + E(j.title) + (j.employer || j.location ? ' | ' + E([j.employer, j.location].filter(Boolean).join(', ')) : '') + '</b>';
          return '<div class="vcv-job"><div class="jl"><div class="jd">' + ic('brief', YELLOW, 20) + '</div><div class="jline"></div></div><div style="flex:1;min-width:0"><div class="jt">' + head + (j.dates ? '<em>' + E(j.dates) + '</em>' : '') + '</div>'
            + (j.duties.length ? '<ul class="vcv-ul">' + j.duties.map(function(d){ return '<li>' + E(d) + '</li>'; }).join('') + '</ul>' : '') + '</div></div>'; }).join('') + '</div>', 'Work <b>Experience</b>', true));
    }
    // 5 — why families choose me
    n++;
    var tl = tiles(p);
    pages.push(shell(n, total, '<div class="vcv-body"><div class="vcv-tiles">' + tl.map(function(x){ return '<div>' + ic(x.i, NAVY, 34) + '<b>' + E(x.t) + '</b>' + (x.s ? '<span>' + E(x.s) + '</span>' : '') + '</div>'; }).join('') + '</div>'
      + (p.quote ? '<div class="vcv-quote">' + ic('quote', YELLOW, 40) + '<span>' + E(p.quote) + '</span></div>' : '') + '</div>', 'Why Families <b>Choose Me</b>'));
    return '<div class="vcv"><style>' + CSS + '</style>' + pages.join('') + '</div>';
  }
  // shrink text on a page until its content fits
  function fit(root){
    [].forEach.call((root || document).querySelectorAll('.vcv-page'), function(pg){
      var b = pg.querySelector('.vcv-body'); if(!b) return;
      var k = 1; pg.style.setProperty('--k', 1);
      while(b.scrollHeight > b.clientHeight + 1 && k > 0.62){ k = Math.round((k - 0.04) * 100) / 100; pg.style.setProperty('--k', k); }
    });
  }
  function load(src){ return new Promise(function(res, rej){ var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function(){ rej(new Error('could not load the PDF maker')); }; document.head.appendChild(s); }); }
  async function download(p0, filename){
    var p = norm(p0);
    if(!window.html2pdf) await load('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + W + 'px;background:#fff;z-index:-1';
    box.innerHTML = html(p0);
    document.body.appendChild(box);
    try{
      if(document.fonts && document.fonts.ready) await document.fonts.ready;
      await Promise.all([].map.call(box.querySelectorAll('img'), function(im){ return im.complete ? 0 : new Promise(function(r){ im.onload = im.onerror = r; }); }));
      fit(box);
      // in the PDF each page fills its sheet: no gap, no rounded outer frame, a hair shorter than the sheet so no blank pages
      [].forEach.call(box.querySelectorAll('.vcv-page'), function(pg){ pg.style.height = (H - 1) + 'px'; pg.style.marginBottom = '0'; pg.style.borderRadius = '0'; pg.style.pageBreakAfter = 'auto'; pg.style.breakAfter = 'auto'; });
      await window.html2pdf().set({
        margin: 0, filename: filename || ('Valeo_CV_' + String(p.name).replace(/[^A-Za-z0-9]+/g, '_') + '.pdf'),
        image: {type:'jpeg', quality:0.95}, html2canvas: {scale:2, useCORS:true, backgroundColor:'#ffffff'},
        jsPDF: {unit:'px', format:[W, H], orientation:'landscape', hotfixes:['px_scaling']},
        pagebreak: {mode:['css'], before:'.vcv-page:not(.vcv-p1)'}
      }).from(box.firstChild).save();
    } finally { box.remove(); }
  }
  window.valeoCV = {html:html, download:download, norm:norm, fit:fit, W:W, H:H};
})();
