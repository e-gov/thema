// Defineerime võimalikud aluskaardid
// Kõik aluskaardid koosnevad kahest komponendist, mida kuvatakse
// vastavalt kaardi zoomile: kui on olemas kaardi kahheldatud versioon, siis
// seda ning suurematel zoomidel päritakse pildid wms teenustest. NB! Maa-ameti
// kihtide puhul tähendab see, et igale kahhelile lisatakse serveris väike
// "Maa-amet" vesimärk.

// MAA-AMETi aluskaardid
  // ortofoto
var orthotile = L.tileLayer(
    'http://tiles.maaamet.ee/tm/s/1.0.0/foto/{z}/{x}/{-y}.png', {
      minZoom:0,
      maxZoom: 13,
      continuousWorld: false,
      noWrap: false,
      attribution: 'Ortofoto: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),
  orthowms = L.tileLayer.wms(
    'http://kaart.maaamet.ee/wms/fotokaart', {
      layers: 'EESTIFOTO',
      minZoom: 14,
      maxZoom: 20,
      version: '1.1.1',
      attribution : 'Ortofoto: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),

  // aluskaart

  kaarttile = L.tileLayer(
    'http://tiles.maaamet.ee/tm/s/1.0.0/kaart/{z}/{x}/{-y}.png', {
      minZoom:0,
      maxZoom: 14,
      continuousWorld: false,
      noWrap: false,
      attribution: 'Aluskaart: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),
  kaartwms = L.tileLayer.wms(
    'http://kaart.maaamet.ee/wms/kaart', {
      continuousWorld : false,
      layers: 'CORINE,BAASKAART,KAART24,HALDUSPIIRID,TEED,KYLAD,KAART24L',
      minZoom: 14,
      maxZoom: 20,
      version: '1.1.1',
      attribution : 'Aluskaart: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),

  // hübriid (ortofoto + hybriid)

  hybrid_orthotile = L.tileLayer(
    'http://tiles.maaamet.ee/tm/s/1.0.0/foto/{z}/{x}/{-y}.png', {
      minZoom : 0,
      maxZoom : 13,
      continuousWorld : false,
      attribution : 'Ortofoto/Hübriidkaart: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),
  hybrid_texttile = L.tileLayer(
    'http://tiles.maaamet.ee/tm/s/1.0.0/hybriid/{z}/{x}/{-y}.png', {
      minZoom : 0,
      maxZoom : 13,
      continuousWorld : false,
      attribution : 'Ortofoto/Hübriidkaart: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),

  hybrid_orthowms = L.tileLayer.wms(
    'http://kaart.maaamet.ee/wms/fotokaart', {
      layers: 'EESTIFOTO',
      minZoom: 14,
      maxZoom: 20,
      version: '1.1.1',
      attribution : 'Ortofoto/Hübriidkaart: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),
  hybrid_textwms = L.tileLayer.wms(
    'http://kaart.maaamet.ee/wms/fotokaart', {
      layers: 'HYBRID',
      transparent: true,
      format: 'image/png',
      minZoom: 14,
      maxZoom: 20,
      version: '1.1.1',
      attribution : 'Ortofoto/Hübriidkaart: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),
  hybridtile = L.layerGroup([hybrid_orthotile, hybrid_texttile]),
  hybridwms = L.layerGroup([hybrid_orthowms, hybrid_textwms]),

  // reljeef

  reljeeftile = new L.tileLayer(
    'http://tiles.maaamet.ee/tm/s/1.0.0/reljeef/{z}/{x}/{-y}.png', {
      minZoom:0,
      maxZoom: 13,
      continuousWorld: false,
      noWrap: false,
      attribution : 'Reljeef: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),
  reljeefwms = L.tileLayer.wms(
    'http://kaart.maaamet.ee/wms/fotokaart', {
      layers: 'reljeef',
      minZoom: 14,
      maxZoom: 20,
      version: '1.1.1',
      attribution : 'Reljeef: <a href="http://www.maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-Amet</a>'
    }
  ),

// KEMITi aluskaardid
  // mustvalge aluskaart
  blacktile = L.tileLayer(
    'http://gsavalik.envir.ee/geoserver/gwc/service/tms/1.0.0/baasandmed:black@EPSG:3301@png/{z}/{x}/{-y}.png', {
      minZoom:0,
      maxZoom: 14,
      continuousWorld: false,
      noWrap: false,
      attribution: 'MV aluskaart - andmed: <a href="http://maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-amet</a>, <a href="http://keskkonnaagentuur.ee" target="_blank" rel="noopener noreferrer">Keskkonnaregister (KAUR)</a> ning <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>; teostus <a href="https://github.com/e-gov/kem-gsavalik/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">KEMIT ja kaastöölised</a>'
    }
  ),
  blackwms = L.tileLayer.wms(
    'http://gsavalik.envir.ee/geoserver/baasandmed/ows', {
      layers: 'baasandmed:black',
      transparent: true,
      format: 'image/png',
      minZoom: 15,
      maxZoom: 20,
      version: '1.1.1',
      attribution : 'MV aluskaart - andmed: <a href="http://maaamet.ee" target="_blank" rel="noopener noreferrer">Maa-amet</a>, <a href="http://keskkonnaagentuur.ee" target="_blank" rel="noopener noreferrer">Keskkonnaregister (KAUR)</a> ning <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>; teostus <a href="https://github.com/e-gov/kem-gsavalik/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">KEMIT ja kaastöölised</a>'
    }
  );

// Tõstame kokku
var _baselayers = {
    "hybrid":{"title":"Hübriid", "constructor":L.layerGroup([hybridtile, hybridwms])},
    "kaart":{"title":"Aluskaart", "constructor":L.layerGroup([kaarttile, kaartwms])},
    "ortho":{"title":"Ortofoto", "constructor":L.layerGroup([orthotile, orthowms])},
    "reljeef":{"title":"Reljeef", "constructor":L.layerGroup([reljeeftile, reljeefwms])},
    "black":{"title":"Must/Valge", "constructor":L.layerGroup([blacktile, blackwms])}
  };

function initBasemaps(keys) {
  var _map = layerControl._map,
      _layercount = keys.length,
      _last = keys[_layercount-1],
      _lastlayer = _baselayers[_last]["constructor"]
  // Kui _layercoount == 0?
  keys.forEach(function(key) {
    try {
      addBasemapToControl(key);
    } catch (err) {
      console.error(err);
    }
  });
  _lastlayer.addTo(_map);
  // _baselayersist tuleks kustutada kõik need kihid, mis pole layerControli
  // lisatud. Kas me võime deleteda lihtsalt viite nii?
  delete _baselayers;
}

function addBasemapToControl(key) {
  // kui kihti pole `_baselayers`is defineeritud, siis tuleb viga kinni
  // püüda ja konsooli viga visata ning ülejäänud kihtidega edasi liikuda.
  var base = _baselayers[key]
      constr = base["constructor"],
      title = base["title"];
  layerControl.addBaseLayer(constr, title);
}


function updateMap(options) {
  var title = options.title != undefined ? options.title : document.title,
      minZoom = options.minZoom != undefined ? options.minZoom : map.getMinZoom(),
      maxZoom = options.maxZoom != undefined ? options.maxZoom : map.getMaxZoom(),
      zoom = options.zoom != undefined ? options.zoom : minZoom,
      radioGroups = options.radioGroups !== undefined ? options.radioGroups : [];
  document.title = title;
  map.setMinZoom(minZoom);
  map.setMaxZoom(maxZoom);
  map.setZoom(zoom);
  layerControl.options.radioGroups = radioGroups;
}
