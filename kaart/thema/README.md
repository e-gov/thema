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

`radioGroups` - valikuline. Määrab millised teemakihtide grupid on
_eksklusiivsed_, s.t selle grupi kihtide valik kuvatakse _kihtide kontrolleris_
raadio-nuppudega.

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

`type` - määrab klassi (nn _konstruktori_), millega selle kihi
kuva/interaktsioon läbi viiakse. Võimalikud konstruktorite väärtused:
- `geojson.tile`: TMS kahheldatud geojson (vektorandmed)
- `geojson.url`: HTTP URLilt laetav geojsoni fail (vektorandmed)
- `raster.tile`: TMS kahheldatud raster, nt _*.png_ kahhelid.
- `raster.url`: WMS teenusest kahheldatult päritav raster.
- `grouplayer.tile`: kahest või enamast kihist koosnev gihtide gupp, mis
rakenduse _kihtide kontrolleris_ kuvatakse ühe kihina. Võimaldab erinevates `z`
vahemikes kuvada andmeid erińevatest allikatest ja/või kuvada rasterkihte
(kujundus) ning neile nähtamatu kihina peale vektorandmete kihi (interaktsioon).
Grupi koosseis on määratud kihtide loeteluga `layers` objektis. Selle
konstruktori puhul ei arvestata `thema.url`, `thema.style`, `thema.srid`,
`thema.hover`, `thema.attribution` parameetreid

`style` - teemakihi kujunduse kirjeldus, vt [thema-style](#thema-style)

`srid` - andmete koordinaatsüsteemi tunnus (EPSG kood). Hetkel ignoreerime ja
eeldame, et kõik andmed on Eesti riiklikus L-EST'97.

`layername` - kihi nimetus, mis kasutajale kuvatakse. Vaikeväärtus puudub.

`groupname` - valikuline, määrab loogilise grupi, milles seda teemakihti
_kihtide kontrolleris_ kuvatakse. Kõik sama `groupname` värtusega teemakihid
grupeeritakse "kokku". Kihtide grupi nimena kuvatakse siin määratud väärtust.
Kui puudub, siis lisatakse kaardikiht mitte ühtegi gruppi kuuluvana.
Vaikimisi lisatakse kaardikihid märkeruutudega (_input type=checkbox_). Juhul kui
grupinimi on loetletud `map.radioGroup` massiivis, siis lisatakse gruppi
määratud kihid raadio-nuppudega (_input type=radio_). Nt:

```
{
    "thema": [
        {
            "layername": "üks - kaks - kolm",
            "groupname": "esimene",
        },
        {
            "layername": "neli - viis - kuus",
            "groupname": "esimene",
        },
        {
            "layername": "seitse",
            "groupname": "teine",
        },
        {
            "layername": "üksik",
        }
}
```

Kuvab _kihtide kontrolleris_ sellise ülesehitusega loetelu:

```
esimene
    [ ] üks - kaks - kolm
    [ ] neli - viis - kuus
teine
    [ ] seitse
[ ] üksik
```

`isVisible` - valikuline, `true`|`false` lipuke, mis määrab, kas kaardikihi
nähtavus on automaatselt sisse lülitatud. Kui `isVisible` puudub, sel juhul
kihi nähtavust automaatselt sisse ei lülita.

`minZoom` - valikuline, määrab kaardikihi kuvamise minimaalse zoomitaseme.
Vaikimisi loetakse kaardirakenduse küljest.

`maxZoom` - valikuline, määrab kaardikihi kuvamise maksimaalse zoomitaseme.
Vaikimisi loetakse kaardirakenduse küljest.

`hover` - valikuline `true`|`false` lipuke, mis määrab, kas vektorkihil hiirega
_üle libisedes_ (`mouseover`) lisatakse hiire alla jäävale objektile eraldi
HTML klassi nimi (hetkel alati `hover-<ruumikujutüüp>`), et hiire kursori
alla jäävat objekti visuaalselt esile tõsta.

`info` - valikuline teksti-_template_ vektorkihi objekti andmete kuvamiseks
infoaknas. Võib sisaldada HTMLi ja/või [`L.Util.template`](
http://leafletjs.com/reference-1.2.0.html#util-template) formaadis kirjeldatud
stringi. Selle Kohahoidjad täidetakse hiirekursori alla jääva kaardielemendi
GeoJSON `properties` objektist. Juhul kui `thema.info` puudub siis kihile
interaktiivselt infoakent ei kuvata.

`graph` - valikuline, võimaldab vektorkihi kaardiobjekti agregeeritud
andmestikust joonistada graafikuid [d3js](https://d3js.org/) abil. Kui
`thema.graph` puudub, siis graafikuid ei joonistata. Vt täpsemalt
[thema-graph](#thema-graph).

`filterproperty` - valikuline võimalus `geojson.tile` konstruktoriga hallatava
teemakihi väärtuste filtreerimiseks. See määrab ära GeoJSON
`Feature.properties` väärtuse, mille järgi filtreeritakse. Kui
`thema.filterproperty` puudub, siis filtreerimist ei toimu.

`filtervalue` - valikuline võimalus `geojson.tile` konstruktoriga hallatava
teemakihi väärtuste filtreerimiseks. Määrab ära `thema.filterproperty`
väärtuse, millele vastavad objektid teemakihil kuvatakse. Kui
`thema.filtervalue` puudub, siis filtreerimist ei toimu.

`attribution` - valikuline viide teemakihi andmete omanikule ja
kasutustingimustele.

`layers` - kohustuslik kui `thema.type == 'grouplayer.tile'`. Loetleb grupikihi
teemakaardikihtide koosseisu.  Iga element siin
massiivis on omaette [`thema`](#thema) objekt. Grupikiht koosneb iseseisvatest
teemakaardikhtidest ja grupikihi sees omakorda olevaid grupikihte ei
arvestata.

`joins` - valikuline. Selle teemakihiga _seotavad_ üks või mitu
lisaandmestikku. Sobib nt kui teemakaardikihi andmestik ise sisaldab ainult
klassifikaatorite koode, kuid infoaknas oleks sõbralikum välja näidata
koodidele vastavaid inimloetavaid tekste. Vt [thema-joins](#thema-joins)

#### thema-joins
Teemakihi atribuutandmestikule lisaandmestiku mestimiseks tuleb kirjeldada
`thema.joins` objekt. See struktuur on järgnev:

- `id`: seose identifikaator. Vajalik, et oleks unikaalne selle teemakihi jaoks.
- `url`: lisaandmestiku veebist kättesaadav asukoht.
- `type`: _konstruktor_, millega andmestikku lugeda. Hetkel vaid `geojson.url`.
- `join_field`: lisaandmestiku _seoseveerg_, mille järgi seos luua
(sisuliselt peaks käituma nagu `primary key`).
- `join_to`: teemakihi _seoseveerg_, mille järgi seos luua (sisuliselt
peaks käituma nagu `foreign key`).
- `fields`: lisaandmestiku _veergude_ loend, mis teemakihile seosega üle
kantakse.

`fields` loetelus olevad väärtused loetakse lisaandmestikust teemakihile, nii
et need on kasutatavad teemakihi kujundamisel, filtreerimisel või infoakna
sisu täitmisel. Lisatava GeoJSONi `Feature.properties` nimi koostatakse
`<join_to>__<id>__<fields[n]>` eeskirja alusel.

Nt võib `thema.joins` massiiv olla selline:

```
{
    "joins": [
        {
            "id": "kl_maakate",
            "type": "geojson.url",
            "url": "https://gsavalik.envir.ee/geoserver/keskkonnainfo/ows?service=WFS&version=2.0.0&request=GetFeature&typename=keskkonnainfo:kl_maakate&outputformat=application/json",
            "join_field": "kood",
            "join_to": "maakate_kood",
            "fields": ["kirjeldus"]
        }
    ]
}
```

Selliselt kirjeldatud seosega laetakse [URLilt](https://gsavalik.envir.ee/geoserver/keskkonnainfo/ows?service=WFS&version=2.0.0&request=GetFeature&typename=keskkonnainfo:kl_maakate&outputformat=application/json) klassifikaatorite
kirjeldus ja lisatakse sellest `kirjeldus` veerg teemakihi atribuutandmestikule
nimega `maakate_kood__kl_maakate__kirjeldus`

#### thema-graph
Hetkel joonistame vaid lihtsaid tulpdiagramme.

Diagrammi joonistamiseks vajalikud `x` ja `y` teljestike väärtused peavad
teemakihi kaardiobjekti jaoks olema valmis komaeraldatult agregeeritud (vt nt
veergude `aastad` ja `ladestatud_tonnid` sisu
[Keskkonnaagentuuri prügilate kaarditeenuses](
https://gsavalik.envir.ee/geoserver/gwc/service/tms/1.0.0/keskkonnainfo%3Aprygilad_agregeeritud@EPSG%3A3301@geojson/0/0/0.geojson)).

Graafiku ülesehituse kirjelduse koosneb:
- `x`: graafiku x-telje väärtuseid sisaldava veeru nimi.
- `y`: graafiku y-telje väärtuseid sisaldava veeru nimi.
- `xLabel`: graafiku x-telje lipik.
- `yLabel`: graafiku y-telje lipik.

#### thema-style
Teemakihi kujunduse kirjeldus koosneb määratud tüübist `type`, mis võib omada
väärtuseid:
- `default`: kihi objektid kuvatakse kõik sama kujundusega.
- `classify`: kihi objektid klassifitseeritakse mingi atribuudi väärtuse järgi
(sisuliselt lihtsustatud koropleet). Klassifitseeriva atribuudi nimi tuleb sel
juhul anda stiili `key` väärtuses, nt

```
{
    "style": {
        "type":"classify",
        "key":"elanike_arv",
        ...
    }
}
```

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
