import { LOCALES, getSiteContent } from '../data/siteContent';

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function addServiceToLookup(lookup, service) {
  const id = String(service?.id ?? '').trim();
  const title = String(service?.title ?? '').trim();

  if (!id) {
    return;
  }

  lookup.set(normalizeKey(id), id);

  if (title) {
    lookup.set(normalizeKey(title), id);
  }
}

export function getServiceOptions(services = []) {
  return services
    .map((service) => ({
      value: String(service?.id ?? '').trim(),
      label: String(service?.title ?? '').trim(),
    }))
    .filter((service) => service.value && service.label);
}

export function buildServiceLookup(services = []) {
  const lookup = new Map();

  for (const locale of LOCALES) {
    const localeServices = getSiteContent(locale)?.data?.services || [];

    for (const service of localeServices) {
      addServiceToLookup(lookup, service);
    }
  }

  for (const service of services) {
    addServiceToLookup(lookup, service);
  }

  return lookup;
}

export function normalizeServiceSelections(values = [], services = []) {
  const lookup = buildServiceLookup(services);
  const deduped = new Map();

  for (const value of values) {
    const normalized = String(value ?? '').trim();

    if (!normalized) {
      continue;
    }

    const resolved = lookup.get(normalizeKey(normalized));

    if (!resolved) {
      continue;
    }

    const key = normalizeKey(resolved);

    if (!deduped.has(key)) {
      deduped.set(key, resolved);
    }
  }

  return Array.from(deduped.values());
}

export function getServiceLabel(serviceId, services = []) {
  const lookup = buildServiceLookup(services);
  const resolvedId = lookup.get(normalizeKey(serviceId)) || '';

  if (!resolvedId) {
    return String(serviceId ?? '').trim();
  }

  const service = services.find((item) => String(item?.id ?? '').trim() === resolvedId);

  return String(service?.title ?? resolvedId).trim();
}
