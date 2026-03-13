import { Country, City } from 'country-state-city'
import { EU_COUNTRY_CODES } from './eu-countries'

export type CountryOption = {
  code: string
  name: string
  flag?: string
}

export type CityOption = {
  name: string
}

export function getEuCountries(): CountryOption[] {
  return Country.getAllCountries()
    .filter((country) =>
      EU_COUNTRY_CODES.includes(country.isoCode as (typeof EU_COUNTRY_CODES)[number])
    )
    .map((country) => ({
      code: country.isoCode,
      name: country.name,
      flag: country.flag,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getCitiesByCountryCode(countryCode: string): CityOption[] {
  const cities = City.getCitiesOfCountry(countryCode) || []

  const unique = Array.from(
    new Map(cities.map((city) => [city.name, { name: city.name }])).values()
  )

  return unique.sort((a, b) => a.name.localeCompare(b.name))
}