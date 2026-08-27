# Muzeum Hodnot
Muzeum Hodnot je slovenský jednojazyčný web, který obsahuje výstavy a nabízí vzdělávací podklady pro školy.
I když tento soubor je psaný česky, UI webu a CMS bude slovensky, programátorská část bude tradičně anglicky. Komunikace developera a claude může probíhat v češtině.
Vytvoř si CLAUDE.MD, README.MD a TODO.MD. Rozvrhni si práci do větších bloků, které postupně projdeme.


## Stack
- K vývoji webu použijeme buď React nebo Next.js. - Rozhodni se.
- Jako CMS použijeme Sanity.
- Deploy bude formou Github Pages s Custom doménou. Sanity bude volat webhook, který bude rebuildovat web. Budeme používat Cloudflare DNS a ochranu.

## Požadavky na web
- Web bude splňovat A11Y
- Web bude obsahovat SEO standardy
- Web bude responzivní a bude podporovat minimální šířku 320px
- Budeme používat proměnné s velikostmi paddings, margin, radius apd., aby byl web sjednocený.
- Budeme používat proměnné s barvami.
- Budeme používat paragrafové styly, které se budou znovu používat napříč webem.
- Budeme vytvářet komponenty, které se budou znovu využívat - Button, Link, Tiles

## Design
- Design je ve Figmě. Zde máš zatím desing Homepage, ze kterého jde odvodit velké množství principů, co používáme.
    @https://www.figma.com/design/kv94h3ftHiTnK38W2u20Ne/Muzeum-Hodnot?node-id=337-1315&m=dev
- Design používá 3 druhy šířek
  - Bloky roztažené až k okraji obsahující ale padding
    - Galerie ve Výstava
  - Bloky max 1200 px šiřoké a zmenšující se na menší obrazovce
    - Většina bloků
    - Používáme také na 3 sloupcový layout
  - Bloky obsahující max 600 px
    - Používáme na obsah Výstavy
    - Používáme na stránkách Zážitkové vdelávanie a Generátor hodnot
- Používáme Několik druhů textů a formátování
  - Velký heading s písmem CY
  - Menší title s písmem CY. Na webu se na nějakých místech dynamicky podtrhává. Barva podtrhnutí je určováná z frontnedu. Různé sekce mají různý akcent, který ovlivňuje i barvu buttonů.
  - Label - Monospaced písmo
  - Text body.
- Každý podstránka má cover image, na který je aplikovaný efekt linear gradient, aby se obrázek ztrácel.
  - Na tento postupně ztrácející obrázek je aplikovaný efekt dithering. Dithering chci přidávat až v Reactu, aby nebylo nutné obrázky upravovat předem. Musíme vymyslet způsob implementace - shader nebo něco jiného?
  - Každý cover obrázek je použití nahoře na stránce i dole na stránce. Liší se pouze ve směru gradientu. Obrázek nahoře se ztrácí směrem dolů a obrázek dole u patičky ser ztrácí směrem nahoru. 

## Struktura webu

### Navigace
- Navigace obsahuje 
  - Kontakt
  - Zážitkové vzdělávání
  - Generátor hodnot
  - Volitelný link nastavitelný v CMS na Darujme.sk

### Patička
- Obsahuje kontakty na sociální sítě. Je to pole objektů, které mají ikonu SVG, název, URL.
- Kontakt - bere se ze stránky Kontakt
- Administrativní údaje - bere se ze stránky Kontakt
- Partneri projektu - textový blok, který může mít základní formátování:
    - Bold
    - Kurzíva
    - Odkazy
    - Více odstavců.

### Domovská stránka
- Cover image
- Na začátku domovské stránky jsou 2-3 dlaždice s navigací na jednotlivé podstránky.
  - první dlaždice obsahuje odkazy na všechny aktuální výstavy, kterých může být 0 až x.
  - druhá dlaždice obsahuje navigaci na podstránku Generátor hodnot
  - třetí dlaždice obsahuje
- Bublina s popisem projektu
  - Nahoře se ukazuje pouze část textu. Zbytek textu je schovaný na rozbalení za buttonem.
- Sekce výstavy - výstavy jsou dělené na 3 kategorie. Aktivní výstavy jsou nahoře v dlaždici. 
  - Chystané výstavy jsou zde níže. Obsahují pouze základní informace. V CMS se u každé výstavy dá nastavit, jestli je možné otevřít její detail nebo ne.
  - Uplynulé výstavy. Více o nich v sekci Výstava.

### Výstava
- Každá výstava má následující údaje
  - Místo
  - Datum vernisáže
  - Datum trvání (podle konce trvání se určuje, jestli má výstava tag "Aktuálne")
  - Maximálně další dvě volitelné pole, které se dají využít na zapsání rolí - např kurátorka a odporná spolupráce. Lidí pod jednou rolí může být víc, ale stačí je napsat jako string oddělený čárkou.
  - Cover Image
  - Galerie
    - Obsahuje fotografie, volitelný Alt, volitelného fotografa/fotografku.
  - Abstract - stejný textový blok, jako v Patička
  - Materiály - 0 až víc souborů. Každý soubor má název, jak bude nazvaný na webu.
  - Odkazy - 0 až víc odkazů. Každý link má kromě URL i název, jak se bude zobrazovat na webu.
  - Dále se podíleli - soupis lidí, kteří se na výstavě dál podíleli. Záznamy jsou v podobě Role + String lidí. Lidí může být víc, ale stačí je napsat jako string oddělený čárkou.

### Kontakt
- Liší se od textového bloku v patičce
- String na telefon
- String na e-mail
- Textový blok č. 1 na adresu
- Textový blok č. 2 na administrativní údaje (ičo, atd)
- Lidé v projektu - zapisujeme ve formátu Jméno (nebo více jmen oddělených čárkou), obrázek, pozice.
- Cover Image stránky

### Zážitkové vzdělávání
- Stránka má Cover
- Obsah stránky bude složený z bloků, které se budou skládat v CMS. Bloky které máme k dispozici:
  - Textový blok (viz výš, ale zde bude mít ještě navíc možnost odrážek a přidání formátování monospaced)
  - Nadpisy H2 a H3
  - Speciální obrázek, který má na frontendu dekorativní efekt.
  - Dlaždice, do které jde umístit vše výše zmíněné
  - Materiál, případně pole materiálů ke stažení. Mají stejné vlastnosti jako Materiály ve Výstava

### Generátor hodnôt
- Stránka která má cover a je možén ji skládat z bloků stejně jako výše zmíněnou.
- Na spodu stránku bude mapa.
  - Na mapě jsou zadané jednotlivé body, které se při oddálení shlukují do čísel.
  - Kliknutí na číslo přiblíží danou oblast.
  - Kliknutí na bod otevře popover, ve kterém budou detailní informace, které se budou vyplňovat v CMS.
  - Každý bod bude mít nadpis, obrázek, textový blok a odkaz.

