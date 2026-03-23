export const numberToWords = (num) => {
  if (num === 1000) return "one thousand";
  if (num === 2000) return "two thousand";
  if (num === 3000) return "three thousand";
  if (num === 4000) return "four thousand";
  if (num === 5000) return "five thousand";
  if (num === 6000) return "six thousand";
  if (num === 7000) return "seven thousand";
  if (num === 8000) return "eight thousand";
  if (num === 9000) return "nine thousand";
  if (num === 10000) return "ten thousand";

  if (num > 1000 && num < 10000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (remainder === 0) {
      return `${numberToWords(thousands * 1000)}`;
    }
    if (remainder < 100) {
      return `${numberToWords(thousands * 1000)} and ${numberToWords(remainder)}`;
    }
    return `${numberToWords(thousands * 1000)} ${numberToWords(remainder)}`;
  }

  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? ` ${ones[one]}` : "");
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return ones[hundred] + " hundred" + (remainder ? ` and ${numberToWords(remainder)}` : "");
  }

  return num.toString();
};

export const formatNumberForSpeech = (text) => {
  if (!text) return text;

  let formatted = text;

  formatted = formatted.replace(/\$(\d{1,3}(?:,\d{3})*)(?:\s*to\s*\$(\d{1,3}(?:,\d{3})*))?/gi, (match, from, to) => {
    if (!to) {
      const num = parseInt(from.replace(/,/g, ""), 10);
      return `${numberToWords(num)} dollars`;
    }
    const fromNum = parseInt(from.replace(/,/g, ""), 10);
    const toNum = parseInt(to.replace(/,/g, ""), 10);
    return `from ${numberToWords(fromNum)} dollars to ${numberToWords(toNum)} dollars`;
  });

  return formatted;
};

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
