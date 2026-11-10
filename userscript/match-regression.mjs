// Tampermonkey 5.5.1 keeps Chrome/MDN match rules: the path pattern is compared
// with pathname + query, so a pattern without "?" does not match a URL that has
// a query string. See https://github.com/Tampermonkey/tampermonkey/issues/1560
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./bilibili-meteor-hook.user.js', import.meta.url), 'utf8');
const patterns = [...source.matchAll(/^\/\/ @match\s+(\S+)/gm)].map((m) => m[1]);
const version = source.match(/^\/\/ @version\s+(\S+)/m)[1];

function matchOne(pattern, urlString) {
  const parsed = /^(https|\*):\/\/([^/]+)(\/.*)$/.exec(pattern);
  if (!parsed) throw new Error('bad pattern ' + pattern);
  const url = new URL(urlString);
  const scheme = url.protocol.replace(':', '');
  if (parsed[1] !== '*' && parsed[1] !== scheme) return false;
  if (parsed[2] !== url.hostname) return false;
  const pathAndQuery = url.pathname + url.search;
  const body = parsed[3].replace(/[.+^${}()|[\]\\?]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + body + '$').test(pathAndQuery);
}

function matches(url) {
  return patterns.some((pattern) => matchOne(pattern, url));
}

const home = [
  'https://www.bilibili.com/',
  'https://www.bilibili.com/?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/?spm_id_from=333.1007.0.0#/',
  'https://www.bilibili.com/index.html',
  'https://www.bilibili.com/index.html?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/zh-Hans',
  'https://www.bilibili.com/zh-Hans?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/zh-Hans/',
  'https://www.bilibili.com/zh-Hans/?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/zh-Hant?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/en?spm_id_from=333.1007.0.0',
];
const away = [
  'https://www.bilibili.com/video/BV1QMWs67EuT',
  'https://www.bilibili.com/video/BV1QMWs67EuT?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/zh-Hans/video/BV1QMWs67EuT?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/en/video/BV1QMWs67EuT?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/zh-Hant/video/BV1?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/bangumi/play/ep1?spm_id_from=333.1007.0.0',
  'https://search.bilibili.com/',
  'https://space.bilibili.com/1',
  'http://www.bilibili.com/?spm_id_from=333.1007.0.0',
];
const oldPatterns = [
  'https://www.bilibili.com/',
  'https://www.bilibili.com/index.html',
  'https://www.bilibili.com/zh-Hans',
  'https://www.bilibili.com/zh-Hans/',
];
const userUrl = 'https://www.bilibili.com/zh-Hans?spm_id_from=333.1007.0.0';
const oldHit = oldPatterns.some((pattern) => matchOne(pattern, userUrl));
if (oldHit) throw new Error('v1.0.0 patterns unexpectedly match the query homepage');
if (version !== '1.1.0') throw new Error('version ' + version);
for (const url of home) {
  if (!matches(url)) throw new Error('should match ' + url);
}
for (const url of away) {
  if (matches(url)) throw new Error('should not match ' + url);
}

const isHomeSource = source.match(/function isHome\(\) \{[\s\S]*?\n  \}/)[0];
function runtimeHome(href) {
  const location = new URL(href);
  location.pathname = location.pathname;
  const context = { location };
  vm.createContext(context);
  vm.runInContext(isHomeSource + '\nisHome()', context);
  return vm.runInContext('isHome()', context);
}
if (!runtimeHome(userUrl)) throw new Error('runtime guard rejected query homepage');
if (!runtimeHome('https://www.bilibili.com/?spm_id_from=333.1007.0.0')) throw new Error('runtime guard rejected root query');
if (runtimeHome('https://www.bilibili.com/zh-Hans/video/BV1?spm_id_from=1')) throw new Error('runtime guard accepted a video');
if (!runtimeHome('https://www.bilibili.com/en?spm_id_from=333.1007.0.0')) throw new Error('runtime guard rejected /en query homepage');

console.log('MATCH_OK', version, 'patterns', patterns.length);
