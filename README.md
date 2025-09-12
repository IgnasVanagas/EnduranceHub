# EnduranceHub

Centralizuota internetinė platforma sportininkams ir jų komandai. Sistema sujungia treniruočių, mitybos ir sveikatos duomenis vienoje vietoje, užtikrina efektyvią komunikaciją tarp sportininko, trenerio, dietologo ir medicinos personalo.

## Turinys
- [Aprašymas](#aprašymas)  
- [Funkcionalumas](#funkcionalumas)  
- [Naudotojų rolės](#naudotojų-rolės)  
- [Technologijos](#technologijos)  
- [API](#api)  
- [Diegimas](#diegimas)  
- [Autoriai](#autoriai)  

---

## Aprašymas
Šiuolaikiniai sportininkai bendradarbiauja su treneriais, dietologais ir medicinos personalu. Dažnai informacija išsiskaido tarp skirtingų platformų. **EnduranceHub** siekia tai centralizuoti:

- Treniruotės
- Mitybos planai
- Sveikatos rodikliai
- Komunikacija su specialistais

---

## Funkcionalumas
- Registracija ir prisijungimas (JWT autentifikacija)
- Treniruočių planų kūrimas, redagavimas, peržiūra
- Mitybos rekomendacijų kūrimas, redagavimas, peržiūra
- Sveikatos rodiklių registravimas (pvz., svoris, pulsas)
- Pranešimų sistema tarp sportininko ir komandos narių
- Hierarchinė duomenų sąsaja (visi plano duomenys prieinami sportininko profilyje)
- Administratoriaus įrankiai vartotojų ir turinio valdymui

---

## Naudotojų rolės
- **Svečias** – peržiūri viešą informaciją, gali registruotis  
- **Sportininkas** – valdo savo duomenis, bendrauja su komanda  
- **Specialistas** (treneris, dietologas, medicinos personalas) – kuria ir redaguoja planus, konsultuoja  
- **Administratorius** – valdo naudotojus, teises ir turinį  

---

## Technologijos
- **Front-End**: React.js (su autentifikacija)  
- **Back-End**: Node.js + Express arba PHP Laravel (REST API)  
- **Duomenų bazė**: MySQL  
- **Autentifikacija**: JWT su žetonų atnaujinimo strategija  
- **Debesų platforma**: Azure arba AWS  
- **API dokumentacija**: OpenAPI (Swagger)  

---

## API
Kiekvienam objektui realizuoti 5 REST metodai:  
- **Create**  
- **Read (by ID)**  
- **Update**  
- **Delete**  
- **Get all (list)**  

**Objektai:**  
- Sportininkas  
- Treniruočių planas  
- Mitybos planas  

**Viso:** 3 objektai × 5 metodai = **15 API metodų**  

---

## Diegimas

### Reikalavimai
- Node.js arba PHP (Laravel)  
- MySQL duomenų bazė  
- NPM (jei naudojamas React.js front-end)  

### Žingsniai
1. Klonuoti repozitoriją:
   ```bash
   git clone https://github.com/<user>/endurancehub.git
   cd endurancehub
