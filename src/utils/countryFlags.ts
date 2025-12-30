export const getCountryFlag = (countryName: string): string => {
  const countryToCode: Record<string, string> = {
    'Lesotho': 'LS',
    'South Africa': 'ZA',
    'Botswana': 'BW',
    'Zimbabwe': 'ZW',
    'Namibia': 'NA',
    'Zambia': 'ZM',
    'Malawi': 'MW',
    'Kenya': 'KE',
    'Nigeria': 'NG',
    'Ghana': 'GH',
    'Tanzania': 'TZ',
    'Uganda': 'UG',
    'Rwanda': 'RW',
    'Ethiopia': 'ET',
    'Mozambique': 'MZ',
    'Eswatini': 'SZ',
    'Swaziland': 'SZ',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'India': 'IN',
    'China': 'CN',
    'Japan': 'JP',
    'Germany': 'DE',
    'France': 'FR',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Argentina': 'AR',
  };

  const code = countryToCode[countryName] || 'UN';
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

export const getCountryFlagEmoji = (countryName: string): string => {
  const countryToEmoji: Record<string, string> = {
    'Lesotho': '🇱🇸',
    'South Africa': '🇿🇦',
    'Botswana': '🇧🇼',
    'Zimbabwe': '🇿🇼',
    'Namibia': '🇳🇦',
    'Zambia': '🇿🇲',
    'Malawi': '🇲🇼',
    'Kenya': '🇰🇪',
    'Nigeria': '🇳🇬',
    'Ghana': '🇬🇭',
    'Tanzania': '🇹🇿',
    'Uganda': '🇺🇬',
    'Rwanda': '🇷🇼',
    'Ethiopia': '🇪🇹',
    'Mozambique': '🇲🇿',
    'Eswatini': '🇸🇿',
    'Swaziland': '🇸🇿',
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Japan': '🇯🇵',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'Argentina': '🇦🇷',
  };

  return countryToEmoji[countryName] || '🌍';
};
