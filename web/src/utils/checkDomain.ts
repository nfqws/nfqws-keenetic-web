import { API } from '@/api/client';

const FETCH_TIMEOUT = 3000;
const IMAGE_TIMEOUT = 2000;
const MAX_REQUESTS = 3;

const checkWithProxy = async (domain: string) => {
  const { data, error } = await API.check(`https://${domain}`);
  return !error && data?.status === 0 && data?.result;
};

const checkWithFetch = async (domain: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);

  try {
    await fetch(`https://${domain}`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
};

const checkWithImage = async (domain: string) => {
  return new Promise<boolean>((resolve) => {
    const img = new Image();

    const timeoutId = setTimeout(() => {
      img.onerror = null;
      img.onload = null;
      resolve(false);
    }, IMAGE_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };

    img.src = `https://${domain}/favicon.ico?t=${Date.now()}`;
  });
};

export const checkDomain = async (domain: string) => {
  const step1 = await checkWithProxy(domain);
  if (step1) {
    return true;
  }

  const step2 = await checkWithFetch(domain);
  if (step2) {
    return true;
  }

  return checkWithImage(domain);
};

export const parseListFile = (list: string) => {
  const lines = list.split('\n');
  const domains = new Set<string>();

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      !trimmedLine ||
      trimmedLine.startsWith('#') ||
      trimmedLine.startsWith('//')
    ) {
      continue;
    }

    let domain = trimmedLine;
    domain = domain
      .replace(/^(https?:\/\/)/, '')
      .replace(/^www\./, '')
      .split('#')[0]
      .trim()
      .split('/')[0]
      .split(':')[0]
      .trim();

    if (domain && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      domains.add(domain);
    }
  }

  return Array.from(domains);
};

export const checkDomains = (
  urls: string[],
  callback: (data: { url: string; result: boolean; done: boolean }) => void,
) => {
  let current = 0;
  let done = 0;
  let abort = false;

  const request = async () => {
    const index = current++;
    const res = await checkDomain(urls[index]);
    done++;

    callback({
      url: urls[index],
      result: res,
      done: done === urls.length,
    });

    if (current < urls.length && !abort) {
      void request();
    }
  };

  for (let i = 0; i < Math.min(MAX_REQUESTS, urls.length); i++) {
    void request();
  }

  return () => {
    abort = true;
  };
};
