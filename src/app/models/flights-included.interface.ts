export interface Included {
  airport: { [key: string]: any };
  city: { [key: string]: { iata: string; name: any; country: string } };
  supplier: { [iataCode: string]: { name: { ru: string; en: string }; code: string } };
}
