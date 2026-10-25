(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* 1. 入场动效：滚动到视口时逐个浮现 */
  var revealables = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    revealables.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* 2. 首屏三张照片缓慢交叉淡入 */
  var heroImgs = Array.prototype.slice.call(
    document.querySelectorAll(".hero-img")
  );
  var heroOn = 0;

  if (heroImgs.length > 1 && !reduceMotion.matches) {
    window.setInterval(function () {
      heroImgs[heroOn].classList.remove("is-on");
      heroOn = (heroOn + 1) % heroImgs.length;
      heroImgs[heroOn].classList.add("is-on");
    }, 5200);
  }

  /* 3. 项目详情弹窗 */
  var projects = {
    blog: {
      title: "个人博客",
      meta: "个人项目 · 2024 — 至今",
      body:
        "用 Hexo 搭建的静态博客，部署在 GitHub Pages 上。自己挑的主题、改配色和排版，写过一些学习笔记和踩坑记录。从本地写作到自动部署，跑通了完整的发布流程。",
      stack: "Hexo · Markdown · GitHub Actions · Sass"
    },
    library: {
      title: "图书借阅系统",
      meta: "课程设计 · 2024",
      body:
        "覆盖借阅、归还、逾期提醒与检索的完整流程。前后端分离，接口按功能分层，数据库设计了借阅记录与状态流转。是第一次把一门课的知识完整落到一个能用的系统上。",
      stack: "Java · Spring Boot · MySQL · Vue"
    },
    gomoku: {
      title: "五子棋网络对战",
      meta: "个人项目 · 2025",
      body:
        "局域网内的双人对战，带一个基于评估函数的简单 AI。处理了落子同步、悔棋与胜负判定，网络层用长连接推送状态，能和室友稳定地下一整晚。",
      stack: "JavaScript · WebSocket · Canvas"
    },
    weather: {
      title: "天气小组件",
      meta: "个人项目 · 2025",
      body:
        "调用开放天气接口的桌面小工具，展示当日与未来三天的天气，支持多城市切换与自动刷新。体积很小，主要是为了把请求缓存和异常降级写清楚。",
      stack: "Python · Tkinter · Requests"
    }
  };

  var dialog = document.getElementById("proj-dialog");

  if (dialog && typeof dialog.showModal === "function") {
    var dlgTitle = dialog.querySelector(".dlg-title");
    var dlgMeta = dialog.querySelector(".dlg-meta");
    var dlgBody = dialog.querySelector(".dlg-body");
    var dlgStack = dialog.querySelector(".dlg-stack");
    var dlgClose = dialog.querySelector(".dlg-close");
    var lastTrigger = null;

    document.querySelectorAll(".project-open").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var data = projects[btn.getAttribute("data-project")];
        if (!data) return;
        dlgTitle.textContent = data.title;
        dlgMeta.textContent = data.meta;
        dlgBody.textContent = data.body;
        dlgStack.textContent = data.stack;
        lastTrigger = btn;
        dialog.showModal();
      });
    });

    dlgClose.addEventListener("click", function () {
      dialog.close();
    });

    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", function () {
      if (lastTrigger) lastTrigger.focus();
    });
  }

  /* 4. 邮箱一键复制 */
  var copyBtn = document.querySelector(".copy-btn");

  if (copyBtn) {
    var doneTimer = null;

    var markDone = function () {
      var mail = copyBtn.getAttribute("data-mail");
      copyBtn.classList.add("is-done");
      copyBtn.textContent = "已复制";
      window.clearTimeout(doneTimer);
      doneTimer = window.setTimeout(function () {
        copyBtn.classList.remove("is-done");
        copyBtn.textContent = mail;
      }, 2000);
    };

    var legacyCopy = function () {
      var mail = copyBtn.getAttribute("data-mail");
      var ta = document.createElement("textarea");
      ta.value = mail;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try {
        done = document.execCommand("copy");
      } catch (err) {
        done = false;
      }
      document.body.removeChild(ta);
      if (done) markDone();
      else window.prompt("自动复制失败，请手动复制：", mail);
    };

    copyBtn.addEventListener("click", function () {
      var mail = copyBtn.getAttribute("data-mail");

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(mail).then(markDone, legacyCopy);
      } else {
        legacyCopy();
      }
    });
  }

  /* 5. 导航高亮当前分区 */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-links a")
  );
  var sections = navLinks
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle(
              "is-active",
              a.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (sec) {
      spyObserver.observe(sec);
    });
  }
  /* 6. 留言表单：校验与反馈 */
  var form = document.getElementById("msg-form");

  if (form) {
    var note = form.querySelector(".form-note");
    var fields = ["f-name", "f-mail", "f-msg"].map(function (id) {
      return document.getElementById(id);
    });

    var say = function (text, kind) {
      note.textContent = text;
      note.classList.toggle("is-error", kind === "error");
      note.classList.toggle("is-ok", kind === "ok");
    };

    var markField = function (input, bad) {
      input.closest(".field").classList.toggle("is-bad", bad);
    };

    fields.forEach(function (input) {
      input.addEventListener("input", function () {
        markField(input, false);
        if (note.classList.contains("is-error")) say("", "");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstBad = null;

      fields.forEach(function (input) {
        var value = input.value.trim();
        var bad =
          !value ||
          (input.type === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        markField(input, bad);
        if (bad && !firstBad) firstBad = input;
      });

      if (firstBad) {
        say("名字、邮箱和留言都得填一下。", "error");
        firstBad.focus();
        return;
      }

      say("收到了。不过这是个静态页面，真有事请直接发邮件给我。", "ok");
      form.reset();
      fields.forEach(function (input) {
        markField(input, false);
      });
    });
  }
})();
