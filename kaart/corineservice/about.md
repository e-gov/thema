CORINE Land Cover ehk CORINE maakate, lühendatult CLC,  on ühtse metoodika
alusel koostatud andmebaas, kuhu kogutakse ruumiandmeid Euroopa maakatte kohta.
Selle abil saab vaadata kaardistatud ala maakatet, seal toiminud muutusi, teha
ruumianalüüse, koostada trende jms.

Loe täpsemalt [Keskkonnaagentuuri kodulehelt](http://www.keskkonnaagentuur.ee/et/eesmargid-tegevused/projektid/corine-land-cover).

Siin kaardirakenduses kuvame 1990, 2000, 2006 ja 2012 referentsaastate
kaardistusi ja kaardistusaastate võrdluses arvutatud muudatustekihte.

## CLC legend

![CLC Legend](https://gsavalik.envir.ee/geoserver/keskkonnainfo/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=keskkonnainfo:clc_2012&format=image/png)

## CLC muudatused

CLC muudatuste kaardikihi kujunduses kasutatakse võrreldavate referentsaastate
maakatteklasside värvide väärtuseid. Kiht on kujutatud nii, et laskuvate
diagonaaljoontega `\\\` (vasakult paremale) on kujutatud esimese
referentsaasta maakatteklassi väärtus ja tõusvate diagonaaljoontega `///`
(vasakult paremale) järgneva referentsaasta maakatteklassi väärtus.

Näiteks:

![CLC muudatatused näide](https://gsavalik.envir.ee/geoserver/keskkonnainfo/ows?service=WMS&version=1.1.0&request=GetMap&transparent=false&bgcolor=0x002323&cql_filter=sys_id=279013&layers=keskkonnainfo:clc_muudatused&styles=&bbox=663184.017579184,6471065.472944069,663899.812525303,6471781.267890188&width=150&height=150&srs=EPSG:3301&format=image/png)

Tähistab ala, mis esimesel referentsaastal oli klassifitseeritud kui
`Niisutuseta haritav maa` (CLC kood: 211; kollane laskuv diagonaal) ning
järgneval referentsaastal kui `Hõredalt hoonestatud alad` (CLC kood: 112;
punane tõusev diagonaal).

## Avalikud kaarditeenused
Siin kujutatud CLC andmestik on vabalt kasutamiseks saadaval WMS/WFS ning TMS
teenuste kaardikihtidena järgmistelt URLidelt:

- WMS/WFS: http://gsavalik.envir.ee/geoserver/keskkonnainfo/ows?
- TMS: https://gsavalik.envir.ee/geoserver/gwc/service/tms/1.0.0

Täpsemad andmete taaskasutustingimused on sätestatud kaardikihtide kirjelduste
juures.
