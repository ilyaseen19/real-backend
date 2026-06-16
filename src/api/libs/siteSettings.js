const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultSettings = {
  general: {
    siteName: "LEDS PROPERTIES",
    defaultLanguage: "English",
    defaultCurrency: "USD",
    defaultCurrencySymbol: "$",
    defaultCountry: "Ghana",
  },
  location: {
    countries: [
      {
        id: "ghana",
        name: "Ghana",
        enabled: true,
        isoCode: "GH",
        phoneCode: "+233",
        defaultCurrency: "GHS",
        currencySymbol: "GHS",
        allowedCurrencies: ["GHS", "USD"],
        timezones: ["Africa/Accra"],
        provinces: [
          {
            id: "greater-accra",
            name: "Greater Accra",
            cities: [
              {
                id: "accra",
                name: "Accra",
                suburbs: ["Airport Residential", "Cantonments", "East Legon", "Labone"],
              },
              {
                id: "tema",
                name: "Tema",
                suburbs: ["Community 1", "Community 18", "Sakumono", "Spintex"],
              },
            ],
          },
          {
            id: "ashanti",
            name: "Ashanti",
            cities: [
              {
                id: "kumasi",
                name: "Kumasi",
                suburbs: ["Adum", "Asokwa", "Bantama", "Ejisu"],
              },
            ],
          },
        ],
      },
      {
        id: "zambia",
        name: "Zambia",
        enabled: true,
        isoCode: "ZM",
        phoneCode: "+260",
        defaultCurrency: "ZMW",
        currencySymbol: "ZMW",
        allowedCurrencies: ["ZMW", "USD"],
        timezones: ["Africa/Lusaka"],
        provinces: [
          {
            id: "lusaka-province",
            name: "Lusaka Province",
            cities: [
              {
                id: "lusaka",
                name: "Lusaka",
                suburbs: ["Ibex Hill", "Kabulonga", "Meanwood", "Roma"],
              },
            ],
          },
          {
            id: "copperbelt",
            name: "Copperbelt",
            cities: [
              {
                id: "ndola",
                name: "Ndola",
                suburbs: ["Itawa", "Kansenshi", "Northrise", "Town Centre"],
              },
              {
                id: "kitwe",
                name: "Kitwe",
                suburbs: ["Buchi", "Parklands", "Riverside", "Nkana East"],
              },
            ],
          },
        ],
      },
    ],
  },
  property: {
    propertyTypes: [
      "Single room",
      "Apartment",
      "Full house",
      "Office",
      "Shop",
      "Land",
      "Warehouse",
    ],
    amenities: [
      "Swimming Pool",
      "Pipe Water",
      "Air Conditioning",
      "Electricity",
      "Near Main Road",
      "Near Supermarket",
      "Pets Allowed",
    ],
  },
  content: {
    hero: {
      title: "Find Your Dream Home",
      subtitle: "Discover the right property across multiple countries from one platform.",
      buttonText: "Browse Properties",
      imageUrl: "",
    },
    footer: {
      aboutText: "We help buyers, agents, and admins manage property listings across multiple countries.",
      contactAddress: "Accra, Ghana",
      contactPhone: "+233 000 000 000",
      contactEmail: "info@brightestate.com",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
        linkedin: "#",
      },
    },
    advertisements: [],
  },
  developer: {
    apiKeys: {},
    generatedApis: [],
    webhooks: [],
  },
};

const ensureArray = (value, fallback = []) =>
  Array.isArray(value) ? value : clone(fallback);

const normalizeProvince = (province) => ({
  id: province?.id || String(Date.now()),
  name: province?.name || "",
  cities: ensureArray(province?.cities).map((city) => ({
    id: city?.id || `${province?.id || "province"}-${city?.name || "city"}`,
    name: city?.name || "",
    suburbs: ensureArray(city?.suburbs).filter(Boolean),
  })),
});

const normalizeCountry = (country, generalDefaults) => ({
  id: country?.id || (country?.name || "country").toLowerCase().replace(/\s+/g, "-"),
  name: country?.name || "",
  enabled: country?.enabled !== false,
  isoCode: country?.isoCode || "",
  phoneCode: country?.phoneCode || "",
  defaultCurrency: country?.defaultCurrency || generalDefaults.defaultCurrency,
  currencySymbol: country?.currencySymbol || country?.defaultCurrency || generalDefaults.defaultCurrencySymbol,
  allowedCurrencies: Array.from(
    new Set(
      ensureArray(country?.allowedCurrencies, [country?.defaultCurrency, generalDefaults.defaultCurrency]).filter(
        Boolean
      )
    )
  ),
  timezones: ensureArray(country?.timezones),
  provinces: ensureArray(country?.provinces).map((province) => normalizeProvince(province)),
});

const normalizeSettings = (settings = {}) => {
  const general = {
    ...clone(defaultSettings.general),
    ...settings.general,
  };

  const currentSiteName = String(general.siteName || "").trim().toLowerCase();
  if (currentSiteName === "brightestate" || currentSiteName === "hodalorestate") {
    general.siteName = "LEDS PROPERTIES";
  }

  if (!general.defaultCurrencySymbol && general.defaultCurrency === "USD") {
    general.defaultCurrencySymbol = "$";
  }

  const location = {
    countries: ensureArray(settings.location?.countries, defaultSettings.location.countries).map((country) =>
      normalizeCountry(country, general)
    ),
  };

  return {
    general,
    location,
    property: {
      ...clone(defaultSettings.property),
      ...settings.property,
      propertyTypes: ensureArray(settings.property?.propertyTypes, defaultSettings.property.propertyTypes),
      amenities: ensureArray(settings.property?.amenities, defaultSettings.property.amenities),
    },
    content: {
      ...clone(defaultSettings.content),
      ...settings.content,
      hero: {
        ...clone(defaultSettings.content.hero),
        ...(settings.content?.hero || {}),
      },
      footer: {
        ...clone(defaultSettings.content.footer),
        ...(settings.content?.footer || {}),
        socialLinks: {
          ...clone(defaultSettings.content.footer.socialLinks),
          ...(settings.content?.footer?.socialLinks || {}),
        },
      },
      advertisements: ensureArray(settings.content?.advertisements),
    },
    developer: {
      ...clone(defaultSettings.developer),
      ...(settings.developer || {}),
    },
  };
};

const mergeLegacySettings = (settings = {}) => {
  const mapped = {
    general: {
      siteName: settings.siteName,
    },
    content: {
      footer: {
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        contactAddress: settings.address,
        socialLinks: settings.socialLinks,
      },
    },
  };

  return normalizeSettings({
    ...settings,
    ...mapped,
    general: {
      ...(settings.general || {}),
      ...(mapped.general || {}),
    },
    content: {
      ...(settings.content || {}),
      footer: {
        ...(settings.content?.footer || {}),
        ...(mapped.content?.footer || {}),
      },
    },
  });
};

const getCountryConfig = (settings, countryName) => {
  const normalized = normalizeSettings(settings);
  return normalized.location.countries.find(
    (country) => country.name.toLowerCase() === String(countryName || "").trim().toLowerCase()
  );
};

const getAllowedCurrencies = (country, settings) => {
  const normalized = normalizeSettings(settings);
  return Array.from(
    new Set(
      [country?.defaultCurrency, ...(country?.allowedCurrencies || []), normalized.general.defaultCurrency].filter(
        Boolean
      )
    )
  );
};

module.exports = {
  defaultSettings,
  normalizeSettings,
  mergeLegacySettings,
  getCountryConfig,
  getAllowedCurrencies,
};
