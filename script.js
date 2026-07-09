var google = new ol.layer.Tile({
    title: 'Google Road',
    type: 'base',
    visible: false,

    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    })
});
var esri = new ol.layer.Tile({

    title: 'ESRI Satellite',

    type: 'base',

    visible: true,

    source: new ol.source.XYZ({

        url:
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

    })

});
var sourceAdministrasi = new ol.source.Vector({
    url: 'data/Administrasi.geojson',
    format: new ol.format.GeoJSON()
});

function warna(kategori) {
    if (kategori == 'Pendidikan') return '#9B8AD3';
    if (kategori == 'Kesehatan') return '#7CC576';
    if (kategori == 'Perkantoran') return '#E85D5D';
    if (kategori == 'Perdagangan') return '#FFD966';

    return '#BBBBBB';
}

var administrasi = new ol.layer.Vector({
    source: sourceAdministrasi,
title: 'Batas Kecamatan',
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0)'
        })
    })
});

var aset = new ol.layer.Vector({
 title: 'Aset Tanah',
    source: new ol.source.Vector({
        url: 'data/Aset_22062026.geojson',
        format: new ol.format.GeoJSON()
    }),

    style: function(feature){

        var kategori = feature.get('Kategori');

        var warna = '#BBBBBB';

        if(kategori == 'Pendidikan')
            warna = '#A78BFA';

        else if(kategori == 'Kesehatan')
            warna = '#7CC576';

        else if(kategori == 'Perkantoran')
            warna = '#EF4444';

        else if(kategori == 'Perdagangan')
            warna = '#FACC15';

        else if(kategori == 'Transportasi')
            warna = '#60A5FA';

        else if(kategori == 'Rumah Dinas')
            warna = '#EC4899';
        else if(kategori == 'Lainnya')
    warna = '#9CA3AF';

        return new ol.style.Style({

            fill: new ol.style.Fill({
                color: warna + '80'
            }),

            stroke: new ol.style.Stroke({
                color: warna,
                width: 1.5
            })

        });

    }

});
var lokasiSaya = new ol.layer.Vector({

    source: new ol.source.Vector()

});
var map = new ol.Map({

    target: 'map',

 layers: [

    new ol.layer.Group({

        title: 'Basemap',

        layers: [

            google,

            esri

        ]

    }),

    administrasi,

    aset,

    lokasiSaya


],

    view: new ol.View({
        center: ol.proj.fromLonLat([100.98,-0.68]),
        zoom: 10
    })

});
var homeExtent = sourceAdministrasi.getExtent();
var popup = new ol.Overlay({
    element: document.getElementById('popup'),
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0,-15]
});

map.addOverlay(popup);
var homeButton = document.createElement('button');
homeButton.innerHTML = '🏠';

homeButton.onclick = function () {
    map.getView().fit(
        sourceAdministrasi.getExtent(),
        {
            padding: [50,50,50,50],
            maxZoom: 12
        }
    );
};

var daftar = document.getElementById("asetList");

aset.getSource().on("change", function(){

    if(aset.getSource().getState() === "ready"){

        daftar.innerHTML = "";

        aset.getSource().forEachFeature(function(feature){

            var option = document.createElement("option");

            option.value = feature.get("Nama Aset");

            daftar.appendChild(option);

        });

    }

});
map.addControl(
    new ol.control.ScaleLine()
);
sourceAdministrasi.on('change', function () {

    if (sourceAdministrasi.getState() === 'ready') {

        map.getView().fit(
            sourceAdministrasi.getExtent(),
            {
                padding: [50,50,50,50],
                maxZoom: 11
            }
        );

    }

});
map.on('click', function(evt){

    var feature = null;

    map.forEachFeatureAtPixel(
        evt.pixel,
        function(f, layer){

            if(layer === aset){
                feature = f;
            }

        }
    );

    if(feature){

        var content = `
            <div class="popup-title">
                ${feature.get('Nama Aset')}
            </div>

            <table class="popup-table">
                <tr>
                    <td class="popup-label">Jenis Aset</td>
                    <td>${feature.get('Kategori')}</td>
                </tr>

                <tr>
                    <td class="popup-label">Alamat</td>
                    <td>${feature.get('Alamat')}</td>
                </tr>

                <tr>
                    <td class="popup-label">Nagari</td>
                    <td>${feature.get('Nagari')}</td>
                </tr>

                <tr>
                    <td class="popup-label">Kecamatan</td>
                    <td>${feature.get('Kecamatan')}</td>
                </tr>

                <tr>
                    <td class="popup-label">Tahun Pengadaan</td>
                    <td>${feature.get('Tahun Peng')}</td>
                </tr>

                <tr>
                    <td class="popup-label">Luas</td>
                    <td>${feature.get('Luas')} m²</td>
                </tr>

                <tr>
                    <td class="popup-label">Sertifikat</td>
                    <td>${feature.get('Sertifikat')}</td>
                </tr>
            </table>
        `;

        document.getElementById('popup-content').innerHTML = content;

        popup.setPosition(evt.coordinate);

    } else {

        popup.setPosition(undefined);

    }

});

map.on('pointermove', function(evt){

    var hit = false;

    map.forEachFeatureAtPixel(
        evt.pixel,
        function(feature, layer){

            if(layer === aset){
                hit = true;
            }

        }
    );

    map.getTargetElement().style.cursor =
        hit ? 'pointer' : '';

});

document.getElementById("search").addEventListener("change", function(){

    var keyword = this.value;

    aset.getSource().forEachFeature(function(feature){

        if(feature.get("Nama Aset") === keyword){

            map.getView().fit(
                feature.getGeometry().getExtent(),
                {
                    maxZoom:18,
                    duration:1000
                }
            );

        }

    });

});
document.getElementById("homeBtn")
.onclick = function(){

    map.getView().fit(
        sourceAdministrasi.getExtent(),
        {
            padding:[50,50,50,50],
            maxZoom:12
        }
    );

};
setTimeout(function () {

    var btn = document.querySelector('.layer-switcher button') ||
              document.querySelector('.layer-switcher .panel button') ||
              document.querySelector('.layer-switcher');

    if (btn) {
        btn.title = "Pilih Basemap";
    }

}, 500);
const btnBasemap = document.getElementById("btnBasemap");
const menu = document.getElementById("basemapMenu");

btnBasemap.addEventListener("click", function () {

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }

});
const btnEsri = document.getElementById("btnEsri");
const btnGoogle = document.getElementById("btnGoogle");

btnEsri.onclick = function(){

    esri.setVisible(true);
    google.setVisible(false);

    btnEsri.classList.add("active");
    btnGoogle.classList.remove("active");

}

btnGoogle.onclick = function(){

    esri.setVisible(false);
    google.setVisible(true);

    btnGoogle.classList.add("active");
    btnEsri.classList.remove("active");

}
document.getElementById("locateBtn").onclick = function(){

    if(!navigator.geolocation){
        alert("Browser tidak mendukung GPS.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function(pos){

        var lon = pos.coords.longitude;
        var lat = pos.coords.latitude;

        var koordinat = ol.proj.fromLonLat([lon, lat]);

        lokasiSaya.getSource().clear();

        var marker = new ol.Feature({
            geometry: new ol.geom.Point(koordinat)
        });

        marker.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: "#2563eb"
                }),
                stroke: new ol.style.Stroke({
                    color: "#ffffff",
                    width: 3
                })
            })
        }));

        lokasiSaya.getSource().addFeature(marker);

        map.getView().animate({
            center: koordinat,
            zoom: 17,
            duration: 1000
        });

    });

};
navigator.geolocation.getCurrentPosition(

    function(pos){
        // kode sukses
    },

    function(err){
        alert("Lokasi tidak dapat diakses. Pastikan izin lokasi di browser sudah diaktifkan.");
    }

);
document.getElementById("startBtn").onclick = function () {

    const landing = document.getElementById("landingPage");

    landing.classList.add("fade-out");

    setTimeout(function(){

        landing.style.display = "none";

    },600);

}
// =====================
// SIDEBAR INFORMASI
// =====================

const infoBtn = document.getElementById("infoBtn");

const infoSidebar = document.getElementById("infoSidebar");

const closeInfo = document.getElementById("closeInfo");

infoBtn.onclick = function(){

    infoSidebar.classList.add("show");

}

closeInfo.onclick = function(){

    infoSidebar.classList.remove("show");

}
const tabs=document.querySelectorAll(".tab-btn");

const contents=document.querySelectorAll(".tab-content");

tabs.forEach(function(tab){

    tab.onclick=function(){

        tabs.forEach(function(btn){

            btn.classList.remove("active");

        });

        contents.forEach(function(page){

            page.classList.remove("active");

        });

        tab.classList.add("active");

        document

        .getElementById(tab.dataset.tab)

        .classList.add("active");

    }

});
// ======================
// LANDING PAGE TAB
// ======================

const landingTabs = document.querySelectorAll(".landing-tab");

const landingPages = document.querySelectorAll(".landing-page-content");

landingTabs.forEach(function(tab){

    tab.onclick = function(){

        landingTabs.forEach(function(item){

            item.classList.remove("active");

        });

        landingPages.forEach(function(page){

            page.classList.remove("active");

        });

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.page)
            .classList.add("active");

    };

});
// =========================
// LANDING PAGE
// =========================

function showLanding(page){

    document.getElementById("landingHome").style.display="none";

    document.getElementById(page).style.display="block";

}

function backHome(){

    document.getElementById("landingHome").style.display="block";

    document.getElementById("about").style.display="none";

    document.getElementById("contact").style.display="none";

    document.getElementById("guide").style.display="none";

}




// Menu landing page baru
document.querySelectorAll(".portal-nav-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
        document.querySelectorAll(".portal-nav-btn").forEach(function(item){
            item.classList.remove("active");
        });
        document.querySelectorAll(".portal-page").forEach(function(page){
            page.classList.remove("active");
        });
        btn.classList.add("active");
        document.getElementById("portal-" + btn.dataset.portal).classList.add("active");
    });
});

// ===== FILTER & STATISTIK DASHBOARD =====
const dashColors={Pendidikan:"#a78bfa",Kesehatan:"#34d399",Perkantoran:"#fb7185",Perdagangan:"#facc15",Transportasi:"#60a5fa","Rumah Dinas":"#f472b6",Lainnya:"#94a3b8"};
let dashCategory="", dashStatus="", dashKecamatan="";

function dashCertified(v){
  v=String(v||"").toLowerCase();
  return v === "ada";
}
function dashLuas(f){
 let s=String(f.get("Luas")||"").trim().replace(/\s/g,"").replace(/m²|m2/gi,"");
 if(/^\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,"");
 else if(s.includes(",")&&s.includes(".")) s=s.replace(/\./g,"").replace(",",".");
 else if(s.includes(",")) s=s.replace(",",".");
 return parseFloat(s.replace(/[^0-9.-]/g,""))||0;
}
function applyDashFilters(f){
  const k=f.get("Kategori")||"Lainnya", kec=f.get("Kecamatan")||"";
  const cert=isCertifiedFinal(f);
  return (!dashCategory||k===dashCategory)&&(!dashKecamatan||kec===dashKecamatan)&&(!dashStatus||(dashStatus==="sertifikat"?cert:!cert));
}
function updateDash(){
  aset.setStyle(function(f){
    if(!applyDashFilters(f)) return null;
    let c=dashColors[f.get("Kategori")]||dashColors.Lainnya;
    return new ol.style.Style({fill:new ol.style.Fill({color:c+"80"}),stroke:new ol.style.Stroke({color:c,width:2})});
  });
  let n=0,luas=0,cert=0,counts={};
  aset.getSource().forEachFeature(f=>{if(applyDashFilters(f)){n++;luas+=dashLuas(f);if(isCertifiedFinal(f))cert++;let k=f.get("Kategori")||"Lainnya";counts[k]=(counts[k]||0)+1}});
  document.getElementById("statJumlah").textContent=n;
  document.getElementById("statLuas").textContent=luas>=1000?(luas/1000).toFixed(1)+"k":luas.toFixed(0);
  let p=n?Math.round(cert/n*100):0;
  document.getElementById("statPersen").textContent=p+"%";
  document.getElementById("certProgress").style.width=p+"%";
  document.getElementById("certText").textContent=cert+" dari "+n+" objek bersertifikat.";
  let bars=document.getElementById("categoryBars");bars.innerHTML="";
  Object.keys(dashColors).forEach(k=>{let v=counts[k]||0;if(v){bars.innerHTML+=`<div class="cat-row"><div><span>${k}</span><span>${v}</span></div><div class="cat-track"><i style="width:${n?v/n*100:0}%;background:${dashColors[k]}"></i></div></div>`}});
}
aset.getSource().on("change",function(){
 if(aset.getSource().getState()!=="ready")return;
 let kecs=new Set(),cats=new Set();
 aset.getSource().forEachFeature(f=>{if(f.get("Kecamatan"))kecs.add(f.get("Kecamatan"));cats.add(f.get("Kategori")||"Lainnya")});
 let sel=document.getElementById("filterKecamatan"),quick=document.getElementById("quickKecamatan");
 if(sel.options.length===1){[...kecs].sort().forEach(k=>{sel.add(new Option(k,k));quick.innerHTML+=`<button data-kec="${k}">${k}</button>`})}
 let cf=document.getElementById("categoryFilters");
 if(!cf.children.length){[...cats].sort().forEach(k=>cf.innerHTML+=`<button class="category-chip" data-cat="${k}"><i style="background:${dashColors[k]||dashColors.Lainnya}"></i>${k}</button>`)}
 updateDash();
});
document.getElementById("filterKecamatan").onchange=function(){dashKecamatan=this.value;updateDash();if(this.value)zoomDash()};
document.addEventListener("click",e=>{
 let q=e.target.closest("[data-kec]");if(q){dashKecamatan=q.dataset.kec;document.getElementById("filterKecamatan").value=dashKecamatan;document.querySelectorAll("[data-kec]").forEach(x=>x.classList.toggle("active",x===q));updateDash();zoomDash()}
 let c=e.target.closest(".category-chip");if(c){dashCategory=dashCategory===c.dataset.cat?"":c.dataset.cat;document.querySelectorAll(".category-chip").forEach(x=>x.classList.toggle("active",x.dataset.cat===dashCategory));updateDash()}
 let s=e.target.closest(".status-filter");if(s){dashStatus=s.dataset.status;document.querySelectorAll(".status-filter").forEach(x=>x.classList.toggle("active",x===s));updateDash()}
});
function zoomDash(){let ex=ol.extent.createEmpty();aset.getSource().forEachFeature(f=>{if(applyDashFilters(f))ol.extent.extend(ex,f.getGeometry().getExtent())});if(!ol.extent.isEmpty(ex))map.getView().fit(ex,{padding:[80,80,80,80],maxZoom:15,duration:700})}
document.getElementById("legendBtn").onclick=()=>{let x=document.getElementById("dashLegend");x.style.display=x.style.display==="block"?"none":"block"};

// ===== FINAL: statistik landing + dashboard dinamis dari GeoJSON =====
function getField(feature, names){
  for (const n of names){
    const v=feature.get(n);
    if(v!==undefined && v!==null && String(v).trim()!=="") return v;
  }
  return "";
}
function isCertifiedFinal(feature){
 return String(feature.get("Sertifikat")||"").trim().toLowerCase()==="ada";
}
function numberFinal(v){
  if(typeof v==="number") return v;
  let s=String(v||"").replace(/\s/g,"").replace(/m²|m2/gi,"");
  if(s.includes(",") && s.includes(".")) s=s.replace(/\./g,"").replace(",",".");
  else if(s.includes(",")) s=s.replace(",",".");
  return parseFloat(s.replace(/[^0-9.-]/g,""))||0;
}
function refreshLandingStats(){
  const fs=aset.getSource().getFeatures();
  const total=fs.length;
  const cert=fs.filter(isCertifiedFinal).length;
  const pct=total?(cert/total*100):0;
  const a=document.getElementById("landingTotal"), b=document.getElementById("landingCertified");
  if(a) a.textContent=total;
  if(b) b.textContent=(Math.round(pct*10)/10)+"%";
}
aset.getSource().on("change",function(){
  if(aset.getSource().getState()==="ready") refreshLandingStats();
});

// ===== FIX INISIALISASI: tetap berjalan walau GeoJSON sudah selesai dimuat sebelum listener dibuat =====
dashColors["Tanah Kosong"]="#f59e0b";

function initGeoJSONDashboard(){
  if(aset.getSource().getState()!=="ready") return;

  refreshLandingStats();

  const kecs=new Set(), cats=new Set();
  aset.getSource().getFeatures().forEach(function(f){
    const kec=String(f.get("Kecamatan")||"").trim();
    const cat=String(f.get("Kategori")||"Lainnya").trim();
    if(kec) kecs.add(kec);
    if(cat) cats.add(cat);
  });

  const sel=document.getElementById("filterKecamatan");
  const quick=document.getElementById("quickKecamatan");
  if(sel && sel.options.length<=1){
    [...kecs].sort().forEach(function(k){
      sel.add(new Option(k,k));
      if(quick) quick.insertAdjacentHTML("beforeend",'<button data-kec="'+k+'">'+k.replace("Kecamatan ","")+'</button>');
    });
  }

  const cf=document.getElementById("categoryFilters");
  if(cf && !cf.children.length){
    [...cats].sort().forEach(function(k){
      const color=dashColors[k]||"#94a3b8";
      cf.insertAdjacentHTML("beforeend",'<button class="category-chip" data-cat="'+k+'"><i style="background:'+color+'"></i>'+k+'</button>');
    });
  }
  updateDash();
}

// jalankan pada semua kemungkinan waktu pemuatan
aset.getSource().on("change", initGeoJSONDashboard);
setTimeout(initGeoJSONDashboard, 0);
setTimeout(initGeoJSONDashboard, 300);
setTimeout(initGeoJSONDashboard, 1000);
window.addEventListener("load", initGeoJSONDashboard);

// ===== FIX MENU LANDING: Tentang, Panduan, Kontak =====
(function(){
  function activatePortalPage(name, clicked){
    document.querySelectorAll(".portal-page").forEach(function(page){
      page.classList.remove("active");
      page.style.display="none";
    });
    document.querySelectorAll(".portal-nav-btn").forEach(function(btn){
      btn.classList.remove("active");
    });
    var target=document.getElementById("portal-"+name);
    if(target){
      target.classList.add("active");
      target.style.display="block";
    }
    if(clicked) clicked.classList.add("active");
  }

  document.querySelectorAll(".portal-nav-btn").forEach(function(btn){
    btn.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      activatePortalPage(btn.getAttribute("data-portal"),btn);
    };
  });

  var active=document.querySelector(".portal-nav-btn.active");
  activatePortalPage(active ? active.getAttribute("data-portal") : "beranda", active);
})();

// ===== KONTROL SIDEBAR MOBILE =====
(function(){
  var btn=document.getElementById("mobileMenuBtn");
  var sidebar=document.querySelector(".dash-sidebar");
  var overlay=document.getElementById("mobileOverlay");
  if(!btn||!sidebar||!overlay)return;
  function closeMobileMenu(){
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("show");
    btn.textContent="☰";
  }
  btn.addEventListener("click",function(e){
    e.stopPropagation();
    var open=!sidebar.classList.contains("mobile-open");
    sidebar.classList.toggle("mobile-open",open);
    overlay.classList.toggle("show",open);
    btn.textContent=open?"×":"☰";
  });
  overlay.addEventListener("click",closeMobileMenu);
  window.addEventListener("resize",function(){
    if(window.innerWidth>768)closeMobileMenu();
    if(typeof map!=="undefined")setTimeout(function(){map.updateSize()},100);
  });
  document.getElementById("startBtn").addEventListener("click",function(){
    if(typeof map!=="undefined")setTimeout(function(){map.updateSize()},700);
  });
})();
