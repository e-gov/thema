## Teemakaardi seaditused
Teemakaardi loomiseks on vaja siinne kaust ümbernimetada või teha koopia juhul
kui on vajadus jooksutada paralleelselt mitut erinevat teemakaardirakendust.
Kaardirakenduse täpsem seadistus toimub [config.json](config.json) failis.

## config.json konfiguratsioonifail
Sisaldab teemakaardi ülesseadmiseks vajalikke konfiguratsiooniparameetreid.
Konfiguratsiooniparameetrid hoitakse JSONi objektina.

### map
Kaardi ülesseadmisega seotud parameetrid:

`title` - valikuline. Määrab kaardi veebilehe nime HTML `<head>` elemendis.
Väärtus on tekst, nt `"Põõsaste jaotus"`. Vaikimisi veebilehe nime ei seata ja
kasutatakse seda, mis juba määratud on.

`minZoom` - valikuline. Määrab kaardi minimaalse zoomitaseme. Vaikimisi `0`.

`maxZoom` - valikuline. Määrab kaardi maksimaalse zoomitaseme. Vaikimisi `14`.

`zoom` - valikuline. Määrab kaardi avamisel kasutatava zoomitaseme. Kui
määramata, siis kasutatakse `minZoom` väärtust.

Näiteks võib `map` olla seadistatud kui
`{"map":{"title":"Väga oluline teemakaart", "minZoom":5, "maxZoom":10}}`

Selline seadistus määrab veebilehe nimeks "Väga oluline teemakaart", kaardi
navigeeritavaks zoomivahemikuks tasemed 5-10 ning avab kaardi zoomi tasemel 5.

### basemaps
Loetleb kaardirakenduses kasutatavad eeldefineeritud aluskaardid, mis lisatakse
valikusse:

`basemaps` - loend eeldefineeritud aluskaartidest kujul `["foo", "bar", "baz"]`.
Võimalikud väärtused:
- `ortho`: Maa-ameti ortofoto kaardikiht. Zoomitasemed 0-13 päritakse
kahhelteenusest (TMS), 14-20 avalikust WMS teenusest kahhelitena;
- `kaart`: Maa-ameti aluskaart. Zoomitasemed 0-13 päritakse
kahhelteenusest (TMS), 14-20 avalikust WMS teenusest kahhelitena;
- `hybrid`: Hübriidkaart. Pannakse kokku Maa-ameti ortofotost ja Maa-ameti
hübriidikihist. Zoomitasemed 0-13 päritakse kahhelteenusest (TMS), 14-20
avalikust WMS teenusest kahhelitena;
- `reljeef`: Maa-ameti reljeefivarjutuse kiht. Zoomitasemed 0-13 päritakse
kahhelteenusest (TMS), 14-20 avalikust WMSist kahhelitena;
- `black`: Mustvalge aluskaart KEMITi kaardiserverist. Zoomitasemed
0-14 päritakse kahhelteenusest (TMS), 15-20 WMS teenusest kahhelitena;

Näiteks võib `basemaps` olla seadistatud kui
`{"basemaps": ["ortho", "black"]}`

Selline seadistus lisab kaardi aluskaartide valikuse kaardikihid `ortho` ja
`black`. Viimane neist määratakse vaikimisi isselülitatauks.

### thema
Loend kaardirakenduses kuvatavatest teemakihid. Esitatakse objektide loeteluna,
kus üks kanne esindab ühte teemakihti:

`{"thema": [{..}, {..}, {..}]}`

Üht teemakihti kirjeldatavad parameetrid:

`url` - URL, millelt selle kihi andmeid päritakse. Võib olla URL ise või
URLi template.

`type` - määrab klassi, millega selle kihi kuva/interaktsioon läbi viiakse.
Võimalikud väärtused: `geojson.tile` (kahheldatud geojson), `geojson.url` (
HTTP URLilt laetav geojsoni fail), ...

`style` - teemakihi kujunduse kirjeldus, vt [thema-style](#thema-style)

`srid` - andmete koordinaatsüsteemi tunnus (EPSG kood). Hetkel ignoreerime ja
eeldame, et kõik andmed on Eesti riiklikus L-EST'97.

`layername` - kihi nimetus, mis kasutajale kuvatakse. Vaikeväärtus puudub.

`isVisible` - valikuline, `true`|`false` lipuke, mis määrab, kas kaardikihi nähtavus on
automaatselt sisse lülitatud. Kui `isVisible` puudub, sel juhul kihi
nähtavust automaatselt sisse ei lülita.

`minZoom` - valikuline, määrab kaardikihi kuvamise minimaalse zoomitaseme.
Vaikimisi loetakse kaardirakenduse küljest.

`maxZoom` - valikuline, määrab kaardikihi kuvamise maksimaalse zoomitaseme.
Vaikimisi loetakse kaardirakenduse küljest.

`hover` - valikuline `true`|`false` lipuke, mis määrab, kas vektorkihil hiirega
_üle libisedes_ lisatakse hiire alla jäävale objektile eraldi HTML klassi nimi (
hetkel alati `hover-<ruumikujutüüp>`), et hiire kursori alla jäävaid objekte
visuaalselt esile tõsta.

`attribution` - valikuline viide teemakihi andmete omanikule ja
kasutustingimustele.

#### thema-style
Teemakihi kujunduse kirjeldus koosneb määratud tüübist `type`, mis võib omada
väärtuseid:
- `default`: kihi objektid kuvatakse kõik sama kujundusega.
- `classify`: kihi objektid klassifitseeritakse mingi atribuudi väärtuse järgi
(sisuliselt lihtsustatud koropleet). Klassifitseeriva atribuudi nimi tuleb sel
juhul anda stiili `key` väärtuses, nt
`{"style":{"type":"classify", "key":"elanike_arv", ...}}`

ning kujunduse enda kirjeldusest `values` objektis. Kujunduse väljendamiseks
on kasutusel:

`fillColor` - polügoni sisemuse värvus, nt `#C6CA53`.

`fillOpacity` - polügoni sisemuse läbipaistvus vahemikus 0 kuni 1.

`color` - polügoni piirjoone ja joonobjekti värvus, nt `#7B7263`.

`opacity` - polügoni piirjoone ja joonobjekti läbipaistvus vahemikus 0 kuni 1.

`weight` - polügoni piirjoone ja joonobjekti paksus, nt `1.5`.

`lineCap` - ainult joonobjektidel, kuidas joonistada joone otsad. Võimalikud
väärtused `butt`, `round`, `square`.

`lineJoin` - määrab polügoni piirjoontel ja joonobjektidel, kuidas
joonistatakse joone murre käänupunkti kohal. Võimalikud väärtused
`miter`, `round`, `bevel`.

`iconUrl` - punktobjekti ikooni URL.

`iconSize` - punktobjekti ikooni suurus, nt `[21, 30]`

`iconAnchor` - punktobjekti ikooni ankru paigutus ikooni suhtes, nt
`[-10.5, -30]`

Vastavalt kujunduse tüübile (`default` vs `classify`) esindab `values` kas
kujunduse kirjeldust ennast (`default`) nt:

```
{
    "style": {
        "type": "default",
        "values": {
            "iconUrl": "//whatever.org/example.png"
        }
    }
}
```

või siis klassi kaupa defineeritud kujundust (`classify`)

```
{
    "style": {
        "type": "classify",
        "key": "juhtub_ikka",
        "values": {
            "jah": {
                "fillColor": "#A0CCDA",
                "fillOpacity": 0.7,
                "color": "#0C1308",
                "opacity": 0,
                "weight": 1
            },
            "ei": {
                "fillColor": "#BA8F95",
                "fillOpacity": 0.7,
                "color": "#0C1308",
                "opacity": 0,
                "weight": 1
            }
        }
    }
}
```
Viimasel juhul kujundataks objekt vastavalt tema atribuudi `juhtub_ikka`
väärtuse `jah` või `ei` järgi.
