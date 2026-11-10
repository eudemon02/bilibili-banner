// ==UserScript==
// @name         B站首页横幅：流星坠雨落沙滩 - 月如钩
// @namespace    https://github.com/eudemon02/bilibili-banner
// @version      1.0.0
// @description  仅在 https://www.bilibili.com/ 桌面首页，用已审查的分层动态横幅替换头图。不读取 Cookie、账号或推荐数据。
// @author       Shawn Phang (渲染逻辑，MIT)；个人首页适配
// @license      MIT
// @match        https://www.bilibili.com/
// @match        https://www.bilibili.com/index.html
// @match        https://www.bilibili.com/zh-Hans
// @match        https://www.bilibili.com/zh-Hans/
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==
/*
 * MIT License
 *
 * Copyright (c) 2023 Shawn Phang
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * 渲染逻辑来自 palxiao/bilibili-banner 的 index.js。
 * 主题「流星坠雨落沙滩 - 月如钩」固定为 assets/2025-09-10（config.js 中
 * banner_20250910）。该目录 blob 自 a0b9ec1f2f69e45832c400fb93c1c3db9a31eb53
 * 至 6063150074f1f65728ef7bea8a6376fd4ed6c011 未改动。
 * 图像只请求已逐张核对 SHA-256 的 i0.hdslb.com 原图。
 * 两段透明 WebM 原 CDN 已不存在，只从上述固定 commit 读取，并在播放前核对体积、
 * EBML 文件头和 SHA-256。本文件不含远程脚本、远程模块或自动更新地址。
 */
(function () {
  'use strict';
  if (window.top !== window.self) return;

  const THEME = '流星坠雨落沙滩 - 月如钩';
  const COMMIT = '6063150074f1f65728ef7bea8a6376fd4ed6c011';
  const IMAGE_PREFIX = 'https://i0.hdslb.com/bfs/vc/';
  const VIDEO_PREFIX = 'https://raw.githubusercontent.com/eudemon02/bilibili-banner/' + COMMIT + '/assets/2025-09-10/';
  const FILE_RE = /^[A-Za-z0-9._@-]+$/;
  const VIDEO_META = {
  "702a0368-36c8-4a0f-b0e9-0ab86666cd6d": {
    "size": 5261,
    "sha256": "f035ca09875b3a6c6416f6907e2d9bc819434400299f4eefa2899f683661407c"
  },
  "eecd2026-9015-4ca5-9b14-01cc202da4a4": {
    "size": 23301,
    "sha256": "3da2987c003fbb21474403a33bed0a77058d0e0ef3ca63e3dc7c9f36db4eb1bd"
  }
};
  const LAYERS = [{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"90240f707cb4a015bbf8bbd13e018b3f664087ce.png@1c.webp","a":0.0113939},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"cd4194a7be89655450147d2384a162b966cf2ec2.png@1c.webp","a":0.00142424},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"ab2379f7c80b225020ee42289db11b84b57c2766.png@1c.webp","a":0.00142424},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"938b58321d184fde31c783f5b321621ffb0c190e.png@1c.webp","a":0.0022787899999999997},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"af840eae2cc555b0757d406e252f7a7dd6542eed.png@1c.webp","a":0.00284848},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"1271b110ca83ef84bf8d2c664537c8644a273216.png@1c.webp","a":0.00427273},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"c8b49dc1aa86b2573ce2736de6692acfe0182481.png@1c.webp","a":0.00284848},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"0881f755a4857a3b9bc12c3bbe41c00382ac6fc6.png@1c.webp","a":0.008545450000000001},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"065fff3eb5ce38fd2d3a658ff825d5aa3a744e73.png@1c.webp","a":0.00256364},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"7e61b8ea5efd98ade40b7ee386dd1bbc2b5898f5.png@1c.webp","a":0.00170909},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"27724404973bbe4573bfabab6fed6767d6b06815.png@1c.webp","a":0.00427273},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"29d11ebfdd1b9d0840cc528c95ede27fe3d0a8e2.png@1c.webp","a":0.00284848},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"3af7aa17868b8e5bc26950ac4a399bec62b83e50.png@1c.webp","a":0},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"27ec840f903725d7ad7ad8356d37ead40ece4b31.png@1c.webp","a":0},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"230bdd9372f4d1362d0d9cd75d3b233b2db29d43.png@1c.webp","a":0.00427273},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"56f088b30dadc2c99fed255fcf4cc34c4f37f313.png@1c.webp","a":0.008545450000000001},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"c5a4a63c098b81d89c73d359de35fcea9bb1c7a3.png@1c.webp","a":0.00284848},{"tagName":"video","opacity":[1,1],"transform":[1,0,0,1,-102.5,32.5],"width":150,"height":150,"file":"702a0368-36c8-4a0f-b0e9-0ab86666cd6d","a":0.003030299999999997},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1728,"height":162,"file":"59b1c59d919469fc0a4632acc5a6eecd9260d099.png@1c.webp","a":0.00954545},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,-2.25,-2.25],"width":1728,"height":162,"file":"7b7dd8a92bf8036be6502898e9804c65ee0f6284.png@1c.webp","a":0.01036364},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"aabd831214cdae044414980e3c06787c0f3073ff.png@1c.webp","a":0.0284848},{"tagName":"video","opacity":[1,1],"transform":[1,0,0,1,-535.8,61.1],"width":141,"height":141,"file":"eecd2026-9015-4ca5-9b14-01cc202da4a4","a":0.03702999999999997},{"tagName":"img","opacity":[1,1],"transform":[1,0,0,1,0,0],"width":1805,"height":169,"file":"928547de5ced33ce2b28b7924e1a470a110eed26.png@1c.webp","a":-0.00142424}];
  const DESIGN_WIDTH = 1650;
  const HOMING_MS = 300;

  const state = {
    disabled: false,
    root: null,
    toggle: null,
    layers: [],
    bases: [],
    moveX: 0,
    initX: 0,
    raf: 0,
    homing: 0,
    poll: 0,
    onResize: null,
    onBlur: null,
    aborts: [],
  };

  function isHome() {
    if (location.protocol !== 'https:' || location.hostname !== 'www.bilibili.com') return false;
    const path = location.pathname;
    return path === '/' || path === '/index.html' || path === '/zh-Hans' || path === '/zh-Hans/';
  }

  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  function fileUrl(file, kind) {
    if (!FILE_RE.test(file) || file.indexOf('..') !== -1) return '';
    if (kind === 'video') {
      if (!Object.prototype.hasOwnProperty.call(VIDEO_META, file)) return '';
      return VIDEO_PREFIX + file;
    }
    if (kind === 'img') return IMAGE_PREFIX + file;
    return '';
  }

  function scaledBase(item, compensate) {
    const transform = item.transform.slice();
    transform[4] *= compensate;
    transform[5] *= compensate;
    return {
      a: item.a || 0,
      f: item.f || 0,
      g: item.g || 0,
      deg: item.deg || 0,
      opacity: item.opacity,
      transform: transform,
    };
  }

  function bannerEl() {
    return document.querySelector('.bili-header .bili-header__banner');
  }

  function rememberStyle(el, prop) {
    const key = 'meteorPrev' + prop;
    if (el.dataset[key] == null) el.dataset[key] = el.style[prop] || '';
  }

  function suppressOriginal(banner) {
    const picture = banner.querySelector('#bili-header-banner-img');
    if (picture && picture.dataset.meteorSuppressed !== '1') {
      picture.dataset.meteorSuppressed = '1';
      rememberStyle(picture, 'visibility');
      picture.style.visibility = 'hidden';
    }
    banner.querySelectorAll(':scope > .animated-banner').forEach(function (node) {
      if (node.dataset.meteorSuppressed === '1') return;
      node.dataset.meteorSuppressed = '1';
      rememberStyle(node, 'display');
      node.querySelectorAll('video').forEach(function (video) { video.pause(); });
      node.style.display = 'none';
    });
  }

  function restoreOriginal(banner) {
    if (!banner) return;
    banner.querySelectorAll('[data-meteor-suppressed="1"]').forEach(function (el) {
      el.style.visibility = el.dataset.meteorPrevvisibility || '';
      el.style.display = el.dataset.meteorPrevdisplay || '';
      delete el.dataset.meteorSuppressed;
      delete el.dataset.meteorPrevvisibility;
      delete el.dataset.meteorPrevdisplay;
    });
  }

  function stopMotion() {
    state.aborts.splice(0).forEach(function (controller) { controller.abort(); });
    if (state.raf) cancelAnimationFrame(state.raf);
    if (state.homing) cancelAnimationFrame(state.homing);
    state.raf = 0;
    state.homing = 0;
    state.layers.forEach(function (layer) {
      const media = layer.firstElementChild;
      if (media && media.tagName === 'VIDEO') {
        media.pause();
        if (media.dataset.blobUrl) {
          URL.revokeObjectURL(media.dataset.blobUrl);
          media.removeAttribute('src');
          delete media.dataset.blobUrl;
        }
      }
    });
  }

  function detachListeners() {
    if (state.root) {
      state.root.removeEventListener('mouseenter', onEnter);
      state.root.removeEventListener('mousemove', onMove);
      state.root.removeEventListener('mouseleave', onLeave);
    }
    if (state.onResize) window.removeEventListener('resize', state.onResize);
    if (state.onBlur) window.removeEventListener('blur', state.onBlur);
    state.onResize = null;
    state.onBlur = null;
  }

  function removeOurNodes() {
    stopMotion();
    detachListeners();
    if (state.root) state.root.remove();
    if (state.toggle) state.toggle.remove();
    state.root = null;
    state.toggle = null;
    state.layers = [];
    state.bases = [];
  }

  function teardown(restore) {
    const banner = bannerEl();
    removeOurNodes();
    if (restore && banner) restoreOriginal(banner);
  }

  function paint(progress) {
    const homing = typeof progress === 'number';
    for (let i = 0; i < state.layers.length; i++) {
      const layer = state.layers[i];
      const item = state.bases[i];
      let m = new DOMMatrix(item.transform);
      let move = state.moveX * item.a;
      let s = item.f ? item.f * state.moveX + 1 : 1;
      let g = state.moveX * (item.g || 0);
      if (homing) {
        m.e = lerp(state.moveX * item.a + item.transform[4], item.transform[4], progress);
        move = 0;
        s = lerp(item.f ? item.f * state.moveX + 1 : 1, 1, progress);
        g = lerp(item.g ? item.g * state.moveX : 0, 0, progress);
      }
      m = m.multiply(new DOMMatrix([m.a * s, m.b, m.c, m.d * s, move, g]));
      if (item.deg) {
        const deg = homing ? lerp(item.deg * state.moveX, 0, progress) : item.deg * state.moveX;
        m = m.multiply(new DOMMatrix([Math.cos(deg), Math.sin(deg), -Math.sin(deg), Math.cos(deg), 0, 0]));
      }
      if (item.opacity) {
        layer.style.opacity = String(homing && state.moveX > 0
          ? lerp(item.opacity[1], item.opacity[0], progress)
          : lerp(item.opacity[0], item.opacity[1], (state.moveX / window.innerWidth) * 2));
      }
      layer.style.transform = String(m);
    }
  }

  function onEnter(event) {
    state.initX = event.clientX;
    if (state.homing) cancelAnimationFrame(state.homing);
    state.homing = 0;
  }

  function onMove(event) {
    state.moveX = event.clientX - state.initX;
    if (state.raf) return;
    state.raf = requestAnimationFrame(function () {
      state.raf = 0;
      paint();
    });
  }

  function onLeave() {
    const started = performance.now();
    const fromX = state.moveX;
    if (state.homing) cancelAnimationFrame(state.homing);
    const step = function (now) {
      const progress = Math.min((now - started) / HOMING_MS, 1);
      state.moveX = fromX;
      paint(progress);
      if (progress < 1) state.homing = requestAnimationFrame(step);
      else {
        state.homing = 0;
        state.moveX = 0;
      }
    };
    state.homing = requestAnimationFrame(step);
  }

  function layout(compensate) {
    state.bases = LAYERS.map(function (item) { return scaledBase(item, compensate); });
    for (let i = 0; i < state.layers.length; i++) {
      const item = LAYERS[i];
      const media = state.layers[i].firstElementChild;
      media.style.width = (item.width * compensate) + 'px';
      media.style.height = (item.height * compensate) + 'px';
      state.layers[i].style.transform = String(new DOMMatrix(state.bases[i].transform));
    }
  }

  function hex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function attachVideo(video, file) {
    const meta = VIDEO_META[file];
    const url = fileUrl(file, 'video');
    if (!meta || !url) return;
    const controller = new AbortController();
    state.aborts.push(controller);
    fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'force-cache',
      signal: controller.signal,
    }).then(function (response) {
      if (!response.ok) throw new Error('video status ' + response.status);
      return response.arrayBuffer();
    }).then(function (buffer) {
      if (controller.signal.aborted || !video.isConnected) return;
      if (buffer.byteLength !== meta.size) throw new Error('video size');
      const bytes = new Uint8Array(buffer);
      if (bytes[0] !== 0x1a || bytes[1] !== 0x45 || bytes[2] !== 0xdf || bytes[3] !== 0xa3) {
        throw new Error('video magic');
      }
      return crypto.subtle.digest('SHA-256', buffer).then(function (digest) {
        if (hex(digest) !== meta.sha256) throw new Error('video hash');
        if (controller.signal.aborted || !video.isConnected) return;
        const blobUrl = URL.createObjectURL(new Blob([buffer], { type: 'video/webm' }));
        video.dataset.blobUrl = blobUrl;
        video.src = blobUrl;
        video.play().catch(function () {});
      });
    }).catch(function (error) {
      if (error && error.name === 'AbortError') return;
      video.dataset.meteorError = '1';
    });
  }

  function buildRoot(banner) {
    const root = document.createElement('div');
    root.id = 'meteor-hook-root';
    root.dataset.theme = THEME;
    root.setAttribute('data-meteor-hook', '1');
    const compensate = (banner.clientWidth || window.innerWidth) > DESIGN_WIDTH
      ? (banner.clientWidth || window.innerWidth) / DESIGN_WIDTH
      : 1;
    state.bases = LAYERS.map(function (item) { return scaledBase(item, compensate); });
    LAYERS.forEach(function (item, index) {
      if (item.tagName !== 'img' && item.tagName !== 'video') return;
      const layer = document.createElement('div');
      layer.className = 'meteor-hook-layer';
      layer.dataset.index = String(index);
      layer.style.transform = String(new DOMMatrix(state.bases[index].transform));
      if (item.opacity) layer.style.opacity = String(item.opacity[0]);
      const media = document.createElement(item.tagName);
      media.alt = '';
      media.referrerPolicy = 'no-referrer';
      media.draggable = false;
      media.style.width = (item.width * compensate) + 'px';
      media.style.height = (item.height * compensate) + 'px';
      if (typeof item.blur === 'number') media.style.filter = 'blur(' + item.blur + 'px)';
      if (item.tagName === 'video') {
        media.loop = true;
        media.muted = true;
        media.defaultMuted = true;
        media.autoplay = true;
        media.playsInline = true;
        media.setAttribute('playsinline', '');
        media.disablePictureInPicture = true;
        attachVideo(media, item.file);
      } else {
        const src = fileUrl(item.file, 'img');
        if (!src) return;
        media.decoding = 'async';
        media.loading = 'lazy';
        media.src = src;
      }
      layer.appendChild(media);
      root.appendChild(layer);
      state.layers.push(layer);
    });
    const credit = document.createElement('p');
    credit.className = 'meteor-hook-credit';
    credit.textContent = THEME + ' · 动态分层来自 Shawn Phang / palxiao/bilibili-banner（MIT）';
    root.appendChild(credit);
    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    state.onBlur = onLeave;
    window.addEventListener('blur', state.onBlur);
    state.onResize = function () {
      if (!state.root || !state.root.isConnected) return;
      const host = bannerEl();
      const width = (host && host.clientWidth) || window.innerWidth;
      const next = width > DESIGN_WIDTH ? width / DESIGN_WIDTH : 1;
      layout(next);
    };
    window.addEventListener('resize', state.onResize);
    return root;
  }

  function buildToggle() {
    const button = document.createElement('button');
    button.id = 'meteor-hook-toggle';
    button.type = 'button';
    button.textContent = state.disabled ? '启用流星横幅' : '恢复原横幅';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!state.disabled) {
        state.disabled = true;
        const banner = bannerEl();
        removeOurNodes();
        restoreOriginal(banner);
        if (banner) banner.appendChild(buildToggle());
      } else {
        state.disabled = false;
        if (state.toggle) state.toggle.remove();
        state.toggle = null;
        ensure();
      }
    });
    state.toggle = button;
    return button;
  }

  function ensureStyle() {
    if (document.getElementById('meteor-hook-style')) return;
    const style = document.createElement('style');
    style.id = 'meteor-hook-style';
    style.textContent = [
      '#meteor-hook-root{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:auto;}',
      '#meteor-hook-root .meteor-hook-layer{position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;}',
      '#meteor-hook-root img,#meteor-hook-root video{user-select:none;pointer-events:none;max-width:none;background:transparent;}',
      '#meteor-hook-root .meteor-hook-credit{position:absolute;left:12px;bottom:6px;z-index:2;margin:0;max-width:70%;color:#fff;font-size:12px;line-height:1.4;text-shadow:0 1px 2px rgba(0,0,0,.65);pointer-events:none;}',
      '#meteor-hook-toggle{position:absolute;right:12px;bottom:8px;z-index:3;padding:4px 8px;border:1px solid rgba(255,255,255,.7);border-radius:6px;background:rgba(0,0,0,.45);color:#fff;font-size:12px;line-height:1.4;cursor:pointer;}',
    ].join('');
    document.documentElement.appendChild(style);
  }

  function ensure() {
    if (!isHome()) {
      teardown(true);
      return;
    }
    if (state.disabled) return;
    const banner = bannerEl();
    if (!banner) return;
    ensureStyle();
    suppressOriginal(banner);
    if (state.root && state.root.isConnected && state.root.dataset.theme === THEME && state.layers.length === LAYERS.length) {
      if (!state.toggle || !state.toggle.isConnected) banner.appendChild(buildToggle());
      return;
    }
    removeOurNodes();
    state.root = buildRoot(banner);
    banner.insertBefore(state.root, banner.firstChild);
    banner.appendChild(buildToggle());
    state.toggle.textContent = '恢复原横幅';
  }

  function tick() {
    if (!isHome()) {
      teardown(true);
      return;
    }
    if (state.disabled) {
      const banner = bannerEl();
      if (banner && (!state.toggle || !state.toggle.isConnected)) {
        ensureStyle();
        banner.appendChild(buildToggle());
      }
      return;
    }
    ensure();
  }

  ensure();
  state.poll = window.setInterval(tick, 1000);
  window.addEventListener('popstate', tick);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      state.layers.forEach(function (layer) {
        const media = layer.firstElementChild;
        if (media && media.tagName === 'VIDEO') media.pause();
      });
    } else {
      state.layers.forEach(function (layer) {
        const media = layer.firstElementChild;
        if (media && media.tagName === 'VIDEO' && media.src) media.play().catch(function () {});
      });
    }
  });
})();
