# 💻 Jutjubić Frontend Service (ISA 2025)

Ovo je klijentska aplikacija za platformu Jutjubić, razvijena koristeći Angular. Glavna svrha ovog dela projekta je pružanje kompletnog korisničkog interfejsa (UI/UX), upravljanje stanjem aplikacije i komunikacija sa backend RESTful API-jem.

Aplikacija je Single Page Application (SPA) koja pruža fluidno, brzo i bezbedno iskustvo pregleda videa.

## ✎ Autori

[Papp Tamás](https://github.com/Pappt04) Student 2

[Apró Dorottya](https://github.com/adorottya) Student 3

[Mikro Arsenijević](https://github.com/watenfragen) Student 1


## 📺 Backend

Backend za aplikaciju je dostupan [ovde](https://github.com/Pappt04/Lilyoutube_server)


# 🚀 Arhitektura

Frontend je organizovan kao Modularna i Feature-Driven Angular aplikacija. Ova struktura omogućava efikasno skaliranje, ponovnu upotrebu koda i podržava Lazy Loading za brže inicijalno učitavanje.

Ključni Moduli i Direktorijumi:

app/core/: Sadrži logiku koja se učitava samo jednom (npr. servisi za autentifikaciju, HTTP interceptori, globalni Guardovi).

app/shared/: Sadrži komponente, direktive i pipe-ove koji se dele i ponovo koriste širom aplikacije (npr. navigacija, dugmad, kartice za video).

app/features/: Sadrži glavne funkcionalnosti aplikacije, često implementirane kao Lazy-Loaded moduli:

video/: Upravljanje listom videa, plejerom i komentarima.

auth/: Stranice za prijavu i registraciju.

user-profile/: Upravljanje profilom korisnika.

app/models/: TypeScript interfejsi i klase koje odslikavaju DTO (Data Transfer Objects) primljene od backend-a.

# 🛠️ Tehnološki Stek

Platforma: Angular (v17+)

Jezik: TypeScript

Stilizovanje: CSS

Upravljanje stanjem: RxJS

HTTP komunikacija: Angular HttpClient

# 📋 Preduslovi

Pre pokretanja aplikacije, uverite se da imate instalirano sledeće:

Node.js (preporučena LTS verzija)

npm (Node Package Manager)

Angular CLI (Globalna instalacija):

npm install -g @angular/cli


# ⚙️ Lokalno Pokretanje Projekta

1. Kloniranje Repozitorijuma
   
```
git clone https://github.com/Pappt04/Lilyoutube-frontend
cd Lilyoutube-frontend/frontend
npm install
```

3. Konfiguracija Backend API-ja

Frontend mora znati gde da pronađe backend servis. Proverite fajl ```src/environments/environment.ts``` i podesite apiUrl da odgovara adresi i portu na kojem se pokreće backend.

```
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api'
};
```

4. Pokretanje Aplikacije

Pokrenite razvojni server. Aplikacija će se automatski rekompajlirati pri svakoj promeni koda.

```ng serve```


Aplikacija će biti dostupna u vašem pretraživaču na adresi: http://localhost:4200/.

🔗 Povezivanje sa Backend-om

Aplikacija komunicira sa Spring Boot backend-om isključivo preko RESTful API-ja. Koristi se HTTP Interceptor za automatsko dodavanje JWT (JSON Web Token) tokena uz svaki zaštićeni zahtev, kao i za globalno rukovanje greškama.
