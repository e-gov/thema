# thema
Lihtsalt konfigureeritavad [Leaflet](http://leafletjs.com/)il põhinevad
teemakaardirakendused.

## Taust
**thema** eesmärgiks on pakkuda võimalust lihtsalt genereeritavaid
teemakaardirakendusi. Eelduseks on vabalt (avalikult) pakutavate andmekihtide
olemasolu, mida on võimalik üle veebi tarbida. **thema** on suuteline kuvama
rasterandmeid WMS ja TMS teenustest ning [GeoJSONi](http://geojson.org/)
struktuuris vektorandmeid TMS teenustest või peaaegu-et suvalistest
veebipäringutest. Rasterandmetega on võimalik edasi anda väga keerulisi
kaardikujundusi, samas vektorandmed pakuvad interaktiivsuse - kaardiobjektide
atribuutandmete kuvamine, graafikute joonistamine jms.

Erinevaid näidisrakendustega on võimalik tutvuda [allpool](#thema-teemakaartide-n%C3%A4ited).

Juhul kui soovid kaasa lüüa või oled mõne rakenduse kasutamisel komistanud mõne
vea otsa, siis anna sellest märku [õssude](https://github.com/e-gov/thema/issues)
lehel.

**thema** kaardirakenduse konfiguratsiooniparameetrid ja rakenduse seadistus
on täpsemalt lahti kirjeldatud [kaart/thema/README.md](./kaart/thema/README.md)
failis.

## Komponendid (a.k.a _dependencies_)
- [Leaflet](https://github.com/Leaflet/Leaflet) on **thema** mootoriks
- [proj4js](https://github.com/proj4js/proj4js) ja
[proj4Leaflet](https://github.com/kartena/Proj4Leaflet) aitavad hakkama saada
muu-kui-EPSG:4326 koordinaatsüsteemidega.
- [d3js](https://d3js.org) aitab muuta andmed graafikuteks ja muudeks visuaalideks
- [marked.js](https://github.com/chjj/marked) tuleb appi siis kui on kaardipildi
kõrvale vaja rääkida juttu, mis andmed need kaardil üldse on.
- [fetch.js](https://github.com/github/fetch) ja
[promise-polyfill](https://github.com/taylorhakes/promise-polyfill) aitavad
**thema** rakendustel töötada ka IE peal.

**thema** kasutab neid komponente CDNide kaudu, ise midagi paketeerimata või
jagamata.

## thema teemakaartide näited
**thema** ülesehitamisel püüame lähtuda sellest, et teemakaardirakendusi saaks
hallata ka GitHubis. Olemasolevast funktsionaalsusest saab ülevaate e-gov/thema
_master_ haru [näidisrakenduse eelvaatest](https://e-gov.github.io/thema/kaart/thema/).

_devel_ harus toimub igapäevane arendustöö. Seetõttu võib juhtuda, et selle [eelvaates](http://htmlpreview.github.io/?https://github.com/e-gov/thema/blob/devel/kaart/thema/index.html) ei tööta kõik alati nii nagu peaks. Võib-olla on kõik kapitaalselt katki. Kuid sellegipoolest saab siit aimu kuhu suunas **thema** liigub ja kuidas see töötab.

**corine** maakatte rakenduse eelvaate viimane seis on nähtav [siit](
http://htmlpreview.github.io/?https://github.com/e-gov/thema/blob/corine/kaart/corineservice/index.html).

**Prügilate** rakenduse eelvaate viimane seis on nähtav [siit](
http://htmlpreview.github.io/?https://github.com/e-gov/thema/blob/prygilad/kaart/prygilad/index.html).

## Litsents
Antud töö on avatud ja vaba ning põhineb ise avatud lähtekoodiga vabavaral ja
on mõeldud kasutamiseks kõigile huvitatuile. Vaata täpsemalt
[LICENSE](LICENSE)-failist.
