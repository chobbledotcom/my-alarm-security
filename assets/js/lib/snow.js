var Snow = function (options) {
  var container = document.getElementById(options.id);
  if (!container) return;

  container.style.position = "fixed";
  container.style.top = 0;
  container.style.left = 0;
  container.style.right = 0;
  container.style.bottom = 0;
  container.style.zIndex = 1000;
  container.style.pointerEvents = "none";

  //create canvas
  this.canvas = document.createElement("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  container.appendChild(this.canvas);

  //get theme
  var theme = "default";
  if (
    options.theme == "colors" ||
    options.theme == "blues" ||
    options.theme == "watermelon" ||
    options.theme == "berry" ||
    options.theme == "pastel"
  ) {
    theme = options.theme;
  }

  //change size
  var min = 2;
  var max = 7;
  if (!isNaN(options.min_size)) {
    min = options.min_size;
  }
  if (!isNaN(options.max_size)) {
    max = options.max_size;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  //snowflake constructor
  var Snowflake = function (canvas, theme, min, max) {
    this.radius = random(min, max);
    this.x = random(0, canvas.width);
    this.y = random(-20, -800);
    this.Vy = random(1, 2);
    this.color = "#FFF";

    if (theme == "colors") {
      this.color =
        "rgb(" +
        Math.floor(Math.random() * 256) +
        "," +
        Math.floor(Math.random() * 256) +
        "," +
        Math.floor(Math.random() * 256) +
        ")";
    } else if (theme == "blues") {
      this.color = "rgb(0,0," + Math.floor(Math.random() * 256) + ")";
    } else if (theme == "watermelon") {
      if (Math.random() < 0.5) {
        this.color =
          "rgb(" +
          random(242, 255) +
          "," +
          random(0, 50) +
          "," +
          random(70, 120) +
          ")";
      } else {
        this.color = "rgb(0," + Math.floor(Math.random() * 256) + ",0)";
      }
    } else if (theme == "berry") {
      this.color =
        "rgb(" +
        random(40, 150) +
        "," +
        random(0, 50) +
        "," +
        random(80, 180) +
        ")";
    } else if (theme == "pastel") {
      this.color =
        "hsla(" +
        random(0, 360) +
        "," +
        random(40, 80) +
        "%," +
        random(60, 80) +
        "%)";
    }
    this.canvas = canvas;

    this.show = function () {
      var ctx = this.canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    };

    this.update = function () {
      this.y += this.Vy;
    };
  };

  //snowflake list
  this.snowflakes = [];
  for (var i = 0; i < 250; i++) {
    this.snowflakes[i] = new Snowflake(this.canvas, theme, min, max);
    this.snowflakes[i].show();
  }

  //boolean is snow is true or false
  this.go = false;
  var self = this;
  this.snowfall = function () {
    requestAnimationFrame(function () {
      self.snowfall();
    });

    if (self.go) {
      var context = self.canvas.getContext("2d");
      context.clearRect(0, 0, self.canvas.width, self.canvas.height);

      for (var i = 0; i < 250; i++) {
        self.snowflakes[i].update();
        self.snowflakes[i].show();

        if (self.snowflakes[i].y > self.canvas.height) {
          self.snowflakes[i].y = random(-20, -200);
        }
      }
    }
  };

  this.snowfall();

  this.start = function () {
    this.go = true;
  };

  this.stop = function () {
    this.go = false;
  };

  this.toggle = function () {
    this.go = !this.go;
  };

  // Handle window resize
  var resizeCanvas = function () {
    self.canvas.width = window.innerWidth;
    self.canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resizeCanvas);
};

// Auto-initialization with Turbo support
(function () {
  var snowInstance = null;

  function initSnow() {
    if (snowInstance) {
      snowInstance.stop();
      var oldContainer = document.getElementById("snow-container");
      if (oldContainer) oldContainer.remove();
    }
    var container = document.createElement("div");
    container.id = "snow-container";
    document.body.appendChild(container);
    snowInstance = new Snow({ id: "snow-container" });
    snowInstance.start();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initSnow();
  } else {
    document.addEventListener("DOMContentLoaded", initSnow);
  }
  document.addEventListener("turbo:load", initSnow);
})();
