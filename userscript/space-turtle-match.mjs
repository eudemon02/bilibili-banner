import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const source = readFileSync(new URL('./bilibili-space-turtle-2068450020.user.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('./bilibili-meteor-hook.user.js', import.meta.url), 'utf8');
const patterns = [...source.matchAll(/^\/\/ @match\s+(\S+)/gm)].map((m) => m[1]);
const version = source.match(/^\/\/ @version\s+(\S+)/m)[1];
const name = source.match(/^\/\/ @name\s+(.+)$/m)[1].trim();
const namespace = source.match(/^\/\/ @namespace\s+(\S+)/m)[1];

function matchOne(pattern, urlString) {
  const parsed = /^(https|\*):\/\/([^/]+)(\/.*)$/.exec(pattern);
  if (!parsed) throw new Error('bad pattern ' + pattern);
  const url = new URL(urlString);
  if (parsed[1] !== '*' && parsed[1] !== url.protocol.replace(':', '')) return false;
  if (parsed[2] !== url.hostname) return false;
  const pathAndQuery = url.pathname + url.search;
  const body = parsed[3].replace(/[.+^${}()|[\]\\?]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + body + '$').test(pathAndQuery);
}
function matches(url) {
  return patterns.some((pattern) => matchOne(pattern, url));
}

if (version !== '1.0.0') throw new Error(version);
if (name !== 'B站空间头图：海洋生物 - 乌龟') throw new Error(name);
if (namespace === home.match(/^\/\/ @namespace\s+(\S+)/m)[1]) throw new Error('namespace collides with homepage script');
if (!source.includes("const THEME = '海洋生物 - 乌龟'")) throw new Error('theme');
if (!source.includes("const UID = '2068450020'")) throw new Error('uid');
if ((source.match(/"id":/g) || []).length !== 16) throw new Error('not 16 layers');
if (source.includes('"tagName":"video"') || source.includes('tagName:"video"')) throw new Error('unexpected video');
for (const bad of ['eval(', 'document.cookie', '@updateURL', '@downloadURL', 'raw.githubusercontent', 'pic.imgdb.cn', 'www.bilibili.com']) {
  if (bad === 'www.bilibili.com') {
    if (patterns.some((p) => p.includes('www.bilibili.com'))) throw new Error('homepage match');
  } else if (source.includes(bad)) throw new Error('forbidden ' + bad);
}

const allow = [
  'https://space.bilibili.com/2068450020',
  'https://space.bilibili.com/2068450020?spm_id_from=333.1007.0.0',
  'https://space.bilibili.com/2068450020/',
  'https://space.bilibili.com/2068450020/?spm_id_from=333.1007.0.0',
  'https://space.bilibili.com/2068450020/video',
  'https://space.bilibili.com/2068450020/video?spm_id_from=333.1007.0.0',
  'https://space.bilibili.com/2068450020/dynamic',
];
const deny = [
  'https://www.bilibili.com/',
  'https://www.bilibili.com/?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/zh-Hans?spm_id_from=333.1007.0.0',
  'https://www.bilibili.com/video/BV1QMWs67EuT?spm_id_from=333.1007.0.0',
  'https://search.bilibili.com/all?keyword=turtle',
  'https://space.bilibili.com/1',
  'https://space.bilibili.com/1?spm_id_from=333.1007.0.0',
  'https://space.bilibili.com/2068450021',
  'https://space.bilibili.com/20684500201/video',
  'http://space.bilibili.com/2068450020',
];
for (const url of allow) if (!matches(url)) throw new Error('should match ' + url);
for (const url of deny) if (matches(url)) throw new Error('should not match ' + url);

const guard = source.match(/function isTargetSpace\(\) \{[\s\S]*?\n  \}/)[0];
function runtime(href) {
  const location = new URL(href);
  const context = { location, UID: '2068450020' };
  vm.createContext(context);
  return vm.runInContext(guard + '\nisTargetSpace()', context);
}
if (!runtime(allow[1])) throw new Error('guard rejected query space');
if (!runtime(allow[5])) throw new Error('guard rejected subpage');
if (runtime(deny[0]) || runtime(deny[6]) || runtime(deny[8])) throw new Error('guard too wide');

const ids = [...source.matchAll(/"id":"([0-9a-f]+\.webp)"/g)].map((m) => m[1]);
if (new Set(ids).size !== 16) throw new Error('duplicate ids');
for (const id of ids) {
  const m = source.match(new RegExp('"' + id.replace('.', '\\.') + '":"([A-Za-z0-9+/=]+)"'));
  if (!m) throw new Error('missing bytes ' + id);
  const buf = Buffer.from(m[1], 'base64');
  if (buf.subarray(0, 4).toString() !== 'RIFF' || buf.subarray(8, 12).toString() !== 'WEBP') throw new Error('bad webp ' + id);
  createHash('sha256').update(buf).digest('hex');
}
console.log('SPACE_MATCH_OK', version, patterns.length, 'images', ids.length);
