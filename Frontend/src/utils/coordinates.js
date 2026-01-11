const DMS_REGEX =
  /(-?\d+(?:[.,]\d+)?)°\s*(\d+(?:[.,]\d+)?)'?\s*(\d+(?:[.,]\d+)?)"?\s*(N|S|E|W)?/i;

/**
 * Convert a coordinate input (decimal or DMS string) into decimal degrees.
 * Returns null when input cannot be parsed.
 */
export const parseCoordinateInput = (value) => {
  if (value === null || value === undefined) return null;
  if (value === "") return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  const normalized = trimmed
    .replace(/\s+/g, " ")
    .replace(/,/g, ".")
    .replace(/deg/i, "°")
    .replace(/°\s*(\d+)/g, "° $1")
    .replace(/([\d.])'/g, "$1'")
    .replace(/([\d.])"/g, '$1"');

  const match = normalized.match(DMS_REGEX);
  if (!match) {
    return null;
  }

  const [, degStr, minStr = "0", secStr = "0", directionRaw = ""] = match;
  const degrees = Number(degStr.replace(",", "."));
  const minutes = Number(minStr.replace(",", "."));
  const seconds = Number(secStr.replace(",", "."));

  if ([degrees, minutes, seconds].some((n) => Number.isNaN(n))) {
    return null;
  }

  let decimal = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  const direction = directionRaw.toUpperCase();

  if (direction === "S" || direction === "W") {
    decimal *= -1;
  } else if (!direction && degStr.trim().startsWith("-")) {
    decimal *= -1;
  }

  return decimal;
};

export const convertCoordsPayload = (coords) => {
  if (!coords || typeof coords !== "object") {
    return { lat: null, lng: null };
  }

  const lat = parseCoordinateInput(coords.lat);
  const lng = parseCoordinateInput(coords.lng);

  return { lat, lng };
};
